const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js

// 450 final project routes
app.get('/players', routes.players);
app.get('/players/:player_id', routes.player);
app.get('/clubs', routes.clubs);
app.get('/clubs/:club_id', routes.club);
app.get('/getPlayers', routes.getPlayers);
// app.get('/competitions', routes.competitions);
// app.get('/competitions/:competition_id', routes.competition);
// app.get('/games', routes.games);
// app.get('/games/:game_id', routes.game);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
