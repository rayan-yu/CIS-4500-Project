import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber, green, orange } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';

import PlayersPage from './pages/PlayersPage';
import ClubsPage from './pages/ClubsPage';
import TransfersPage from "./pages/TransfersPage";
import PlayerCard from "./components/PlayerCard";
import Map from "./pages/Map";
import Matchup from "./pages/Matchup";

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: green,
    secondary: orange,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/player/:id" element={<PlayersPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/matchup" element={<Matchup/>}/>
        </Routes>
      </BrowserRouter>

      <style>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #D6F5AD;
        }
      `}</style>

    </ThemeProvider>
  );
}