const APIkey = import.meta.env.VITE_API_KEY;

class DataApi {
      
    static async getTodaysMatches(){
        const today = new Date();
        const dateYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        try {
            const res = await fetch(`https://apiv3.apifootball.com/?action=get_events&from=${dateYMD}&to=${dateYMD}-18&timezone=Europe/London&APIkey=${APIkey}`);
            const data = await res.json();
            const now = new Date();

            const timeFiltered = data.filter(match => {
            const [hours, minutes] = match.match_time.split(":").map(Number);
            const matchTime = new Date(now);
            matchTime.setHours(hours, minutes, 0, 0);
            const difference = matchTime - now;

            // Match started within last 2.5 hours or will start in next 0.5 hours
            return difference >= -9000000 && difference <= 5400000;
        });

            const matchesWithOdds = await Promise.all(
                timeFiltered.map(async match => {
                    const odds = await this.getLiveOdds(match.match_id);
                    return odds ? {
                        home: match.match_hometeam_name,
                        away: match.match_awayteam_name,
                        id: match.match_id,
                        time: match.match_time,
                        odds
                    } : null;
                })
            );
            const filtered = matchesWithOdds.filter(match => match !== null);

            return filtered;

        } catch (err) {
            console.log(err);
        }

    }

    static async getEvent(id){
        try{
            const res = await fetch(`https://apiv3.apifootball.com/?action=get_events&match_id=${id}&APIkey=${APIkey}`);
            let m = await res.json();
            m = m[0];
            // console.log(m);
            const filtered = {
			home: m.match_hometeam_name,
			away: m.match_awayteam_name,
            status: m.match_status,
            homeScore: m.match_hometeam_score,
            awayScore: m.match_awayteam_score,				
            };
            return filtered;
        } catch(err){
            console.log(err);
        }
    }

    static async getLiveOdds(id){
        try {
            const res = await fetch(`https://apiv3.apifootball.com/?action=get_live_odds_commnets&match_id=${id}&APIkey=${APIkey}`); //typo "commnets" is built into the API
            const m = await res.json();
            const liveOdds = m[id].live_odds
            let filter = liveOdds.filter(o => 
                o.odd_name == "Fulltime Result" ||
                o.odd_name == "Both Teams to Score" ||
                o.odd_name == "Over/Under Line"
            )
            const groupedOdds = {
                "Fulltime Result": [],
                "Both Teams to Score": [],
                "Over/Under Line": {}
                };

            filter.forEach((odd) => {
                if (odd.odd_name === "Over/Under Line") {
                    const line = odd.handicap || "default"; // fallback in case handicap is missing
                    if (!groupedOdds["Over/Under Line"][line]) {
                    groupedOdds["Over/Under Line"][line] = [];
                    }
                    groupedOdds["Over/Under Line"][line].push(odd);
                } else {
                    groupedOdds[odd.odd_name].push(odd);
                }
                });

        return groupedOdds;
        } catch(err){
            console.log(err);
        }
    }
        
}
export default DataApi;
