import { useEffect, useState } from 'react';
import { Container, Divider, Link, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import soccer from '../soccer.svg';
import footylogo from '../footylogo.png';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Stack } from '@mui/material';


const config = require('../config.json');

export default function HomePage() {
  const [pageSize, setPageSize] = useState(10);
  const [funFact, setFunFact] = useState([]);

  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/getFunFact`)
      .then(res => res.json())
      .then(resJson => {
        const tableWithId = resJson.map((m) => ({ id: m.competition_id + m.pname + m.total_goals, ...m }));
        setFunFact(tableWithId);
      });
  }, []);

  const columns = [
    { field: 'pname', headerName: 'Name', width: 200},
    { field: 'cname', headerName: 'Competition', width: 200},
    { field: 'total_goals', headerName: 'Goals', width: 200 },
  ]
  


  return (
    <>
    <Container style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center', height: '70vh' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h2" style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}>Welcome to</Typography>
      <img style={{ width: '120%', height: '120%' }} src={footylogo} alt="FootyLogo" />
    </div>
    

    <img style={{ width: '50%', height: '50%' , marginLeft: '50px'}} src={soccer} alt="Soccer" />
  </Container>
  <Stack sx={{width: "70%", display: 'flex', flexDirection: 'column', alignItems: 'center', width: "100%"}}>
    <h3>Footy Fact of the Day: List of Player with most goals in different competitions</h3>
    <DataGrid
  rows={funFact}
  columns={columns}
  pageSize={pageSize}
  rowsPerPageOptions={[5, 10, 25]}
  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
  autoHeight
  style={{ backgroundColor: '#E7FACD', width: "40%" }}
/></Stack>
  
</>
  
  );
};