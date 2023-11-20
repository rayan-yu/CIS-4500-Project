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

// HW 2 routes
// app.get('/author/:type', routes.author);
// app.get('/random', routes.random);
// app.get('/song/:song_id', routes.song);
// app.get('/album/:album_id', routes.album);
// app.get('/albums', routes.albums);
// app.get('/album_songs/:album_id', routes.album_songs);
// app.get('/top_songs', routes.top_songs);
// app.get('/top_albums', routes.top_albums);
// app.get('/search_songs', routes.search_songs);

// 450 final project routes
app.get('/author/:type', routes.author);
app.get('/players', routes.players);
app.get('/players/:player_id', routes.player);
app.get('/clubs', routes.clubs);
app.get('/clubs/:club_id', routes.club);
app.get('/competitions', routes.competitions);
app.get('/competitions/:competition_id', routes.competition);
app.get('/games', routes.games);
app.get('/games/:game_id', routes.game);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
