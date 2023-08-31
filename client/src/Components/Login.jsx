import { useState } from "react";
import Form from 'react-bootstrap/Form';
import { Alert, Row} from 'react-bootstrap';
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

function LoginForm(props) {
    const [username, setUsername]= useState("");
    const [password, setPassword]= useState("");
    const [failure, setFailure] = useState();

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        // If it works Iget back to "/" otherwise I notfy I had an issue 
          props.login(username, password)
          .then(() => {setFailure(); navigate("/");})
          .catch(err=> setFailure(err))
    }

    return(
    <>
      {/* Notify the user something got wrong with the authentication */}
      {failure && <Row>
      <Alert variant="danger" onClose={()=>setFailure()} dismissible>{failure}</Alert>
      </Row>
      }
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mt-3">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" required minLength={1} value={username} onChange={(event) => setUsername(event.target.value)} />
      </Form.Group>
      <Form.Group className="mt-3 mb-2">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" required minLength={1} value={password} onChange={event => setPassword(event.target.value)} />
      </Form.Group>
      <Button type="submit" variant="warning">Login</Button>
    </Form>
    </>
  );
}


export default LoginForm;
