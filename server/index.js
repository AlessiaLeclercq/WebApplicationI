'use strict';

const express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const userDao = require("./userDao");
const dao = require("./dao");

// passport setup
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const { check, validationResult, param } = require('express-validator');

// init express
const app = express();
const port = 3001;

// middlewares 
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials : true
};
app.use(cors(corsOptions));

// Passport local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb){
  const user = await userDao.getUser(username, password);
  if(!user)
    return cb(null, false, "Incorrect username or password");
  
    return cb(null, user);
}));


passport.serializeUser(function(user, cb){
  cb(null, user);
});

passport.deserializeUser(function(user, cb){
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(401).json({error: "Not Authorized"});
}

app.use(session({
  secret: "The secret",
  resave: false, 
  saveUninitialized : false,
}));

app.use(passport.authenticate("session"));
//*************************************************************************************************
// GETS ALL FLIGHTS
app.get('/api/flights', async(req, res)=>{
  try{
    const flights = await dao.getFlights();
    res.json(flights);
  }
  catch{
    res.status(500).end();
  }
});

// GETS INFO RELATED TO THE FLIGHT IDENTIFIED BY flightId
app.get('/api/flights/:flightId', [check('flightId').isInt({min:1, max:3})],
async(req, res)=>{

  //Validation check 
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({error: "Bad request: Invalid flightId"});
  }
  
  try{
    const flight = await dao.getFlight(req.params.flightId);
    res.json(flight);
  }
  // If any other error occurs
  catch(err){
    res.status(500).json({error: "Internal Server Error"});
  }
});


// GETS THE SEATS RELATED TO THE FLIGHT IDENTIFIED BY flightId
app.get('/api/flights/:flightId/seats', [check('flightId').isInt({min:1, max:3})],
async(req,res) =>{

  //Validation check 
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({error: "Bad request: Invalid flightId"});
  }

  try{
    const seats = await dao.getSeatsOf(req.params.flightId);
    res.json(seats);
  }
  // If any other error occurs
  catch(err){
    res.status(500).json({error: "Internal Server Error"});
  }
});

//DELETES THE BOOKING ASSOCIATED TO THE USER
app.delete('/api/flights/:flightId/booking', isLoggedIn, 
 [check('flightId').isInt({min:1, max:3})], async(req,res) =>{

    //Validation check 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({error: "Bad request: Invalid flightId"});
    }

    try{
      //If no update nUpdates = 0 but still returns 200 and updateSeats is performed
      const nUpdates = await dao.cancelBooking(req.params.flightId, req.user.id);
      await dao.updateSeats(req.params.flightId, nUpdates, "add");
      res.status(200).json({});
    }
    catch{
      res.status(503).json({error: "Impossible to cancel the booking"});
    }
});


// INSERTS A BOOKING GIVEN THE AUTHENTICATED USER AND THE FLIGHT IDENTIFIED BY flightId (SEATS ARE SPECIFIED IN req.body.list)
app.post('/api/flights/:flightId/booking',isLoggedIn, 
[check('flightId').isInt({min:1, max:3}), 
check('list').isArray({min:1}), check('list.*').isInt({min:1, max:310})], async(req,res) =>{
  
  //Validation check 
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({error: "Bad request: check for flight Id or empty seats list"});
  }

  const currentUser = req.user.id;
  const requestedSeats = req.body.list;

  try{
    // Retrieved the already booked seats 
    const alreadyBooked = await dao.checkAvailability(requestedSeats);
    if(alreadyBooked.length>0)
      //If I got some result, then retrieve that some seats were already booked
      return res.status(428).json({'booked': alreadyBooked.map(seat => seat.id)});
    else{ 
      // If empty list then I can proceed with booking
      const nUpdates = await dao.book(currentUser, requestedSeats);
      await dao.updateSeats(req.params.flightId, nUpdates, "sub");
      res.status(200).json({});
    }
  }
  catch{
    res.status(503).json({error: "Impossible to add the booking"});
  }
});



// LOGIN
app.post('/api/sessions', passport.authenticate('local'), (req, res)=>{
    return res.json(req.user);
});

// LOGOUT
app.delete("/api/sessions/current", (req, res)=>{
  req.logout(()=>{
    res.end();
  });
});

// GETS AUTHENTICATED USER
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) 
    res.json(req.user);
  else
    res.status(401).json({error: 'Not authenticated'});
});

// ACTIVATE THE SERVER
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});