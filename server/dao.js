"use strict";

const sqlite = require("sqlite3");

const db = new sqlite.Database('airplane.sqlite', (err) => {
  if (err) throw err;
});


exports.getFlights = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM planes";
        db.all(sql, [], (err, rows)=>{
            if(err) reject(err);
            resolve(rows);
        });
    });
};


exports.getFlight = (flightId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM planes where id = ?";
        db.get(sql, [flightId], (err, row)=>{
            if(err) reject(err);
            else resolve(row);
        });
    });
};


exports.getSeatsOf = (flightId) => {
    return new Promise((resolve, reject)=>{
        const sql = "SELECT * FROM seats WHERE flight = ?"
        db.all(sql, [flightId], (err, rows)=>{
            if(err) reject(err);
            resolve(rows);
        });
    });
};

exports.cancelBooking = (flightId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE seats SET booked = 0, user = NULL WHERE flight = ? AND user = ?";
        db.run(sql, [flightId, userId], function(err){
            if(err) reject(err);
            resolve(this.changes);
        });
    });
}


exports.book = (userId, seatArray) => {
        return new Promise((resolve, reject)=>{
            const string =  seatArray.map(()=>"?").join(",");
            const sql = "UPDATE seats SET booked=1, user=? WHERE id IN (" + seatArray.map(()=>"?").join(",") + ")";
            db.run(sql, [userId, ...seatArray], function(err){
                if(err) reject(err);
                resolve(this.changes);
            });
        });
}

exports.checkAvailability= (seatArray) =>{
    return new Promise((resolve, reject)=> {
        const sql = "SELECT id FROM seats WHERE booked=1 AND id IN (" + seatArray.map(()=>"?").join(",") + ')';
        db.all(sql, [...seatArray], (err, rows)=>{
            if(err) reject(err);
            else resolve(rows);
        });
    })
} 

exports.updateSeats = (flightId, available, operation) => {
    if(operation === "add")
        return new Promise((resolve, reject)=> {
            const sql = "UPDATE planes SET available= available + ? WHERE id = ?";
            db.run(sql, [available, flightId], function(err){
                if(err) reject(err);
                resolve(this.changes);
            })
        });
    else
        return new Promise((resolve, reject)=> {
            const sql = "UPDATE planes SET available= available - ? WHERE id = ?";
            db.run(sql, [available, flightId], function(err){
                if(err) reject(err);
                resolve(this.changes);
            })
        });
}
