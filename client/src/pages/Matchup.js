import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const config = require('../config.json');

export default function Matchup() {
  const [pageSize, setPageSize] = useState(10);
  const [mpmatchup, setMpMatchup] = useState({});
  const [matchupStats, setMatchupStats] = useState([]);

  const [homeClub, setHome] = useState('');
  const [awayClub, setAway] = useState('');

/* 
  const home_club_name = req.query.home_club_name ?? '';
  const away_club_name = req.query.away_club_name ?? '';
*/

useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/getMostPlayedMatchup`)
      .then(res => res.json())
      .then(resJson => {
        setMpMatchup(resJson);
      });
  }, []);

  // useEffect(() => {
  //   // Hint: here is some pseudocode to guide you
  //   fetch(`http://${config.server_host}:${config.server_port}/getMatchupStats`)
  //     .then(res => res.json())
  //     .then(resJson => {
  //       setMatchupStats([{id: 0, ...resJson}]);
  //       console.log(resJson);
  //     });
  // }, []);

  const matchup = () => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/getMatchupStats?home_club_name=${homeClub}` +
    `&away_club_name=${awayClub}`)
      .then(res => res.json())
      .then(resJson => {
        setMatchupStats([{id: 0, ...resJson}]);
        console.log(resJson);
      });
  }
  /**
   * "total_games":0,
   * "team1_wins":null,
   * "team2_wins":null,
   * "draws":null,
   * "team1_goals":null,
   * "team2_goals":null,
   * "top_scorer":null,
   * "top_assister":null,
   * "top_appearances":null,
   * "most_played_competition":null
   */

  const columns = [
    { field: 'total_games', headerName: 'Total Games' },
    { field: 'team1_wins', headerName: 'Club 1 Wins' },
    { field: 'team2_wins', headerName: 'Club 2 Wins' },
    { field: 'draws', headerName: 'Draws' },
    { field: 'team1_goals', headerName: 'Club 1 Goals' },
    { field: 'team2_goals', headerName: 'Club 2 Goals' },
    { field: 'top_scorer', headerName: 'Top Scorer' },
    { field: 'top_assister', headerName: 'Top Assister' },
    { field: 'top_appearances', headerName: 'Top Appearances' },
    { field: 'most_played_competition', headerName: 'Most Played Competition' }
  ]
  
//   const matchup = () => {
//     fetch(`http://${config.server_host}:${config.server_port}/getMatchupStats?home_club_name=${homeClub}` +
//       `&away_club_name=${awayClub}`
//     )
//       .then(res => res.json())
//       .then(resJson => {
//         // DataGrid expects an array of objects with a unique id.
//         // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
//         const playersWithId = resJson.map((player) => ({ id: player.player_id, ...player }));
//         setData(playersWithId);
//       });
//   }

  return (
        <Box
            p={3}
            style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 1200 }}
        >
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField label='Club 1' value={homeClub} onChange={(e) => setHome(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <TextField label='Club 2' value={awayClub} onChange={(e) => setAway(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
      </Grid>

      <Button onClick={() => matchup() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>

      <DataGrid
          rows={matchupStats}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
      />
        
    </Box>
  );
}