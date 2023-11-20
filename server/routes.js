const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));


// Route 1: GET /player/:id
const player = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Players
  WHERE player_id = '${req.params.player_id}'  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 2: GET /players
const players = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Players
  Order By player_name, player_id DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.send(data);
    }
  });
}

// Route 3: GET /game/:id
const game = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Games
  WHERE game_id = '${req.params.game_id}'  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 4: GET /games
const games = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Games
  Order By home_club_id, competition_id, away_club_id DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.send(data);
    }
  });
}

// Route 5: GET /club/:id
const club = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Clubs
  WHERE club_id = '${req.params.club_id}'  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 6: GET /clubs
const clubs = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Clubs
  Order By club_name, domestic_competition_id DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.send(data);
    }
  });
}

// Route 7: GET /competition/:id
const competition = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Competitions
  WHERE competition_id = '${req.params.competition_id}'  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data[0]);
    }
  });
}

// Route 8: GET /competitions
const competitions = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Competitions
  Order By competition_name, competition_id DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.send(data);
    }
  });
}

module.exports = {
  player,
  players,
  game,
  games,
  competition,
  competitions, 
  club,
  clubs,
}
