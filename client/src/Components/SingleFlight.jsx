import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert} from "react-bootstrap";
import { useParams } from "react-router-dom";
import BookingForm from "./BookingForm";
import API from "../API";
import PlaneGrid from "./PlaneGrid";
import "./App.css";


function SingleFlight(props) {
    const params = useParams();

    const [flight, setFlight] = useState();
    const [seatStatus, setSeatStatus] = useState([]);
    /* Gets the number of reservations for theuser otherwise 0 */
    const [totReservations, setTotReservations] = useState(0);
    /* Contains the number of occupied seats */
    const [totOccupied, setTotOccupied] = useState();
    /* Helps in case of multiuser conflict: contains ids of conflicting seats  */
    const [conflict, setConflict] = useState([]);
    /* Contais if the user has a booking */
    const [hasBooking, setHasBooking] = useState(false);

    /*FUNZIONE PER REHYDRATING
    1. Find the flight
    2. Find the seats 
    3. Find occupied seats
    4. Check if user has a booking */
    const getSeatStatus = async () => {
        try{
            const flight = await API.getFlight(params.flightId);
            const response = await API.getSeatsOf(params.flightId);
            const occupied = response.filter(s => s.booked===1).length;
            const booking = props.loggedUser && response.filter(s=> s.user===props.loggedUser.id).length>0;
            setFlight(flight);
            setSeatStatus(response);
            setTotOccupied(occupied);
            setTotReservations(0);
            setHasBooking(booking);
        }
        catch(e){}
    };

    /* FUNCTION TO DELETE A BOOKING */
    const cancelBooking = async(flightId) => {
        //Message for slow server
        props.setMessage({msg : "We are performing your operation...", status: "light"});
        try{
            const response = await API.deleteBooking(flightId);
            props.setMessage(); 
        }
        catch(err){
            // Notify for 2s we had an issue
            props.setMessage({msg: "We couldn't cancel your reservation", status :"danger"});
            setTimeout(() => {props.setMessage()}, 2000); 
        }
        getSeatStatus();  //Rehydrating
    };


    /* FUNCTION TO ADD A BOOKING */
    const addBooking = async(seatList) => {
        //Message for slow server
        props.setMessage({msg : "We are performing your operation...", status: "light"});
        try{
            const response = await API.bookFlight(flight.id, seatList);
            props.setMessage();
            if(response.booked){
                //If at least one requested seat has been found to be already occupied display it and highlight
                setConflict([...response.booked]);
                props.setMessage({msg: "Another user booked the blue highlighted seats", status:"danger"});
                setTimeout(() => {getSeatStatus(); setConflict([]); props.setMessage()}, 5000); //Rehydrating and reset states
            }
            else
                //If everuthing fine then only rehydrating the page
                getSeatStatus();
            }
        
            catch(err){
                /* If we have an error  notify it for two seconds */
                props.setMessage({msg: "We couldn't proceed with your reservation", status:"danger"});
                setTimeout(()=>{props.setMessage()}, 2000);
            } 
    };

    /* FUNCTION TO CANCEL A RESERVATION IN 2D VISUALIZATION: delete the "reserved" attribute for all requested seats */
    const cancelReservation = () => {
        setSeatStatus(oldStatus => oldStatus.map(seat => {if(seat.reserved) 
                                                            delete seat.reserved
                                                        return seat;}
        ));
        setTotReservations(0);
    }

    /* FIND FLIGHT AND SEATS
    Needs to change when loggedUser changes since we want to reset seats we set the reserved attribute */
    useEffect(() => {
        getSeatStatus();
    }, [props.loggedUser]);

    // Nothing to display if useEffect has not finished
    if(!flight || !seatStatus) return (<></>)

    // Page rendering
    return (
        <>  
            {/* Notification display*/}
            {props.message && 
            <Row>
                <Alert variant= {props.message.status} onClose={()=>props.setMessage()} dismissible>{props.message.msg}</Alert>
            </Row>
            }
            {/* Header with statistics */}
            <FlightInformations flightNumber={flight.number} loggedUser={props.loggedUser} 
            totSeats={seatStatus.length} totOccupied={totOccupied} 
            totReservations={totReservations} hasBooking={hasBooking}/>
            {// Check user authentication
            props.loggedUser? 
                /* If user is authenticated
                1. Notify IF the user has already a booking for the flight and enable the user to cancel it
                2. Enable the user tomake reservations/booking and indicate how many seats he requested */                   
                <LoggedView flight={flight} seats={seatStatus} hasBooking={hasBooking}
                loggedUser={props.loggedUser} totReservations={totReservations} totOccupied={totOccupied}
                setTotReservations = {setTotReservations}
                cancelBooking={cancelBooking} addBooking={addBooking}
                cancelReservation={cancelReservation} conflict={conflict}/>                
                :
                /* If user is not authenticated 
                1 SHow 2D seats representation with occupied seats */
                <NotLoggedView nCols={flight.p} seats={seatStatus} hasBooking={hasBooking}
                    loggedUser={props.loggedUser} conflict={conflict}
                    setTotReservations = {setTotReservations}
                />
            }
        </>
    );
}

function FlightInformations(props){
    /* Header must show:
    With logged user:
        1. Total number of seats
        2. Number of occupied seats 
        3. Number of aiavilable seats
    With non-logged user:
        1. Total number of seats
        2. Number of occupied seats 
        3. Number of aiavilable seats
        4. Number of requestes seats 
    */

    
    return(
    <Container fluid>
            {/*total + occupied + available*/}
            <Row>
                <h2>Flight {props.flightNumber}</h2>
                <p>It is your lucky day! This flight can host a <strong>total</strong> of <strong>{props.totSeats}</strong> passengers!</p>
            </Row>
            <Row>
                <Col><p>Currently only <strong>{props.totSeats - props.totOccupied - props.totReservations}</strong> seats are <strong>available</strong></p></Col>
                <Col><p>Currently <strong>{props.totOccupied}</strong> seats are <strong>occupied</strong></p></Col>
            </Row>
            { // Npotify the user he must authenticate to make a reservation
            !props.loggedUser && <Row><p className="notify-p">Please login to book the flight</p></Row>
            }
            { // Display the number of requested seats if authenticated user + has no reservation for the flight
            props.loggedUser && !props.hasBooking && <Row><p>At the moment you <strong>requested {props.totReservations}</strong> seats</p></Row>
            }
    </Container>
    );
}

function NotLoggedView(props){
    /*Qui deve essere mostrato aereo con posti occupati o liberi*/
    return(
        <PlaneGrid nCols={props.nCols} seats={props.seats} hasBooking={props.hasBooking}
        loggedUser={props.loggedUser} setTotReservations = {props.setTotReservations} conflict={props.conflict}/>
    );
}

function LoggedView(props){
    return(<>
        {
        /* If the user has already a reservation enable the user to delete it */
        props.hasBooking?
        <Container fluid>
            <Row>
                <Col><p className="booked-notify"><strong>You already booked this flight.</strong></p>
                <Button variant="danger" onClick={() => props.cancelBooking(props.flight.id, props.loggedUser.id)}>
                    Delete reservation</Button></Col></Row>
        </Container>
        :
        /* Otherwise, if the user has no reservation yet he can make one: 
        1. Form he sets how many seats to reserve and autometically assign
        2. 2D visualization in which available/requested/occupied seats are shown  */
        <BookingForm seats={props.seats} totOccupied={props.totOccupied} addBooking={props.addBooking}/>
        }
        <PlaneGrid nCols={props.flight.p} seats={props.seats} hasBooking={props.hasBooking}
                    loggedUser={props.loggedUser}
                    setTotReservations = {props.setTotReservations}
                    addBooking = {props.addBooking} cancelReservation = {props.cancelReservation}
                    conflict={props.conflict}
        />
        </>
    );
}

export default SingleFlight;