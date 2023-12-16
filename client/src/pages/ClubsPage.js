import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ClubCard from '../components/ClubCard';

import PlayerCard from '../components/PlayerCard';

const config = require('../config.json');

export default function ClubsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedClubCode, setSelectedClubCode] = useState(null);

  /**
  const clubNameLike = req.query.clubName ?? '';
  const location = req.query.location ?? '';
  const minStadiumSize = req.query.minStadiumSize ?? 0;
  const maxStadiumSize = req.query.maxStadiumSize ?? 999999;
  const minTotalGames = req.query.minTotalGames ?? 0;
  const maxTotalGames = req.query.maxTotalGames ?? 999999;
  const minTotalWins = req.query.minTotalWins ?? 0;
  const maxTotalWins = req.query.maxTotalWins ?? 999999;
   */

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [stadiumSize, setStadiumSize] = useState([0, 999999]);
  const [totalGames, setTotalGames] = useState([0, 999999]);
  const [totalWins, setTotalWins] = useState([0, 999999]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/getClubs`)
      .then(res => res.json())
      .then(resJson => {
        const clubsWithId = resJson.map((club) => ({ id: club.club_id, ...club }));
        setData(clubsWithId);
        console.log(clubsWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/getClubs?clubName=${name}` +
      `&location=${location}` +
      `&minStadiumSize=${stadiumSize[0]}&maxStadiumSize=${stadiumSize[1]}` +
      `&minTotalGames=${totalGames[0]}&maxTotalGames=${totalGames[1]}` +
      `&minTotalWins=${totalWins[0]}&maxTotalWins=${totalWins[1]}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const clubsWithId = resJson.map((club) => ({ id: club.club_id, ...club }));
        setData(clubsWithId);
      });
  }

  const setClubInfo = (params) => {
    setSelectedClubId(params.row.club_id)
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'club_code', headerName: 'club_code', renderCell: (params) => (
        <Link onClick={() => setClubInfo(params)}>{params.value}</Link>
    ) },
    { field: 'domestic_competition_id', width: 200, headerName: 'Location' },
    { field: 'stadium_name', width: 200, headerName: 'Stadium' },
    { field: 'stadium_seats', width: 200, headerName: 'Stadium Seats' },
    { field: 'squad_size', width: 200, headerName: 'Squad Size' },
    { field: 'net_transfer_record', width: 200, headerName: 'Net Transfer Record' }
    // how do we add total games and total wins here when they're not columns
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container>
      {selectedClubId && <ClubCard clubId={selectedClubId} clubCode={selectedClubCode} handleClose={() => setSelectedClubId(null)} />}
      <h2>Search Clubs</h2>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <TextField label='Location' value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={4}>
          <p>Stadium Size</p>
          <Slider
            value={stadiumSize}
            min={1000}
            max={100000} 
            step={1000}
            onChange={(e, newValue) => setStadiumSize(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Total Games</p>
          <Slider
            value={totalGames}
            min={0}
            max={999} // someone who knows realistic game numbers needs to change these 
            step={10}
            onChange={(e, newValue) => setTotalGames(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Total Wins</p>
          <Slider
            value={totalWins}
            min={0}
            max={999}
            step={10}
            onChange={(e, newValue) => setTotalWins(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>

      <h2>Clubs</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
}