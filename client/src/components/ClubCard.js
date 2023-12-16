import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Modal } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { getRowIdFromRowModel } from '@mui/x-data-grid/hooks/features/rows/gridRowsUtils';
import styled from 'styled-components';


const config = require('../config.json');



export default function ClubCard({ clubId, handleClose }) {
  const [clubData, setClubData] = useState({});
  const [value, setValue] = useState(0);
  const [clubStats, setClubStats] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [gameStats, setGameStats] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  // TODO (TASK 20): fetch the song specified in songId and based on the fetched album_id also fetch the album data
  // Hint: you need to both fill in the callback and the dependency array (what variable determines the information you need to fetch?)
  // Hint: since the second fetch depends on the information from the first, try nesting the second fetch within the then block of the first (pseudocode is provided)
  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/clubs/${clubId}`)
      .then(res => res.json())
      .then(resJson => {
        setClubData(resJson)
      })

      
  }, [clubId]);

  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/getPlayers?clubId=${clubId}&minSeason=${2022}&maxSeason=${2022}`)
      .then(res => res.json())
      .then(resJson => {
        const playersWithId = resJson.map((player) => ({ id: player.player_id, ...player }));
        setPlayerStats(playersWithId);
        console.log(playersWithId);
      });

        // Hint: here is some pseudocode to guide you
        fetch(`http://${config.server_host}:${config.server_port}/getGames?home_club_id=${clubId}&away_club_id=${clubId}`)
          .then(res => res.json())
          .then(resJson => {
            const playersWithId = resJson.map((player) => ({ id: player.game_id, ...player }));
            setGameStats(playersWithId);
            console.log(playersWithId);
          });

      
  }, [clubId]);



  
  const handleChange = (index) => {
    
  }


  

  const columnsPlayer = [
    { field: 'name', headerName: 'Name'},
    { field: 'country_of_birth', headerName: 'Country' },
    { field: 'last_season', headerName: 'Season' },
    { field: 'height_in_cm', headerName: 'Height' },
    { field: 'position', headerName: 'Position' },
  ]

  const columnsGame = [
    { field: 'home_club_name', width: 200, headerName: 'Home Team' },
    { field: 'away_club_name', width: 200, headerName: 'Away Team' },
    { field: 'home_club_goals', headerName: 'Home Goals' },
    { field: 'away_club_goals', headerName: 'Away Goals' },
    { field: 'season', headerName: 'Season'},
    { field: 'matchday', headerName: 'Matchday' },
    { field: 'date', width: 200, headerName: 'Date' },
    { field: 'stadium', width: 200, headerName: 'Stadium' },
    { field: 'attendance', headerName: 'Attendance' },
    { field: 'competition_type', width: 200, headerName: 'Competition Type' },
    
  ]
  
  
const Tab = styled.button`
  font-size: 20px;
  padding: 10px 60px;
  cursor: pointer;
  opacity: 0.6;
  background: white;
  border: 0;
  outline: 0;
  ${({ active }) =>
    active &&
    `
    border-bottom: 2px solid black;
    opacity: 1;
  `}
`;
const ButtonGroup = styled.div`
  display: flex;
`;
const types = ['Players', 'Games'];
function TabGroup() {
  const [active, setActive] = useState(types[0]);
  return (
    <>
      <ButtonGroup>
        {types.map(type => (
          <Tab
            key={type}
            active={active === type}
            onClick={() => setActive(type)}
          >
            {type}
          </Tab>
        ))}
      </ButtonGroup>
      <p />
      {active === 'Players' && <DataGrid
        rows={playerStats}
        columns={columnsPlayer}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />}
      {active === 'Games' && <DataGrid
        rows={gameStats}
        columns={columnsGame}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />}
    </>
  );
}

  

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
        <h2>Current Team:&nbsp;
          {clubData.club_code}
        </h2>

        <TabGroup/>

        
        
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  );
}
