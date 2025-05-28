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
    <div >
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Set your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Let's go!</button>
      </form>
    </div>
  );
}

export default Username