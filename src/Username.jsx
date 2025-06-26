import {React, useState} from 'react'
import { useLocation, useNavigate } from 'react-router-dom';


function Username(login) {
  const location = useLocation();
  const navigate = useNavigate();
  const { url } = location.state || {};
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem('username', username);
    navigate(url);
  }


return (
  <div className="min-h-screen bg-lime-950 flex items-center justify-center px-4">
    <form
      onSubmit={handleSubmit}
      className="bg-lime-900 p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-4 text-center"
    >
      <h2 className="text-2xl font-bold text-lime-100">Set Your Username</h2>

      <input
        type="text"
        placeholder="Your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg bg-lime-800 text-white placeholder-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-500"
      />

      <button
        type="submit"
        className="w-full bg-lime-600 hover:bg-lime-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Let's go!
      </button>
    </form>
  </div>
);
}

export default Username