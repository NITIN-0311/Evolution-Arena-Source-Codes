const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const game_app = express();
game_app.use(cors());
game_app.use(express.json());
const port = process.env.PORT || 3000;

/*
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "EvolutionArena",
  password: "root123",
  port: 5432,
});
*/

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const THIRD_PARTY_URL = process.env.THIRD_PARTY_URL;

game_app.get("/", (req, res) => {
    res.send("Evolution Arena API is running.");
});

game_app.get('/getGameHistory',async (request,response)=>
{
    
    try{
        const result= await pool.query("select game_id,winner_name,players,player_count,started_at,ended_at from games");
        return response.json(result.rows);
    }
    catch(error){
        console.error("DATABASE ERROR:", error);
        return response.status(500).json({ error: "Database query failed", details: error.message });
    }
}
);
game_app.get('/getAnnouncements', async(request,response)=>{
    if (!THIRD_PARTY_URL) {
    return response.status(500).json({
        message: "THIRD_PARTY_URL environment variable is not configured."
    });
}
    try
    {
        const result=await fetch(`${THIRD_PARTY_URL}/announcements`);
        if (!result.ok) {
           throw new Error(`Third-party server responded with ${result.status}`);
        }
        const data = await result.json();
        console.log("External data : ",data);
        return response.json(data);
    }
    catch (error) {
    console.error(error);
    return response.status(500).json({
        message: "Unable to contact third-party service"
    });
}
});

game_app.get('/getVersions', async(request,response)=>{

    if (!THIRD_PARTY_URL) {
        return response.status(500).json({
        message: "THIRD_PARTY_URL environment variable is not configured."
    });
}
    try
    {
        console.log("trying to connect external api");
        const result=await fetch(`${THIRD_PARTY_URL}/versions`);

        if (!result.ok) {
            throw new Error(`Third-party server responded with ${result.status}`);
        }   
        const data = await result.json();
        console.log("External data : ",data);
        return response.json(data);
    }
    catch (error) {
    console.error(error);
    return response.status(500).json({
        message: "Unable to contact third-party service"
    });
}
});
game_app.get('/getGameDetails',async (request,response)=>
{
    const fetchDetails=request.query.fetchDetails ||{};

    try{
        let result;
        if(fetchDetails.latest)
            result= await pool.query("select game_id,winner_name,players,player_count,started_at,ended_at from games order by started_at desc limit 5");
        else
            result= await pool.query("select game_id,winner_name,players,player_count,started_at,ended_at from games order by started_at limit 5");
        return response.json(result.rows);
        } 
    catch(error)
    {
        return response.status(500).json({message:"Game Details Fetching Failed",details:error});
    }
}

);

game_app.delete('/deleteGameRecord',async (request,response)=>
{
    console.log("Deletion Function Invoked");
    console.log("Raw incoming body:", request.body); 

    if(!request.body)
        return response.status(400).json({message:"Missing deletion ID or other input arguments"});

    const gameId=Number(request.body.deletionId);

    console.log(`Deletion ID : ${gameId}`);
    try
    {
    const result= await pool.query("delete from games where game_id=$1 returning *",[gameId]);
    return response.json(result.rows);
    }
    catch(error)
    {
        console.log("Error occured ",error);
        return response.status(500).json({message:"DB query failed",details:error});
    }
}
);

game_app.post('/logGameStart',async(request,response)=>
{
    console.log("Log API Invoked");
    const plain_data=request.body;
    try
    {
    const result=await pool.query("insert into games(players,player_count)values($1,$2) returning *",
        [JSON.stringify(plain_data.players),plain_data.count]);
    return response.json(result.rows[0]);
    }
    catch(error)
    {
        return response.status(500).json({message:"DB Query failed",details:error});
    }
}
);

game_app.patch('/saveGameResult',async (request,response)=>
{
    const gameResult=request.body;
    try{
        await pool.query("update games set winner_name =$1,ended_at=NOW() where game_id= $2 returning *",[gameResult.winner,gameResult.gameIdentity,]);
        return response.json({message:'Game saved'});
        }
    catch(error)
    {
        console.log("Error occured while saving game result : ",error);
        return response.status(500).json({message:"DB query failed", details:error});
    }
});

game_app.post('/logPlayerMoves',async(request,response)=>
{
    const logdata=request.body;
    try
    {
    const result = await pool.query("insert into move_logs (game_id,player_id,player_name,turn_number,move_used)values($1,$2,$3,$4,$5) returning *",
        [logdata.gameIdentity,logdata.playerIdentity,logdata.playerName,logdata.turnNumber,logdata.moveUsed]);
        return response.json(result.rows);
    }
    catch(error)
    {
        console.log("Error occured in logging player moves : ",error);
        return response.status(500).json({message:"Failed to log moves"});
    }
});

game_app.get('/viewSpecificGameLog',async(request,response)=>
{
    const requested_game_id=Number(request.query.gameId);  
    async function gamelog()
    {
        const res=await pool.query("select game_id,winner_name,players,player_count,started_at,ended_at from games where game_id=$1",[requested_game_id]);
        return res.rows;
    }
    async function moveslog()
    {
        const res=await pool.query("select player_id,player_name,turn_number,move_used from move_logs where game_id=$1",[requested_game_id]);
        return res.rows;
    }

    try{
        const [gameLogData,movesLogData]=await Promise.all([gamelog(),moveslog()])
        console.log("Game Rows:", gameLogData.rows);
        console.log("Move Rows:", movesLogData.rows);
        return response.json({
            gameLogData:gameLogData,
            movesLogData:movesLogData
        });
    }
    catch(error)
    {
        return response.status(500).json({message:"Failed to read data from database"});
    }
});

game_app.listen( port,()=>  
        {
            console.log(`Server is running in port ${port}`);
        }
);

/*
NOTES

Response {
  type: "basic",
  url: "http://localhost:3000/getGameHistory",
  redirected: false,
  
  // Status Properties
  status: 500,                         // ◄ Matches your backend status(500)
  statusText: "Internal Server Error",
  ok: false,                           // ◄ Automatically set to false because status is 500

  // Headers Object
  headers: Headers { ... },            // Contains Content-Type, etc.

  // The Body Stream
  body: ReadableStream,                // The raw JSON data is locked inside this stream
  bodyUsed: false
}
*/