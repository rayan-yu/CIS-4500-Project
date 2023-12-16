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
    WHERE p.player_id = ${req.params.competition_id}
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

// Route 13: GET getFilteredClubs (search clubs)
const getFilteredClubs = async function(req, res) {
  const clubNameLike = `%${req.query.clubName || ''}%`;
  const domestic_competition_id = `%${req.query.domestic_competition_id || ''}%`;
  const minStadiumSize = parseInt(req.query.minStadiumSize, 10) || 0;
  const maxStadiumSize = parseInt(req.query.maxStadiumSize, 10) || 999999;
  const minTotalGames = parseInt(req.query.minTotalGames, 10) || 0;
  const maxTotalGames = parseInt(req.query.maxTotalGames, 10) || 999999;
  const minTotalWins = parseInt(req.query.minTotalWins, 10) || 0;
  const maxTotalWins = parseInt(req.query.maxTotalWins, 10) || 999999;

  const query = `
    SELECT c.id, c.name (
      SELECT COUNT(*) FROM Club_Games cg WHERE cg.club_id = c.club_id
    ) AS total_games, (
      SELECT COUNT(*) FROM Club_Games cg WHERE cg.club_id = c.club_id AND cg.is_win = 1
    ) AS total_wins
    FROM Clubs c
    WHERE c.name LIKE '%${clubNameLike}%'
    AND c.domestic_competition_id = '%${domestic_competition_id}%'
    AND c.stadium_seats BETWEEN ${minStadiumSize} AND ${maxStadiumSize}
    HAVING total_games BETWEEN ${minTotalGames} AND ${maxTotalGames}
    AND total_wins BETWEEN ${minTotalWins} AND ${maxTotalWins}
  `;

  connection.query(query, [clubNameLike, domestic_competition_id, minStadiumSize, maxStadiumSize, minTotalGames, maxTotalGames, minTotalWins, maxTotalWins], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data);
    }
  });
};

// Route 14: GET getClubStats

const getClubStats = async function(req, res) {
  const clubId = req.params.club_id; // This should be a numeric ID

  const query = `
    SELECT 
      (SELECT COUNT(*) FROM Club_Games WHERE club_id = ${club_id}) AS all_time_games_played,
      (SELECT COUNT(*) FROM Club_Games WHERE club_id = ${club_id}) AND is_win = 1) AS all_time_wins,
      (SELECT COALESCE(SUM(goals), 0) FROM Appearances WHERE club_id = ${club_id})) AS all_time_goals,
      (SELECT COALESCE(SUM(assists), 0) FROM Appearances WHERE club_id = ${club_id})) AS all_time_assists,
      (SELECT COALESCE(SUM(yellow_cards), 0) FROM Appearances WHERE club_id = ${club_id})) AS all_time_yellow_cards,
      (SELECT COALESCE(SUM(red_cards), 0) FROM Appearances WHERE club_id = ${club_id})) AS all_time_red_cards,
      c.net_transfer_value,
      (
        SELECT p.name, SUM(COUNT(*)) AS num_appearances
        FROM Appearances a 
        JOIN Players p ON a.player_id = p.player_id 
        WHERE a.club_id = ${club_id})
        GROUP BY a.player_id 
        ORDER BY COUNT(*) DESC 
        LIMIT 1
      ) AS player_with_most_appearances,
      (
        SELECT p.name, SUM(a.goals) AS num_goals
        FROM Appearances a 
        JOIN Players p ON a.player_id = p.player_id 
        WHERE a.club_id = ${club_id}) AND a.goals > 0
        GROUP BY a.player_id 
        ORDER BY num_goals DESC 
        LIMIT 1
      ) AS player_with_most_goals,
      (
        SELECT p.name, SUM(a.assists) AS num_assists
        FROM Appearances a 
        JOIN Players p ON a.player_id = p.player_id 
        WHERE a.club_id = ${club_id}) AND a.assists > 0
        GROUP BY a.player_id 
        ORDER BY num_assists DESC 
        LIMIT 1
      ) AS player_with_most_assists
    FROM Clubs c
    WHERE c.club_id = ${club_id})
  `;

  connection.query(query, [clubId, clubId, clubId, clubId, clubId, clubId, clubId, clubId, clubId, clubId], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.length > 0 ? data[0] : {});
    }
  });
};

// Route 15: GET getClubCompetitions

const getClubCompetitions = async function(req, res) {
  const clubId = req.params.club_id; // This should be a numeric ID or club name

  const query = `
    SELECT DISTINCT comp.competition_name
    FROM Games g
    JOIN Competitions comp ON g.competition_id = comp.competition_id
    WHERE g.home_club_id = ${club_id}) OR g.away_club_id = ${club_id})
  `;

  connection.query(query, [clubId, clubId], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data); // Send the list of competitions or an empty array if not found
    }
  });
};

// Route 16: GET getTopTransfersForClub
const getTopTransfersForClub = async function(req, res) {
  const clubName = req.params.club_name; // This should be the name of the club

  const query = `
    SELECT 
      t.player_name, 
      t.fee_cleaned,
      t.year
    FROM Transfers t
    WHERE t.club_name = ${club_name} OR t.club_involved_name = ${club_name}
    ORDER BY t.fee_cleaned DESC
    LIMIT 3
  `;

  connection.query(query, [clubName, clubName], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data); // Send the top 3 transfers or an empty array if not found
    }
  });
};

// Route 17:
const getFilteredTransfers = async function(req, res) {
  const playerNameLike = `%${req.query.playerName || ''}%`;
  const year = req.query.year || '%%';
  const clubNameLike = `%${req.query.clubName || ''}%`;
  const minAge = parseInt(req.query.minAge, 10) || 0;
  const maxAge = parseInt(req.query.maxAge, 10) || 999;
  const minFeeCleaned = parseFloat(req.query.minFeeCleaned, 10) || 0;
  const maxFeeCleaned = parseFloat(req.query.maxFeeCleaned, 10) || 999999999;

  const query = `
    SELECT t.id, t.club_name, t.player_name, t.year
    FROM Transfers t
    JOIN Players p ON t.player_name = p.name
    JOIN Clubs c ON t.club_name = c.name OR t.club_involved_name = c.name
    WHERE p.name LIKE '%${playerNameLike}%'
    AND t.year = ${year}
    AND (c.name LIKE '%${clubNameLike}%')
    AND t.age BETWEEN ${minAge} AND ${maxAge}
    AND t.fee_cleaned BETWEEN ${minFeeCleaned} AND ${maxFeeCleaned}
  `;

  connection.query(query, [playerNameLike, year, clubNameLike, minAge, maxAge, minFeeCleaned, maxFeeCleaned], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data);
    }
  });
};

// Route 18:
const getTransferStats = async function(req, res) {
  const transferId = req.params.transfer_id; // This should be a numeric ID

  const query = `
    SELECT 
      (SELECT club_id FROM Clubs WHERE name = t.new_club_name) AS new_club_id,
      (
        SELECT COUNT(*) FROM Appearances a 
        JOIN Players p ON a.player_name = p.name
        WHERE p.name = t.player_name AND a.club_id = new_club_id
      ) AS total_appearances,
      (
        SELECT COALESCE(SUM(a.minutes_played), 0) FROM Appearances a 
        JOIN Players p ON a.player_name = p.name
        WHERE p.name = t.player_name AND a.club_id = new_club_id
      ) AS total_minutes,
      (
        SELECT COALESCE(SUM(a.goals), 0) FROM Appearances a 
        JOIN Players p ON a.player_name = p.name
        WHERE p.name = t.player_name AND a.club_id = new_club_id
      ) AS total_goals,
      (
        SELECT COALESCE(SUM(a.assists), 0) FROM Appearances a 
        JOIN Players p ON a.player_name = p.name
        WHERE p.name = t.player_name AND a.club_id = new_club_id
      ) AS total_assists,
      (
        SELECT COALESCE(SUM(a.yellow_cards), 0) FROM Appearances a 
        JOIN Players p ON a.player_name = p.name
        WHERE p.name = t.player_name AND a.club_id = new_club_id
      ) AS total_yellow_cards,
      (
        SELECT COALESCE(SUM(a.red_cards), 0) FROM Appearances a 
        JOIN Players p ON a.player_name = p.name
        WHERE p.name = t.player_name AND a.club_id = new_club_id
      ) AS total_red_cards,
      (
        SELECT c_next.name FROM Clubs c_next
        JOIN Transfers t_next ON 
          (t_next.transfer_movement = 'out' AND c_next.name = t_next.club_involved_name) OR
          (t_next.transfer_movement = 'in' AND c_next.name = t_next.club_name)
        WHERE t_next.player_name = t.player_name AND t_next.year > t.year
        ORDER BY t_next.year ASC
        LIMIT 1
      ) AS next_transfer_club
    FROM Transfers t
    CROSS JOIN (SELECT IF(t.transfer_movement = 'out', t.club_involved_name, t.club_name) AS new_club_name) t_names
    WHERE t.transfer_id = ${transferId}
  `;

  connection.query(query, [transferId], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.length > 0 ? data[0] : {});
    }
  });
};

// Route 19: GET getMatchUpStats


const getMatchupStats = async function(req, res) {
  const team1Name = req.query.team1Name;
  const team2Name = req.query.team2Name;

  const query = `
    SELECT 
      COUNT(*) AS total_games,
      SUM(CASE WHEN cg.club_id = c1.club_id AND cg.is_win = 1 THEN 1 ELSE 0 END) AS team1_wins,
      SUM(CASE WHEN cg.club_id = c2.club_id AND cg.is_win = 1 THEN 1 ELSE 0 END) AS team2_wins,
      SUM(CASE WHEN a.club_id = c1.club_id THEN a.goals ELSE 0 END) AS team1_goals,
      SUM(CASE WHEN a.club_id = c2.club_id THEN a.goals ELSE 0 END) AS team2_goals,
      SUM(CASE WHEN a.club_id = c1.club_id THEN a.assists ELSE 0 END) AS team1_assists,
      SUM(CASE WHEN a.club_id = c2.club_id THEN a.assists ELSE 0 END) AS team2_assists,
      SUM(CASE WHEN a.club_id = c1.club_id THEN a.yellow_cards ELSE 0 END) AS team1_yellow_cards,
      SUM(CASE WHEN a.club_id = c2.club_id THEN a.yellow_cards ELSE 0 END) AS team2_yellow_cards,
      SUM(CASE WHEN a.club_id = c1.club_id THEN a.red_cards ELSE 0 END) AS team1_red_cards,
      SUM(CASE WHEN a.club_id = c2.club_id THEN a.red_cards ELSE 0 END) AS team2_red_cards,
      (
        SELECT p.name FROM Players p
        JOIN Appearances a ON p.player_id = a.player_id
        WHERE a.game_id IN (SELECT game_id FROM Games WHERE home_club_id IN (c1.club_id, c2.club_id) AND away_club_id IN (c1.club_id, c2.club_id))
        GROUP BY p.player_id
        ORDER BY SUM(a.goals) DESC
        LIMIT 1
      ) AS top_scorer,
      (
        SELECT p.name FROM Players p
        JOIN Appearances a ON p.player_id = a.player_id
        WHERE a.game_id IN (SELECT game_id FROM Games WHERE home_club_id IN (c1.club_id, c2.club_id) AND away_club_id IN (c1.club_id, c2.club_id))
        GROUP BY p.player_id
        ORDER BY SUM(a.assists) DESC
        LIMIT 1
      ) AS top_assister,
      (
        SELECT p.name FROM Players p
        JOIN Appearances a ON p.player_id = a.player_id
        WHERE a.game_id IN (SELECT game_id FROM Games WHERE home_club_id IN (c1.club_id, c2.club_id) AND away_club_id IN (c1.club_id, c2.club_id))
        GROUP BY p.player_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS top_appearances,
      (
        SELECT comp.competition_name FROM Competitions comp
        JOIN Games g ON comp.competition_id = g.competition_id
        WHERE g.game_id IN (SELECT game_id FROM Games WHERE home_club_id IN (c1.club_id, c2.club_id) AND away_club_id IN (c1.club_id, c2.club_id))
        GROUP BY comp.competition_id
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS most_played_competition
    FROM Club_Games cg
    JOIN Clubs c1 ON cg.club_id = c1.club_id
    JOIN Clubs c2 ON cg.opponent_club_id = c2.club_id
    JOIN Appearances a ON cg.game_id = a.game_id
    WHERE c1.name = ${team1Name} AND c2.name = ${team2Name}
  `;

  connection.query(query, [team1Name, team2Name], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.length > 0 ? data[0] : {});
    }
  });
}; 

// Route 20:
const getTransferHistoryBetweenClubs = async function(req, res) {
  const club1Name = req.query.club1Name; // Name of the first club
  const club2Name = req.query.club2Name; // Name of the second club

  const query = `
    SELECT 
      SUM(CASE WHEN t.club_name = ${club1Name} AND t.club_involved_name = ${club2Name} THEN t.fee_cleaned
               WHEN t.club_involved_name = ${club1Name} AND t.club_name = ${club2Name} THEN -t.fee_cleaned
          END) AS net_transfer_record,
      (
        SELECT GROUP_CONCAT(CONCAT(t2.player_name, ' - ', t2.fee_cleaned, ' - ', t2.year) ORDER BY t2.fee_cleaned DESC SEPARATOR '; ')
        FROM Transfers t2
        WHERE (t2.club_name = ${club1Name} AND t2.club_involved_name = ${club2Name}) OR (t2.club_involved_name = ${club1Name} AND t2.club_name = ${club2Name})
        ORDER BY t2.fee_cleaned DESC
        LIMIT 3
      ) AS top_transfers
    FROM Transfers t
    WHERE (t.club_name = ${club1Name} AND t.club_involved_name = ${club2Name}) OR (t.club_involved_name = ${club1Name} AND t.club_name = ${club2Name})
  `;

  const params = [club1Name, club2Name, club1Name, club2Name, club1Name, club2Name, club1Name, club2Name, club1Name, club2Name, club1Name, club2Name];

  connection.query(query, params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const result = data[0];
      const netTransferRecord = result.net_transfer_record;
      const topTransfers = result.top_transfers ? result.top_transfers.split('; ') : [];

      res.json({
        netTransferRecord: netTransferRecord,
        topTransfers: topTransfers
      });
    }
  });
};

// Route 21: 
const getMostPlayedMatchup = async function(req, res) {
  const query = `
    WITH MatchupCounts AS (
        SELECT home_club_id, away_club_id, COUNT(*) AS match_count
        FROM Games
        GROUP BY home_club_id, away_club_id
    ),
    MostPlayedMatchUp AS (
        SELECT home_club_id, away_club_id
        FROM MatchupCounts
        WHERE match_count = (SELECT MAX(match_count) FROM MatchupCounts)
        LIMIT 1
    )
    SELECT 
        hc.club_name AS home_club_name, 
        ac.club_name AS away_club_name, 
        mc.match_count
    FROM MostPlayedMatchUp mpmu
    JOIN MatchupCounts mc ON mpmu.home_club_id = mc.home_club_id AND mpmu.away_club_id = mc.away_club_id
    JOIN Clubs hc ON mpmu.home_club_id = hc.club_id
    JOIN Clubs ac ON mpmu.away_club_id = ac.club_id
  `;

  connection.query(query, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(data.length > 0 ? data[0] : {}); // Send the most played matchup or an empty object if not found
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
  getPlayerBestGame,
  getPlayerFavoriteScoringClub,
  getFilteredClubs,
  getClubStats,
  getClubCompetitions,
  getTopTransfersForClub,
  getFilteredTransfers,
  getTransferStats,
  getMatchupStats,
  getTransferHistoryBetweenClubs,
  getMostPlayedMatchup
}
