"use strict";

const SERVER_URL = "http://localhost:3001";

// LOGIN 
const login = async(username, password) => {
    const response = await fetch(SERVER_URL+"/api/sessions", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({username, password})
    });

    if(response.ok){
        const user = await response.json();
        return user;
    }
    else{
        const errDetails = await response.text();
        throw errDetails;
    }
};

// LOGOUT
const logout = async() => {
    const response = await fetch(SERVER_URL+"/api/sessions/current", {
        method:"DELETE", 
        credentials:"include"
    });
    if(response.ok)
        return null;
};

// GETS INFORMATION ASSOCIETS TO THE USER IF ANY IS AUTHENTICATED
const getUserInfo = async () => { 
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) 
      return user;
    else 
      throw user; 
}


// GETS ALL FLIGHTS 
const getFlights = async() =>{
    const response = await fetch(SERVER_URL + "/api/flights");
    const flights = await response.json();
    if(response.ok)
        return flights;
    else
        throw new Error(flights.error);
};

// GETS A SINGLE FLIGHT IDENTIFIED BY flightID
const getFlight = async(flightID) =>{
    const response = await fetch(SERVER_URL + `/api/flights/${flightID}`);
    const flight = await response.json();
    if(response.ok)
        return flight;
    else
        throw new Error(flight.error);
};

// GETS THE SEATS OF THE FLIGHT IDENTIFIED BY flightID
const getSeatsOf = async(flightID) =>{
    const response = await fetch(SERVER_URL + `/api/flights/${flightID}/seats`);
    const seatsJson = await response.json();
    if(response.ok)
        return seatsJson;
    else
        throw new Error(seatsJson.error);
};

// DELETES THE BOOKING ASSOCIATED TO THE FLIGHT IDENTIFIED BY flightId AND THE AUTHENTICATED USER
const deleteBooking = async(flightId) => {
    const response = await fetch(`${SERVER_URL}/api/flights/${flightId}/booking`, {
        method: "DELETE",
        headers : {"Content-Type":"application/json"},
        credentials:"include"
    });

    const result = await response.json();

    if(!response.ok)
        throw(result);
    else 
        return result;
}

// BOOKS THE SEATS IN seatList FOR THE FLIGHT DENTIFIED BY flightId FOR THE AUTHENTICATED USER
const bookFlight = async (flightId, seatList) =>{
    const response = await fetch(SERVER_URL +`/api/flights/${flightId}/booking`, {
        method : "POST",
        headers : {"Content-Type":"application/json"},
        credentials: "include",
        body: JSON.stringify({list : seatList})
    });
    const result = await response.json();
    if(response.ok)
        return result;
    else if(!response.ok && result.booked) //Case somethign already booked
        return result;
    else
        throw result;
}


const API = {login, logout, getFlights, getFlight, getSeatsOf, getUserInfo, deleteBooking, bookFlight};
export default API;