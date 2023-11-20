import { useEffect, useState } from 'react';
import { Container, Divider, Link, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';


const config = require('../config.json');

export default function HomePage() {


  return (
    <Container>
      <h1>Welcome to our Soccer Analysis Platform!</h1>
    </Container>
  );
};