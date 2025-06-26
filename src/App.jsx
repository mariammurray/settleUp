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

  

//   function socketsLive(){
//   const APIkey = import.meta.env.VITE_API_KEY;
//   var socket  = new WebSocket('wss://wss.apifootball.com/livescore?APIkey='+APIkey+'&timezone=+03:00');
  
// 	console.log('Connecting...');	
// 	socket.onopen = function(e) {
// 		alert('Connected');
// 		console.log('Connected');
// 		console.log('Waiting data...');
// 	}		  
// 	socket.onmessage = function(e) {
// 		alert( e.data );
// 		if (e.data) {
// 			var data = JSON.parse(e.data);
// 			console.log(data);
// 		} else {
// 			console.log('No new data!');
// 		}
// 	}
// 	socket.onclose = function(){
// 		setTimeout(socketsLive, 5000);
// 	}

// }
// socketsLive();




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
