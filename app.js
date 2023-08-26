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
  const camelDbObject = (eachObject) => {
    return {
      playerId: eachObject.player_id,
      playerName: eachObject.player_name,
      jerseyNumber: eachObject.jersey_number,
      role: eachObject.role,
    };
  };
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team
    `;

  const playerArray = await db.all(getPlayersQuery);
  response.send(playerArray.map((eachPlayer) => camelDbObject(eachPlayer)));
});

//Create New Player API

app.post("/players/", async (request, response) => {
  try {
    const { playerName, jerseyNumber, role } = request.body;
    const newPlayerQuery = `
        INSERT INTO
            cricket_team 
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

    const dbResponse = await db.run(newPlayerQuery);
    response.send("Player Added to Team");
  } catch (error) {
    console.log(error);
  }
});

//Get Player on ID API

app.get("/players/:playerId/", async (request, response) => {
  try {
    const camelDbObject = (eachObject) => {
      return {
        playerId: eachObject.player_id,
        playerName: eachObject.player_name,
        jerseyNumber: eachObject.jersey_number,
        role: eachObject.role,
      };
    };
    const { playerId } = request.params;
    const getPlayerQuery = `
            SELECT *
            FROM cricket_team
            WHERE player_id = ${playerId}`;
    const playerArray = await db.all(getPlayerQuery);
    response.send(playerArray.map((eachPlayer) => camelDbObject(eachPlayer)));
  } catch (error) {
    console.log(error);
  }
});

//Update Player API

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerName, jerseyNumber, role } = request.body;
    const { playerId } = request.params;

    const updatePlayerQuery = `
            UPDATE 
                cricket_team
            SET 
                player_name = '${playerName}',
                jersey_number = ${jerseyNumber},
                role = '${role}'
            WHERE 
                player_id = ${playerId}
            `;

    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (error) {
    console.log(error);
  }
});

//Delete Player API

app.delete("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;

    const deletePlayerQuery = `
            DELETE FROM
                cricket_team
            WHERE 
                player_id = ${playerId};`;

    await db.run(deletePlayerQuery);
    response.send("Player Removed");
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
