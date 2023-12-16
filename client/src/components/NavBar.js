import { AppBar, Button, Container, Toolbar } from '@mui/material';
import { NavLink } from 'react-router-dom';
import footylogo from '../footylogo.png';

function NavButton({ href, text, isMain }) {
  const commonStyles = {
    fontFamily: 'Verdana, Geneva, sans-serif',
    fontWeight: 700,
    letterSpacing: '.2rem',
    color: 'inherit',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s ease'
  };

  return (
    <Button
      component={NavLink}
      to={href}
      style={{
        ...commonStyles,
        marginRight: isMain ? 'auto' : '10px', // Adjust the spacing for non-main links
        borderRadius: '20px', // Set border-radius for rounded corners
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight shading on hover
        }
      }}
    >
      {isMain && <img src={footylogo} alt="FootyFacts Logo" style={{ marginRight: '10px', height: '30px' }} />}
      {text}
    </Button>
  );
}

export default function NavBar() {
  return (
    <AppBar position='static' style={{ backgroundColor: '#D6F5AD' }}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavButton href='/' text='' isMain />
          <NavButton href='/players' text='Players' />
          <NavButton href='/clubs' text='Clubs' />
          <NavButton href='/transfers' text='Transfers' />
          <NavButton href='/comparison' text='Compare' />
        </Toolbar>
      </Container>
    </AppBar>
  );
}