const readline = require("node:readline");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "EvolutionArena",
  password: "root123",
  port: 5432,
});

const r = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function read(question) {
  return new Promise((resolve) => {
    r.question(question, (answer) => resolve(answer));
  });
}

async function viewGameHistory() {
  try {
    const result = await pool.query(`
            SELECT
                game_id,
                winner_name,
                players,
                player_count,
                started_at,
                ended_at
            FROM games
            ORDER BY game_id
        `);

    console.table(result.rows);
  } catch (error) {
    console.log("Failed to fetch game history");
    console.log(error.message);
  }
}

async function latestGames() {
  try {
    const result = await pool.query(`
            SELECT
                game_id,
                winner_name,
                players,
                player_count,
                started_at,
                ended_at
            FROM games
            ORDER BY started_at DESC
            LIMIT 5
        `);

    console.table(result.rows);
  } catch (error) {
    console.log("Failed to fetch latest games");
    console.log(error.message);
  }
}


async function oldestGames() {
  try {
    const result = await pool.query(`
            SELECT
                game_id,
                winner_name,
                players,
                player_count,
                started_at,
                ended_at
            FROM games
            ORDER BY started_at ASC
            LIMIT 5
        `);

    console.table(result.rows);
  } catch (error) {
    console.log("Failed to fetch oldest games");
    console.log(error.message);
  }
}

async function deleteGame() {
  const gameId = Number(await read("Enter Game ID to delete : "));

  try {
    const result = await pool.query(
      "DELETE FROM games WHERE game_id=$1 RETURNING *",
      [gameId],
    );

    if (result.rows.length === 0) {
      console.log("Game not found");
      return;
    }

    console.log("Deleted Successfully");
    console.table(result.rows);
  } catch (error) {
    console.log("Deletion failed");
    console.log(error.message);
  }
}

async function viewSpecificGame() {
  const gameId = Number(await read("Enter Game ID : "));

  try {
    const gameData = await pool.query(
      `
            SELECT
                game_id,
                winner_name,
                players,
                player_count,
                started_at,
                ended_at
            FROM games
            WHERE game_id=$1
        `,
      [gameId],
    );

    const moveData = await pool.query(
      `
            SELECT
                player_id,
                player_name,
                turn_number,
                move_used
            FROM move_logs
            WHERE game_id=$1
            ORDER BY turn_number
        `,
      [gameId],
    );

    console.log("\nGAME DETAILS");

    if (gameData.rows.length === 0) {
      console.log("Game not found");
      return;
    }

    console.table(gameData.rows);

    console.log("\nMOVE LOGS");

    if (moveData.rows.length === 0) console.log("No moves found");
    else console.table(moveData.rows);

  } catch (error) {
    console.log("Failed to fetch game log");
    console.log(error.message);
  }
}

async function createGame() {
  const players = await read("Enter player names separated by comma : ");

  const playerArray = players.split(",").map((player) => player.trim());

  try {
    const result = await pool.query(
      `INSERT INTO games (players, player_count)
      VALUES($1, $2) RETURNING *
        `,
      [JSON.stringify(playerArray), playerArray.length],
    );
    console.log("Game Created");
    console.table(result.rows);
  } 
  catch (error) {
    console.log("Failed to create game");
    console.log(error.message);
  }
}

async function saveWinner() {
  const gameId = Number(await read("Enter Game ID : "));

  const winner = await read("Enter Winner Name : ");

  try {
    const result = await pool.query(
      `UPDATE games SET winner_name = $1, ended_at = NOW() WHERE game_id = $2
        RETURNING *
        `,[winner, gameId],
    );

    if (result.rows.length === 0) {
      console.log("Game not found");
      return;
    }

    console.log("Winner Saved");
    console.table(result.rows);
    } 
  catch (error) {
    console.log("Failed to save winner");
    console.log(error.message);
  }
}

async function menu() {
  while (true) {
    console.log(`
      EVOLUTION ARENA DATABASE

1. View Game History
2. View Latest 5 Games
3. View Oldest 5 Games
4. View Specific Game
5. Create Game
6. Save Winner
7. Delete Game

q. Exit

`);

    const choice = await read("Enter Choice : ");

    switch (choice) {
      case "1":
        await viewGameHistory();
        break;

      case "2":
        await latestGames();
        break;

      case "3":
        await oldestGames();
        break;

      case "4":
        await viewSpecificGame();
        break;

      case "5":
        await createGame();
        break;

      case "6":
        await saveWinner();
        break;

      case "7":
        await deleteGame();
        break;

      case "q":
      case "Q":
        console.log("Closing Application...");
        await pool.end();
        rl.close();
        return;

      default:
        console.log("Invalid Choice");
    }
  }
}

menu();
