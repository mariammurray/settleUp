import { useState } from "react";
import DataApi from "./Api";

function socketsLive(matchId, setScores, scores, updateOdds){
    const APIkey = import.meta.env.VITE_API_KEY;
    // const socket  = new WebSocket(`wss://wss.apifootball.com/livescore?APIkey=${APIkey}'&match_id=${matchId}`);
    const socket  = new WebSocket(`wss://wss.apifootball.com/livescore?APIkey=${APIkey}&match_id=${matchId}`);
	let previousData = {};

	console.log('Connecting...');	
	socket.onopen = function(e) {
		console.log('Connected');
	}		  
	socket.onmessage = function(e) {
		if (e.data) {
			const data = JSON.parse(e.data);
            const newData = data.map(m => ({
				home: m.match_hometeam_name,
				away: m.match_awayteam_name,
                status: m.match_status,
                homeScore: m.match_hometeam_score,
                awayScore: m.match_awayteam_score,
            })
            );

			// setScores(old => ({old, ...newData[0]}));
			console.log(previousData, newData[0])
			if (JSON.stringify(previousData) !== JSON.stringify(newData[0])){
				setScores(newData[0]);
				updateOdds();
			}
			previousData = newData;
		} else {
			console.log('No new data!');
		}
	}
	socket.onclose = function(){
		setTimeout(socketsLive, 5000);
	}

}

export default socketsLive;