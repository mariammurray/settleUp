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
      <h1 className="w-full bg-lime-950 text-3xl font-bold text-center text-lime-100 py-4 px-2 rounded-lg shadow-md" style={{ backgroundColor: '#0f1a0f' }}> SettleUp!</h1>
      <div className="min-h-screen bg-lime-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-3xl font-bold mb-6 text-lime-200">What's On</h1>

          <div className="grid gap-4">
            {matches.map((match) => (
              <Link
                to="/username"
                onClick={(e) => newRoom(e, match.id)}
                key={match.id}
                className="block rounded-2xl bg-lime-800 hover:bg-lime-700 text-white px-6 py-4 text-lg font-medium shadow-md transition-colors duration-200"
              >
                {match.home} vs {match.away} at {match.time}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
);
}

export default Home