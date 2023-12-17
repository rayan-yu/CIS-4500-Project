import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Modal, Stack } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { getRowIdFromRowModel } from '@mui/x-data-grid/hooks/features/rows/gridRowsUtils';

const config = require('../config.json');

// SongCard is a modal (a common example of a modal is a dialog window).
// Typically, modals will conditionally appear (specified by the Modal's open property)
// but in our implementation whether the Modal is open is handled by the parent component
// (see HomePage.js for example), since it depends on the state (selectedSongId) of the parent
export default function PlayerCard({ playerId, handleClose }) {
 
  const [playerData, setPlayerData] = useState({});
  const [playerStats, setPlayerStats] = useState([]);
  const [playerGame, setPlayerGame] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  let temp = 0;

  // TODO (TASK 20): fetch the song specified in songId and based on the fetched album_id also fetch the album data
  // Hint: you need to both fill in the callback and the dependency array (what variable determines the information you need to fetch?)
  // Hint: since the second fetch depends on the information from the first, try nesting the second fetch within the then block of the first (pseudocode is provided)
  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/players/${playerId}`)
      .then(res => res.json())
      .then(resJson => {
        setPlayerData(resJson)
      })

      
   
  }, [playerId]);

  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/getPlayerStats/${playerId}`)
      .then(res => res.json())
      .then(resJson => {
        setPlayerStats([{id: 0, ...resJson}]);
      });
  }, [playerId]);

  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/getBestGame/${playerId}`)
      .then(res => res.json())
      .then(resJson => {
        setPlayerGame([{id: 0, ...resJson}]);
      });
  }, [playerId]);

  

  const columns = [
    { field: 'career_appearances', headerName: 'Appearances' },
    { field: 'career_minutes', headerName: 'Minutes' },
    { field: 'career_goals', headerName: 'Goals' },
    { field: 'career_assists', headerName: 'Assists' },
    { field: 'career_yellow_cards', headerName: 'Yellow Cards' },
    { field: 'career_red_cards', headerName: 'Red Cards' },
    { field: 'market_value_in_eur', headerName: 'Market Value (Euro)' },
  ]

  const columns2 = [
    { field: 'goals', width: 200, headerName: 'Goals' },
    { field: 'assists', width: 200, headerName: 'Assists' },
    { field: 'total_contribution', width: 200, headerName: 'Total' },
    
  ]
  
  
  

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>{playerData.name}</h1>
        <div>
          <img src={playerData.image_url} style={{width: "30%"}}/>
          <div style={{marginLeft: "10%", display: "inline-block"}}> 
            <p>Date of Birth:&nbsp;
          {playerData.date_of_birth}</p>
          <p>Country of Birth:&nbsp;
          {playerData.country_of_birth}</p>
          <p>Nationality:&nbsp;
          {playerData.country_of_citizenship}</p>
          <p>Position:&nbsp;
          {playerData.position}</p>
          <p>Foot:&nbsp;
          {playerData.foot}</p>
          <p>Height:&nbsp;
          {playerData.height_in_cm}</p>
          </div>
        </div>
        <h2>Current Team:&nbsp;
          {playerData.current_club_name}
        </h2>

        <DataGrid
        rows={playerStats}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />

      <Stack>
        <h3>Best Game</h3>
      <DataGrid
        rows={playerGame}
        columns={columns2}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />

      </Stack>



        
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  );
}
