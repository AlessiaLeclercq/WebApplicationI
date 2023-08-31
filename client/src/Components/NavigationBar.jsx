import {Container, Button} from "react-bootstrap";
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import "./App.css";

function NavigationBar(props) {
    return (
        <Navbar className="navBar-color" sticky='top'>
            <Container fluid>
                <Link to="/" className="navbar-brand"><i className="bi bi-airplane"/> BookYourSeat.com</Link>
                {/*If the user is authenticated, then shows a button with its name*/}
                {props.loggedUser && <Button className="btn-user" disabled>{props.loggedUser.name}</Button>}
                {/*If the user is authenticated show Logout button otherwise Login Button*/}
                {
                    props.loggedUser ? 
                        <Button variant="outline-dark" onClick={props.logout}>Logout</Button> :
                        <Link to="/login" className="btn btn-outline-dark">Login</Link>
                }
            </Container>
        </Navbar>
    );
  }
  
  export default NavigationBar;