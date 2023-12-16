import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import PlayerCard from '../components/PlayerCard';

const config = require('../config.json');

export default function PlayersPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const [name, setName] = useState('');
  const [clubName, setClubName] = useState('');
  const [season, setSeason] = useState([0, 2023]);
  const [height, setHeight] = useState([0, 300]);

/* 
  const playerNameLike = req.query.name ?? '';
  const clubNameLike = req.query.clubName ?? '';
  const minSeason = req.query.minSeason ?? 1990;
  const maxSeason = req.query.maxSeason ?? 2023;
  const minHeight = req.query.minSeason ?? 0;
  const maxHeight = req.query.minSeason ?? 300;
  const [country, setCountry] = useState('');
  const [position, setPosition] = useState('');
  const [marketValue, setMarketValue] = useState([0, 1]);
*/

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/getPlayers`)
      .then(res => res.json())
      .then(resJson => {
        const playersWithId = resJson.map((player) => ({ id: player.player_id, ...player }));
        setData(playersWithId);
        console.log(playersWithId);
      });
  }, []);

  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/getPlayers?name=${name}` +
      `&clubName=${clubName}` +
      `&minSeason=${season[0]}&maxSeason=${season[1]}` +
      `&minHeight=${height[0]}&maxHeight=${height[1]}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const playersWithId = resJson.map((player) => ({ id: player.player_id, ...player }));
        setData(playersWithId);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'name', headerName: 'Name', width: 200, renderCell: (params) => (
        <Link onClick={() => setSelectedPlayerId(params.row.player_id)}>{params.value}</Link>
    ) },
    { field: 'country_of_birth', width: 200, headerName: 'Country' },
    { field: 'current_club_name', width: 200, headerName: 'Club' },
    { field: 'last_season', width: 200, headerName: 'Season' },
    { field: 'height_in_cm', width: 200, headerName: 'Height' },
    { field: 'position', width: 200, headerName: 'Position' },
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
      {selectedPlayerId && <PlayerCard playerId={selectedPlayerId} handleClose={() => setSelectedPlayerId(null)} />}
      <h2>Search Players</h2>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <TextField label='Club' value={clubName} onChange={(e) => setClubName(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <p>Season</p>
          <Slider
            value={season}
            min={1990}
            max={2023}
            step={1}
            onChange={(e, newValue) => setSeason(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={6}>
          <p>Height</p>
          <Slider
            value={height}
            min={100}
            max={300}
            step={1}
            onChange={(e, newValue) => setHeight(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>

      <h2>Players</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
        style={{ backgroundColor: '#E7FACD' }}
        
      />
    </Container>
  );
}