import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import PlayerCard from '../components/PlayerCard';

const config = require('../config.json');

export default function TransfersPage() {
  const [pageSize, setPageSize] = useState(10);
  const [transferData, setTransferData] = useState([]);
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  const [name, setName] = useState('');
  const [clubName, setClubName] = useState('');
  const [year, setYear] = useState([1993, 2023]);
  const [age, setAge] = useState([0, 100]);
  const [fee, setFee] = useState([0, 100]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/getTransfers`)
      .then(res => res.json())
      .then(resJson => {
        const transfersWithId = resJson.map((transfer) => ({ id: ""+transfer.transfer_id + "" +transfer.club_id + "", ...transfer }));
        setTransferData(transfersWithId);
        console.log(transfersWithId);
      });
  }, []);

  useEffect(() => {
    console.log(transferData)
  }, [transferData]);



  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/getTransfers?name=${name}` +
      `&clubName=${clubName}` +
      `&minYear=${year[0]}&maxYear=${year[1]}` +
      `&minAge=${age[0]}&maxAge=${age[1]}` +
      `&minFeeCleaned=${fee[0]}&maxFeeCleaned=${fee[1]}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const transfersWithId = resJson.map((transfer) => ({ id: ""+transfer.transfer_id + "" +transfer.club_id + "", ...transfer }));
        setTransferData(transfersWithId);
      });
  }



  
  const columns = [
    { field: 'player_name', headerName: 'Player Name', width: 300},
    { field: 'year', width: 300, headerName: 'Year' },
    { field: 'transfer_period', width: 300, headerName: 'Transfer Period' },
    { field: 'fee_cleaned', width: 300, headerName: 'Fee (Million Euros)' },
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
      <h2>Search Transfers</h2>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={6}>
          <TextField label='Club' value={clubName} onChange={(e) => setClubName(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={4}>
          <p>Year</p>
          <Slider
            value={year}
            min={1990}
            max={2023}
            step={1}
            onChange={(e, newValue) => setYear(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Age</p>
          <Slider
            value={age}
            min={0}
            max={100}
            step={1}
            onChange={(e, newValue) => setAge(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={4}>
          <p>Fee</p>
          <Slider
            value={fee}
            min={0}
            max={10}
            step={.1}
            onChange={(e, newValue) => setFee(newValue)}
            valueLabelDisplay='auto'
          />
      </Grid>
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
      </Button>

      <h2>Transfers</h2>
      {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
      <DataGrid
        rows={transferData}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
}