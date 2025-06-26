import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Home from './Home';
import Room from './Room';
import Username from './Username'
import DataApi from './Api';


function App() {
  const [matches, setMatches] = useState([]);
  let roomId;

  useEffect(() => {
    const fetchData = async () => {
      const events = await DataApi.getTodaysMatches();
      setMatches(events);
    };

    fetchData();
  }, []);

    const logout = () => {
    localStorage.setItem('username');
  };
    const login = () => {
    localStorage.removeItem('username');
  };


  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home matches = {matches} />} />
          <Route path="/room/:eventId/:roomId" element={<Room />} />
          <Route path="/username" element={<Username login = {login} roomId = {roomId}/>} />
        </Routes>
      </BrowserRouter>
  );

}
export default App
