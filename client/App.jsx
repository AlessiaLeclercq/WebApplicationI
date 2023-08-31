import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import {BrowserRouter, Routes, Route, Outlet} from "react-router-dom";
import NavigationBar from './Components/NavigationBar';
import { useEffect, useState } from 'react';
import LoginForm from './Components/Login';
import API from "./API";
import FlightsTable from './Components/FlightsTable';
import SingleFlight from './Components/SingleFlight';

function App() {
  const [loggedUser, setLoggedUser] = useState(undefined);
  const [message, setMessage] = useState();

  /* CHECK FOR AUTHENTICATION  */
  useEffect(() => {
    const checkAuth = async () => {
      try{
        const user = await API.getUserInfo(); 
        setLoggedUser(user);
      }
      catch(err){
        console.log(err.error);
      }
    }
    checkAuth()}, []);



  /* LOGIN AND LOGOUT MANAGEMENT FUNCTIONS */
  const handleLogout = async () => {
    await API.logout();
    setLoggedUser();
  }

  const handleLogin = async (username, password) => {
    try{
      const user = await API.login(username, password);
      setLoggedUser(user);
    }
    catch(err){
      throw(err);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element ={
          <>
            <NavigationBar loggedUser={loggedUser} logout={handleLogout}/>
            <Outlet />
          </>
      } >
          <Route index element={<FlightsTable loggedUser={loggedUser}/>} />
          <Route path="/flights/:flightId" element={<SingleFlight loggedUser={loggedUser}
          message = {message} setMessage={setMessage}/>} />
          <Route path="/login" element={<LoginForm login={handleLogin}/>} />
          <Route path='*' element={ <h1>Not Found</h1> } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
