import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import PlayerCard from '../components/PlayerCard';

const config = require('../config.json');

export default function TransfersPage() {
  const [pageSize, setPageSize] = useState(10);
  const [transferData, setTransferData] = useState([]);
  const [transferId, setTransferId] = useState(null);
  const [selectedTransferName, setSelectedTransferName] = useState(null);
  const [data, setData] = useState([]);

  const [name, setName] = useState('');
  const [clubName, setClubName] = useState('');
  const [year, setYear] = useState([1990, 2023]);
  const [age, setAge] = useState([10, 50]);
  const [fee, setFee] = useState([0, 150]);

  console.log(data)

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
    console.log(selectedTransferName);
    fetch(`http://${config.server_host}:${config.server_port}/getPlayers?name=${selectedTransferName}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const playersWithId = resJson.map((player) => ({ id: player.player_id, ...player }));
        setData([playersWithId]);
        setTransferId(playersWithId[0].player_id);
      });
  }, [selectedTransferName]);



  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/getTransfers?name=${name}` +
      `&clubName=${clubName}` +
      `&clubName2=${clubName}`+
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
    { field: 'player_name', headerName: 'Player Name', width: 200, renderCell: (params) => (
      <Link onClick={() => setSelectedTransferName(params.row.player_name)}>{params.value}</Link>
  )},
    { field: 'year', headerName: 'Year' },
    { field: 'name', width: 200, headerName: 'Club 1' },
    { field: 'name2', width: 200, headerName: 'Club 2' },
    { field: 'transfer_period', width: 300, headerName: 'Transfer Period' },
    { field: 'fee_cleaned', width: 300, headerName: 'Fee (Million Euros)' },
  ]

  const handleCloseModal = () => {
    setSelectedTransferName(null);
    setTransferId(null);
  }

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  return (
    <Container maxWidth="xl">
      {selectedTransferName && <PlayerCard playerId={transferId} handleClose={() => handleCloseModal()} />}

      <Grid container spacing={12}  style={{ marginTop: '1px' }}>
        <Grid item xs={12} md={2.5}>
        <Typography variant="h5" style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}>Search Transfers</Typography>
          <TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", marginTop: '40px' }}/>
          <TextField label='Club' value={clubName} onChange={(e) => setClubName(e.target.value)} style={{ width: "100%", marginTop: '40px' }}/>
          <Typography style={{ marginTop: '30px' }}>Year</Typography>
          <Slider
            value={year}
            min={1990}
            max={2023}
            step={1}
            onChange={(e, newValue) => setYear(newValue)}
            valueLabelDisplay='auto'
          />
          <Typography style={{ marginTop: '20px' }}>Age</Typography>
          <Slider
            value={age}
            min={0}
            max={50}
            step={1}
            onChange={(e, newValue) => setAge(newValue)}
            valueLabelDisplay='auto'
          />
          <Typography style={{ marginTop: '20px' }}>Fee</Typography>
          <Slider
            value={fee}
            min={0}
            max={150}
            step={1}
            onChange={(e, newValue) => setFee(newValue)}
            valueLabelDisplay='auto'
          />
          <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)', marginTop: '20px', 
          borderRadius: '20px', // Set border-radius for rounded corners
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight shading on hover
          } }}>
          Search
        </Button>
      </Grid>

      <Grid item xs={12} md={9.5}>
        <Typography variant="h5" style={{ fontFamily: 'Verdana, Geneva, sans-serif', marginBottom: '20px' }}>Transfers</Typography>
        <DataGrid
          rows={transferData}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          autoHeight
          style={{ backgroundColor: '#E7FACD' }}
        />
      </Grid>
      </Grid>
    </Container>
  );
}