import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function Home({matches}) {
    const navigate = useNavigate();

    matches ? console.log(matches) : console.log("no matches");
    
    function newRoom(e,eventId) {
    e.preventDefault();  //prevent from going to /username 

    const roomId = uuidv4();
    let url = "/room/" + eventId + "/" + roomId
        console.log(url);
    navigate('/username', {
      state: { url: url }
    });

  }

  return (
    <div>
        <button onClick={(e) => newRoom(e, "custom")}>Create Your Own Room</button>
        <div className='matchesDiv'>
            {matches.map((match) => (
            <Link to="/username" onClick={(e) => newRoom(e, match.id)} key={match.id}><h2>
                {match.home} vs {match.away} at {match.time}
            </h2></Link>
            ))}
        </div>
    </div>
  )
}

export default Home