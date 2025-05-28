import {React, useEffect, useState} from 'react'
import { useParams } from 'react-router-dom';
import { io } from "socket.io-client";
import socketsLive from './SocketsLive';
import DataApi from './Api';
import './Room.css';

function Room() {
    const params = useParams();
    const { eventId,roomId } = params;

    const [scores, setScores] = useState({
        home: '',
        away:'',
        status: '',
        homeScore:'0',
        awayScore:'0',
    });
    const [odds, setOdds] = useState({
      'Both Teams to Score': [],
      'Fulltime Result': [],
      'Over/Under Line': []
      });
    const [selections, setSelections] = useState([]);
    const [oddsMap, setOddsMap] = useState(new Map());

    const makeOddKey = (odd) =>
         `${odd.odd_name}-${odd.type}-${odd.handicap || ""}`;

    const isSelected = (odd) => selections.includes(makeOddKey(odd));

    async function updateOdds(eventId) {
      const odds = await DataApi.getLiveOdds(eventId);

      const newMap = new Map();
          Object.entries(odds).forEach(([oddName, group]) => {
            if (Array.isArray(group)) {
              group.forEach((odd) => newMap.set(makeOddKey(odd), odd));
            } else {
              Object.entries(group).forEach(([handicap, oddsArray]) => {
                oddsArray.forEach((odd) => newMap.set(makeOddKey(odd), odd));
              });
            }
          });
      setOddsMap(newMap);
      setOdds(odds);
    }

    useEffect(() => {
      const fetchDataAndStartSocket = async () => {

        const socket = socketsLive(eventId, setScores, scores, updateOdds);
        const event = await DataApi.getEvent(eventId);
        updateOdds(eventId);
        setScores(event);
          return () => socket && socket.close();
      };

      fetchDataAndStartSocket();
    },[]);

  
    const handleSelect = (odd) => {
      const key = makeOddKey(odd);
      setSelections((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
      console.log(selections);
    };

    const handleSubmit = () => {
      if (selections.length === 0) {
        alert("Please select at least one option.");
        return;
      }

      const selectedOdds = selections.map((key) => oddsMap.get(key));
      console.log("Submitting bets:", selectedOdds);
    };

  return (
    <div>
      <h1>
        {scores.home} vs {scores.away}
      </h1>
      <h2>
        {scores.status} - {scores.homeScore} : {scores.awayScore}
      </h2>

      <div className="bets">
        {Object.entries(odds).map(([oddName, group]) => (
          <div key={oddName}>
            <h3>{oddName}</h3>
            <div className="options">
              {Array.isArray(group) ? (
                group.map((odd) => (
                  <button
                    key={makeOddKey(odd)}
                    onClick={() => handleSelect(odd)}
                    className={isSelected(odd) ? "selected" : ""}
                  >
                    <b>
                      {odd.type} {odd.handicap ? odd.handicap : ""} —
                    </b>{" "}
                    {odd.value}
                  </button>
                ))
              ) : (
                Object.entries(group).map(([handicap, oddsArray]) => (
                    <div className="options">
                      {oddsArray.map((odd) => (
                        <button
                          key={makeOddKey(odd)}
                          onClick={() => handleSelect(odd)}
                          className={isSelected(odd) ? "selected" : ""}
                        >
                          <b>
                            {odd.type} {handicap} —
                          </b>{" "}
                          {odd.value}
                        </button>
                      ))}
                    </div>
                ))
              )}
            </div>
          </div>
        ))}

        <div>
          <button className="submit-button" onClick={handleSubmit}>
            Select Bet
          </button>
        </div>
      </div>
    </div>
  );
}

export default Room;