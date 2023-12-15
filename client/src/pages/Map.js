import { useEffect, useState } from 'react';
import { Container, Divider, Link, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import soccer from '../soccer.svg';


const config = require('../config.json');

export default function Map() {

  return (
    <Container>
      <h1>Welcome to FootyFacts!</h1>
      <img style={{ justifyContent: "center", alignItems: "center", width: "80%", height: "80%"}} src={soccer}></img>
    </Container>
  );
};