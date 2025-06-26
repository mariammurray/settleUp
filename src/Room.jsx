import {React, useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { socket as roomSocket} from './socket';
import socketsLive from './SocketsLive';
import DataApi from './Api';

function Room() {
    const params = useParams();
    const { eventId,roomId } = params;
    let url = "/room/" + eventId + "/" + roomId;
    const navigate = useNavigate();

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
    const [user, setUser] = useState(localStorage.getItem('username'));
    const [betSubmitted, setBetSubmitted] = useState(false);
    const [currentBet, setCurrentBet] = useState(null);
    const [otherBets, setOtherBets] = useState([]);

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
      roomSocket.on("connect", () => {
        console.log("Socket connected:", roomSocket.id);
      });

      return () => {
        roomSocket.off("connect");
      };
    }, []);
    useEffect(() => {
      const fetchDataAndStartSocket = async () => {

        if (!user) {
            navigate('/username', {
            state: { url: url }
            })
        }
        const event = await DataApi.getEvent(eventId);
        updateOdds(eventId);
        setScores(event);
        roomSocket.emit("join-room", roomId, localStorage.getItem('username')); 
          return () => roomSocket && roomSocket.close();
      };

      fetchDataAndStartSocket();
    },[]);

    useEffect(() => {
      roomSocket.on("bets-update", (bets) => {
        const others = bets.filter((b) => b.user !== user);
        setOtherBets(others);
      });

      return () => {
        roomSocket.off("bets-update");
      };
    }, [user]);

  
    const handleSelect = (odd) => {
      const key = makeOddKey(odd);
      setSelections((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const handleSubmit = () => {
      if (selections.length === 0) {
        alert("Please select at least one option.");
        return;
      }

      const selectedOdds = selections.map((key) => oddsMap.get(key));
      console.log("Submitting bets:", selectedOdds);

      setCurrentBet(selectedOdds);
      setBetSubmitted(true);
      roomSocket.emit("submit-bet", { roomId, user, bet: selectedOdds });
    };

  return (
  <div className="min-h-screen bg-lime-950 text-white px-4 py-6">
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="w-full bg-lime-950 text-3xl font-bold text-center text-lime-100 py-4 px-2 rounded-lg shadow-md"
      style={{ backgroundColor: '#0f1a0f' }}>
        {scores.home}{" "}
        <span className="animate-pulse text-4xl font-extrabold text-white">
          {scores.homeScore} : {scores.awayScore}
        </span>{" "}
        {scores.away}
      </h1>

      <h2 className="text-xl text-center text-lime-300">
        {scores.status}
      </h2>
      {!betSubmitted ? (
      <div className="space-y-8">
        {Object.entries(odds).map(([oddName, group]) => (
          <div key={oddName}>
            <h3 className="text-lg font-semibold mb-2 text-lime-200">{oddName}</h3>

            <div className="flex flex-wrap gap-2">
              {Array.isArray(group)
                ? group.map((odd) => (
                    <button
                      key={makeOddKey(odd)}
                      onClick={() => handleSelect(odd)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        isSelected(odd)
                          ? "bg-lime-600 border-lime-700 text-white"
                          : "bg-lime-800 border-lime-900 hover:bg-lime-700 text-lime-100"
                      }`}
                    >
                      <b>
                        {odd.type} {odd.handicap ? odd.handicap : ""} —
                      </b>{" "}
                      {odd.value}
                    </button>
                  ))
                : Object.entries(group).map(([handicap, oddsArray]) => (
                    <div className="flex flex-wrap gap-2 mb-4" key={handicap}>
                      {oddsArray.map((odd) => (
                        <button
                          key={makeOddKey(odd)}
                          onClick={() => handleSelect(odd)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            isSelected(odd)
                              ? "bg-lime-600 border-lime-700 text-white"
                              : "bg-lime-800 border-lime-900 hover:bg-lime-700 text-lime-100"
                          }`}
                        >
                          <b>
                            {odd.type} {handicap} —
                          </b>{" "}
                          {odd.value}
                        </button>
                      ))}
                    </div>
                  ))}
            </div>
          </div>
        ))}

        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-3 bg-lime-600 hover:bg-lime-500 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Select Bet
          </button>
        </div>
      </div>
        ) : ( 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-lime-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Your Bet</h3>
          {currentBet.map((odd, i) => (
            <p key={i} className="text-lime-200">{odd.type} {odd.handicap || ''} — {odd.value}</p>
          ))}
        </div>

        {otherBets.map(({ user: otherUser, bet }, idx) => (
          <div key={idx} className="bg-lime-700 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{otherUser}'s Bet</h3>
            {bet.map((odd, i) => (
              <p key={i} className="text-lime-300">{odd.type} {odd.handicap || ''} — {odd.value}</p>
            ))}
          </div>
        ))}
      </div>
        )}
    </div>

  </div>
);

}

export default Room;