import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import PlayerCard from '../components/PlayerCard';
const config = require('../config.json');

export default function TransfersPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  const [name, setName] = useState('');

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/transfers`)
      .then(res => res.json())
      .then(resJson => {
        const TransfersWithId = resJson.map((Transfer) => ({ id: Transfer.transfer_id, ...Transfer }));
        setData(TransfersWithId);
        console.log(TransfersWithId);
      });
  }, []);


  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'player_name', headerName: 'Player Name', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedTransferId(params.row.player_name)}>{params.value}</Link>
    ) },
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
      {selectedTransferId && <PlayerCard playerId={selectedTransferId} handleClose={() => setSelectedTransferId(null)} />}
      <h2>Transfers</h2>
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