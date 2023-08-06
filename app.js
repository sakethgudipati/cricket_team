const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get Players API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team
    `;

  const playerArray = await db.all(getPlayersQuery);
  response.send(playerArray);
});

//Create New Player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const newPlayerQuery = `
  INSERT INTO
  book 
  (
      player_name,
      jersey_number,
      role
  )
  VALUES
  (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
  );`;

  await db.run(newPlayerQuery);
  response.send("Player Added to Team");
});

//Get Player on ID API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId}`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(playerArray);
});

//Update Player API

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    UPDATE 
        cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE 
        player_id = ${playerId}`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete Player API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE 
        player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
