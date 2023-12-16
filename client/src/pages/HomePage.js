import { useEffect, useState } from 'react';
import { Container, Divider, Link, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import soccer from '../soccer.svg';
import footylogo from '../footylogo.png';


const config = require('../config.json');

export default function HomePage() {


  return (
    <Container style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center', height: '100vh' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h2" style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}>Welcome to</Typography>
      <img style={{ width: '120%', height: '120%' }} src={footylogo} alt="FootyLogo" />
    </div>

    <img style={{ width: '50%', height: '50%' , marginLeft: '50px'}} src={soccer} alt="Soccer" />
  </Container>
  
  );
};