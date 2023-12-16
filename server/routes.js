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

const players = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Players
  Order By last_name, first_name, player_id DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.send(data);
    }
  });
}

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
const clubs = async function(req, res) {
  connection.query(`
  SELECT *
  FROM Clubs
  Order By club_id, domestic_competition_id DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.send(data);
    }
  });
}

// Route 9: Get /getPlayers
const getPlayers = async function(req, res) {
  // Use placeholders for variables to prevent SQL injection
/*
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;

  const playsLow = req.query.plays_low ?? 0;
  const playsHigh = req.query.plays_high ?? 1100000000;
  const danceabilityLow = req.query.danceability_low ?? 0;
  const danceabilityHigh = req.query.danceability_high ?? 1;
  const energyLow = req.query.energy_low ?? 0;
  const energyHigh = req.query.energy_high ?? 1;
  const valenceLow = req.query.valence_low ?? 0;
  const valenceHigh = req.query.valence_high ?? 1;
  const explicit = req.query.explicit === 'true' ? 1 : 0;
*/
  const playerNameLike = req.query.name ?? '';
  const clubNameLike = req.query.clubName ?? '';
  const clubId = req.query.clubId ?? "%";
  const minSeason = req.query.minSeason ?? 1990;
  const maxSeason = req.query.maxSeason ?? 2023;
  const minHeight = req.query.minHeight ?? 0;
  const maxHeight = req.query.maxHeight ?? 300;
  // const country = req.query.country ?? '';
  // const position = req.query.position ?? '';
  // const foot = req.query.foot ?? '';
  // const clubNameLike = `%${req.query.clubName || ''}%`;
  // const minMarketValue = parseInt(req.query.minMarketValue, 10) || 0;
  // const maxMarketValue = parseInt(req.query.maxMarketValue, 10) || 999999999;
  //    what is this supposed to mean @cspeaker
  //     ${clubNameLike !== '%%' ? 'AND p.player_id IN (SELECT a.player_id FROM Appearances a JOIN Clubs c ON a.club_id = c.club_id WHERE c.name LIKE ‘%?%’)' : ''}
  /*
    AND p.country_of_citizenship = '%${country}%'
    AND p.position = '%${position}%'
    AND p.foot = '%${foot}%'
      AND p.height_in_cm BETWEEN ${minHeight} AND ${maxHeight}
    AND p.market_value_in_eur BETWEEN ${minMarketValue} AND ${maxMarketValue}
  */

    // if (clubNameLike !== '%%') {
  //   params.push(clubNameLike);
  // }
  connection.query(`
      SELECT *
      FROM Players
      WHERE first_name LIKE '%${playerNameLike}%'
        AND current_club_name LIKE '%${clubNameLike}%'
        AND current_club_id LIKE '${clubId}'
        AND height_in_cm BETWEEN ${minHeight} AND ${maxHeight}
        AND last_season BETWEEN ${minSeason} AND ${maxSeason}
        Order By last_name, first_name, player_id DESC
        `,
        (err, data) => {
          if (err) {
            console.log(err);
            res.json([]);
          } else {
            res.send(data);
          }
        });
}; 

// Route 9: Get /getGames
const getGames = async function(req, res) {
  
  const home_club = req.query.home_club_id ?? '%';
  const away_club = req.query.away_club_id ?? '%';
  
  connection.query(`
      SELECT *
      FROM Games
      WHERE home_club_id = '${home_club}'
      OR away_club_id = '${away_club}'
      ORDER BY season DESC
        `,
        (err, data) => {
          if (err) {
            console.log(err);
            res.json([]);
          } else {
            res.send(data);
          }
        });
}; 


// Route 10: GET getPlayerStats
const getPlayerStats = async function(req, res) {
  const playerId = req.params.player_id; // This should be a numeric ID
  const query = `
    SELECT 
      p.image_url,
      COUNT(a.player_id) AS career_appearances,
      COALESCE(SUM(a.minutes_played), 0) AS career_minutes,
      COALESCE(SUM(a.goals), 0) AS career_goals,
      COALESCE(SUM(a.assists), 0) AS career_assists,
      COALESCE(SUM(a.yellow_cards), 0) AS career_yellow_cards,
      COALESCE(SUM(a.red_cards), 0) AS career_red_cards,
      p.market_value_in_eur
    FROM Players p
    LEFT JOIN Appearances a ON p.player_id = a.player_id
    WHERE p.player_id = ${playerId}
    GROUP BY p.player_id
  `;

  connection.query(query, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.length > 0 ? data[0] : {}); // Send the player's stats or an empty object if not found
    }
  });
};

// Route 11: GET getPlayerBestGame
const getPlayerBestGame = async function(req, res) {
  const playerId = req.params.player_id; // This should be a numeric ID

  const query = `
    SELECT 
      g.game_id,
      CASE 
        WHEN a.club_id = g.home_club_id THEN c_away.club_name 
        ELSE c_home.club_name 
      END AS opposing_team_name,
      a.goals,
      a.assists,
      a.goals + a.assists AS total_contribution
    FROM Appearances a
    JOIN Games g ON a.game_id = g.game_id
    JOIN Clubs c_home ON g.home_club_id = c_home.club_id
    JOIN Clubs c_away ON g.away_club_id = c_away.club_id
    WHERE a.player_id = ${playerId}
    ORDER BY total_contribution DESC, a.goals DESC, a.assists DESC
    LIMIT 1
  `;

  connection.query(query, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.length > 0 ? data[0] : {}); // Send the best game stats or an empty object if not found
    }
  });
};

// Route 12: GET getPlayerFavoriteScoringClub
const getPlayerFavoriteScoringClub = async function(req, res) {
  const playerId = req.params.player_id; // This should be a numeric ID

  const query = `
    SELECT 
      CASE 
        WHEN a.club_id = g.home_club_id THEN c_away.club_name 
        ELSE c_home.club_name 
      END AS opposing_team_name,
      SUM(a.goals) AS total_goals
    FROM Appearances a
    JOIN Games g ON a.game_id = g.game_id
    JOIN Clubs c_home ON g.home_club_id = c_home.club_id
    JOIN Clubs c_away ON g.away_club_id = c_away.club_id
    WHERE a.player_id = ${playerId}
    GROUP BY opposing_team_name
    ORDER BY total_goals DESC
    LIMIT 1
  `;

  connection.query(query, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.length > 0 ? data[0] : {}); // Send the favorite scoring club stats or an empty object if not found
    }
  });
};

// Route 13: GET getFilteredClubs
const getClubs = async function(req, res) {
  const clubNameLike = req.query.clubName ?? '';
  const location = req.query.location ?? '';
  const minStadiumSize = req.query.minStadiumSize ?? 0;
  const maxStadiumSize = req.query.maxStadiumSize ?? 999999;
  const minTotalGames = req.query.minTotalGames ?? 0;
  const maxTotalGames = req.query.maxTotalGames ?? 999999;
  const minTotalWins = req.query.minTotalWins ?? 0;
  const maxTotalWins = req.query.maxTotalWins ?? 999999;

  connection.query(`
    SELECT *, (
      SELECT COUNT(*) FROM Club_Games cg WHERE cg.club_id = c.club_id
    ) AS total_games, (
      SELECT COUNT(*) FROM Club_Games cg WHERE cg.club_id = c.club_id AND cg.is_win = 1
    ) AS total_wins
    FROM Clubs c
    WHERE c.club_code LIKE '%${clubNameLike}%'
    AND c.domestic_competition_id LIKE '%${location}%'
    AND c.stadium_seats BETWEEN ${minStadiumSize} AND ${maxStadiumSize}
    HAVING total_games BETWEEN ${minTotalGames} AND ${maxTotalGames}
    AND total_wins BETWEEN ${minTotalWins} AND ${maxTotalWins}  
    `, (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
    } else {
      res.send(data);
    }
  });
}; 

module.exports = {
  player,
  players,
  club,
  clubs,
  // new queries below
  getPlayers,
  getPlayerStats,
  getClubs,
  getGames,
  // getPlayerBestGame,
  // getPlayerFavoriteScoringClub,
  // getClubStats,
  // getClubCompetitions,
  // getTopTransfersForClub,
  // getFilteredTransfers,
  // getTransferStats,
  // getMatchupStats,
  // getTransferHistoryBetweenClubs,
  // getMostPlayedMatchup
}
