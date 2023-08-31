import { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";


function BookingForm(props){
    const [reservations, setReservations] = useState(0);
    const availability = props.seats.length - props.totOccupied;

    const handleSubmit = (event) => {
        event.preventDefault();
        // I choose the first #reservations free seats
        const chosenSeats = props.seats.filter(s=>s.booked===0).slice(0, reservations).map(seat=>seat.id);
        props.addBooking(chosenSeats);
    }

    const handleReset = (event) => {
      event.preventDefault();
      // Cancelling the reservation means we need to set the number of reservations to 0
      setReservations(0);
    }

    return(
        <Container className="mt-3" style={{border: '3px solid black'}}>
        <Form onSubmit={handleSubmit} onReset={handleReset}className="mb-3">
        <Form.Group className="mt-3">
          <Form.Label>Select how many seats to reserve</Form.Label>
          <Form.Control type="number" min={1} max={availability} step={1} value={reservations} onChange={(event) => setReservations(event.target.value)} />
        </Form.Group>
        <Button className="mt-1" type="submit" variant="warning" >Book</Button>
        <Button className="mt-1" type="reset" variant="danger" >Cancel</Button>
      </Form>
      <p><em>*This procedure is only for randomly assigned seats.</em></p>
      </Container>
    );
}

export default BookingForm;