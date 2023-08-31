import {Button, Container, Row, Col} from "react-bootstrap";
import "./App.css"

function PlaneGrid(props){
    /*  Divide the seats array in F subarrays of P elements each */
    let chunks = Array.from({length: Math.ceil(props.seats.length / props.nCols)}, (_, i) =>
        props.seats.slice(i * props.nCols, i * props.nCols + props.nCols));

        return(
            <>
            <Container className="mt-4 mb-4" style={{border: '3px solid black'}}>
                { /*If the user is authenticated notify how to use the platform  */
                props.loggedUser && !props.hasBooking && 
                <>
                    <Row className="mt-2"><p>Select your seats manually and click on the "Book" button</p></Row> 
                    <Row className="mt-2 mb-2">
                        <Col><Button variant="warning" onClick={() =>
                                                         props.addBooking(props.seats.filter(seat=>seat.reserved).map(seat=>seat.id))
                                                        }
                            >
                            Book</Button>
                        <Button variant="danger" onClick={() =>props.cancelReservation()}>Cancel</Button></Col>
                    </Row>
                </>
                }
                {
                    /* Map every sub.array into a row */
                    chunks.map(seatRow => <PlaneRow seats={seatRow} key={chunks.indexOf(seatRow)} 
                    loggedUser={props.loggedUser} hasBooking={props.hasBooking} 
                    setTotReservations={props.setTotReservations} conflict={props.conflict}/>)
                }
                
            </Container>
            </>
        );
}


function PlaneRow(props){
    return(
        <Row className="mt-3 mb-3"> 
            {
                props.seats.map(seat => <PlaneObject seat={seat} key={seat.id} 
                loggedUser={props.loggedUser} hasBooking={props.hasBooking}
                setTotReservations={props.setTotReservations}
                conflict={props.conflict}/>
                )
            }
        </Row>
    );

function PlaneObject(props){
    //Show seat state 
    
    const disableButton = () => {
        /* Button is disabled when 
        1. seat occupied (booked = 1)
        2. non authenticated user !props.loggedUser
        3. authenticated user who already has a booking for the flight
        */
       return props.seat.booked == 1 || !props.loggedUser || props.hasBooking;
    }

    const checkButtonStatus = () => {
        /* Buttons: 
            - Free (seat.booked = 0) white
            - Requested (seat.reserved) warning
            - Occupied (seat.booked = 1) red
        */
       if(props.seat.booked == 1) return "btn-occupied";
       if(props.conflict.indexOf(props.seat.id)>=0) return "btn-highlight";
       if(props.seat.reserved) return "btn-reserved";
       return "btn-free";
    }

    const changeButtonStatus = () => {
        /* Function to manage reversations
            1. If there is "reserved" attribute I dele it and decrement the number of reservations
            2. If no "reserved" attribute I set it and increment the number of reservations
        */
        if(props.seat.reserved){
            delete props.seat.reserved;
            props.setTotReservations(oldRes => oldRes-1);
        }
        else{
            props.seat.reserved = true;
            props.setTotReservations(oldRes => oldRes+1);
        }
    }

    return(
        <Col className="col text-center">
            {
                <Button className={checkButtonStatus()}
                disabled={disableButton()}
                onClick = {()=> {changeButtonStatus()}}>
                    {props.seat.text}</Button>
            }
        </Col>

    );
}
}


export default PlaneGrid;