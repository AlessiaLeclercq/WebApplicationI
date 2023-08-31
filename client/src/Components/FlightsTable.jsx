import { Container, Row, Table } from "react-bootstrap";
import {Link} from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../API";

function FlightsTable(){

    // State containing the flight list
    const [flights, setFlights] = useState([]);

    useEffect(()=>{
        const getFlights = async() =>{
        const flightList = await API.getFlights();
        setFlights(flightList);
        }
        getFlights();
    }, []);

    return(
    <Container fluid >
        <Row className="mb-1 mt-1">
                <h1>At the moment <strong>{flights.length}</strong> flights are available.</h1>
                <h2>Click on a flight to book your seats!</h2>
        </Row>
        <Table>
            <tbody>
                {flights.map(f => <FlightRow flight={f} key={f.id}/>)}
            </tbody>
        </Table>
    </Container>
    );
}

{/*Display the flight's info  and the number of available seats*/}
function FlightRow(props){
    return(
        <tr>
            <td><p>Flight number <strong>{props.flight.number}</strong></p></td>
            <td><p>Flight type: <em>{props.flight.type}</em></p></td>
            <td><p>Available seats: <em>{props.flight.available}</em></p></td>
            <td><Link to={`/flights/${props.flight.id}`} className="btn btn-warning"><i className="bi bi-airplane"></i></Link></td>
        </tr>
    );
}

export default FlightsTable;