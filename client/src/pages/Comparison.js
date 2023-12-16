import { useEffect, useState } from 'react';
import { Container, Divider, Link, Stack, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import soccer from '../soccer.svg';


const config = require('../config.json');

export default function Comparison() {

    const [matchup, setMatchup] = useState({});

    useEffect(() => {
        // Hint: here is some pseudocode to guide you
        fetch(`http://${config.server_host}:${config.server_port}/getMostPlayedMatchup`)
          .then(res => res.json())
          .then(resJson => {
            setMatchup(resJson);
          });
      }, []);

  return (
    <Container>
      <h4>Footy Fact: {matchup.home_club_name ? matchup.home_club_name : "____"} as the home team has played {matchup.away_club_name ? matchup.away_club_name : "____"} as the away team {matchup.match_count ? matchup.match_count: "____"} times, the most of any two teams in our dataset.</h4>
      <Stack direction={"row"} rowGap={"30%"}>
            <Stack>
                <h1>Team 1: </h1>

            </Stack>
            <Stack>
                <h1>Team 2: </h1>

            </Stack>
      </Stack>
    </Container>
  );
};