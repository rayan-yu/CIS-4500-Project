import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import PlayerCard from '../components/PlayerCard';
const config = require('../config.json');

export default function TeamsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const [name, setName] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/clubs`)
      .then(res => res.json())
      .then(resJson => {
        const clubsWithId = resJson.map((club) => ({ id: club.club_id, ...club }));
        setData(clubsWithId);
        console.log(clubsWithId);
      });
  }, []);


  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedTeamId(params.row.club_code)}>{params.value}</Link>
    ) },
    { field: 'stadium_name', width: 300, headerName: 'Stadium' },
    { field: 'squad_size', width: 300, headerName: 'Squad Size' },
    { field: 'net_transfer_record', width: 300, headerName: 'Net Transfer Record' },
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
      {selectedTeamId && <PlayerCard playerId={selectedTeamId} handleClose={() => setSelectedTeamId(null)} />}
      <h2>Search Teams</h2>
      <h2>Teams</h2>
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