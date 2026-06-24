  const readline = require("node:readline");

  /*
  const express = require("express");
  const cors = require("cors");
  const { Pool } = require("pg");

  const express_app = express();
  express_app.use(cors());
  const port = 3000;

  const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "EvolutionArena",
    password: "root123",
    port: 5432,
  });
  */

  const RESET = "\x1b[0m";
  const RED = "\x1b[31m";
  const GREEN = "\x1b[32m";
  const YELLOW = "\x1b[33m";
  const BLUE = "\x1b[34m";
  const CYAN = "\x1b[36m";

  const controlPanel = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function read() {
      return new Promise((resolve) => {
      const input = controlPanel.question("", (input) => {
        return resolve(input);
      });
    });
  }

  let gameFlag = true;
  let game_id=null;

  let playersData = {
    players: new Map(),
    playersHp: new Map(),
    count: 0,
    defenseFlag: [],
    isAlive: new Map(),

    addPlayer(playerID, playerName) {
      this.players.set(playerID, playerName);
      this.playersHp.set(playerID, 100);
      this.isAlive.set(playerID, true);
    },
    listPlayers() {
        for ([tempPlayerID, tempPlayerName] of this.players) {
        console.log(
          `Player ID - ${tempPlayerID} Player Name : ${tempPlayerName}`,
        );
      }
    },

    hpStatus() {
      for ([tempPlayerID, tempPlayerName] of this.players) {
        if (playersData.isAlive.get(tempPlayerID))
        {
          console.log(`\nPlayer ID :${tempPlayerID}`);
          console.log(`Player Name ${tempPlayerName}`);
          console.log(`HP Status : ${this.playersHp.get(tempPlayerID)}`);
        }
      }
    },

    checkAlive() {
      for (let playerId = 0; playerId <= playersData.count; playerId++)
        {
        if (this.isAlive.get(playerId) && this.playersHp.get(playerId) <= 0 )
          {
            this.isAlive.set(playerId, false);
            console.log(`Player ${playersData.players.get(playerId)} is Elimintaed`);
            this.isOver();
        }
      }
    },
    async isOver() {
      let NotEliminated = [];
      for (var i = 0; i <= playersData.count; i++) {
        aliveFlag = this.isAlive.get(i);
        if (aliveFlag) {
          NotEliminated.push(i);
        }
      }
      if (NotEliminated.length == 1) {
        let winnerID = NotEliminated[0];
        console.log(`Winner - ${playersData.players.get(winnerID)}`);  
        gameFlag = false;
        await server.saveGame(playersData.players.get(winnerID));
      }
    },
  };

  let bot = {
    hp: 100,

    async move(turns) {
      moveNumber = Math.floor(Math.random() * 3) + 1;

      if (moveNumber == 2 && playersData.playersHp.get(0) == 100) {
        moveNumber = 1;
      } else if (moveNumber == 3 && playersData.defenseFlag[0] == true) {
        moveNumber = 1;
      }

      await server.logMove(turns,0,"BOT",moveNumber);

      switch (moveNumber) {
        case 1: {
          moves.attack(0);
          break;
        }
        case 2: {
          moves.heal(0);
          break;
        }
        case 3: {
          moves.shield(0);
          break;
        }
        default:
          console.log("Bot chose a invalid move");
      }
    },
    initaliseBot() {
      playersData.addPlayer(0, "Bot");
    },
  };

  let moves = {
    1: "attack",
    2: "heal",
    3: "defense",

    attack(playerID) {
      console.log(RED + "Player chose attack" + RESET);

      for (let i = 0; i <= playersData.count; i++) {
        if (i != playerID) {
          if (playersData.defenseFlag[i]) {
            console.log(
              "Shield Broken for [",
              playerID,
              "]",
              playersData.players.get(i),
            );

            playersData.defenseFlag[i] = false;
          } else {
            currentHp = playersData.playersHp.get(i);
            playersData.playersHp.set(i, currentHp - 25);
          }
        }
      }
    },
    heal(playerID) {
      console.log(GREEN + `Player ${playerID} chose to Heal` + RESET);

      currentHp = playersData.playersHp.get(playerID);
      playersData.playersHp.set(playerID, currentHp + 10);

      if (playersData.playersHp.get(playerID) > 100) {
        playersData.playersHp.set(playerID, 100);
      }

      console.log(
        "Player ID : ",
        playerID,
        "Player Name : ",
        playersData.players.get(playerID),
        "Player HP : ",
        playersData.playersHp.get(playerID),
      );
    },

    shield(playerID) {
      playersData.defenseFlag[playerID] = true;
      console.log(
        CYAN +
          `${playersData.players.get(playerID)} is protected with shield` +
          RESET,
      );
    },

    menu() {
      console.log("\n1.Attack");
      console.log("2.Heal");
      console.log("3.Defense");
      console.log("Choose your move");
    },

    makeMove(playerID, moveNumber) {
      switch (moveNumber) {
        case 1: {
          this.attack(playerID);
          break;
        }
        case 2: {
          this.heal(playerID);
          break;
        }
        case 3: {
          this.shield(playerID);
          break;
        }
        default:
          console.log("Invalid move");
      }
    },
  };

  function showInstructions() {
    console.log(BLUE + "\n========== EVOLUTION ARENA ==========" + RESET);

    console.log("\nGAME OBJECTIVE");
    console.log("Be the last player alive.");

    console.log("\nPLAYERS");
    console.log("- Player 0 is the Bot.");
    console.log("- All players start with 100 HP.");

    console.log("\nAVAILABLE MOVES");

    console.log(RED + "\n1. ATTACK" + RESET);
    console.log("- Deals 25 damage to every other player.");
    console.log("- If a player has a shield, the shield breaks.");
    console.log("- Shielded players take no damage from that attack.");

    console.log(GREEN + "\n2. HEAL" + RESET);
    console.log("- Restores 10 HP.");
    console.log("- HP cannot exceed 100.");

    console.log(CYAN + "\n3. DEFENSE" + RESET);
    console.log("- Creates a shield.");
    console.log("- The next attack is blocked.");
    console.log("- After blocking one attack, the shield breaks.");

    console.log("\nELIMINATION");
    console.log("- A player is eliminated when HP reaches 0 or below.");
    console.log("- Eliminated players lose all future turns.");

    console.log("\nWINNING");
    console.log("- When only one player remains alive,");
    console.log("  that player is declared the winner.");

    console.log("\nGAME HISTORY");
    console.log("- At the end of each match,");
    console.log("  the winner and player list are stored");
    
    console.log(BLUE + "\n=====================================\n" + RESET);
  }

function resetGame() {
    playersData.players.clear();
    playersData.playersHp.clear();
    playersData.isAlive.clear();
    playersData.defenseFlag = [];
    playersData.count = 0;
}

  const server={

    API_BASE_URL:"https://your-render-url.onrender.com://localhost:3000",

    async showGameHistory()
    {
      try{
        const response = await fetch(`${this.API_BASE_URL}/getGameHistory`);
        const data=await response.json();
        console.table(data);
      }
      catch(error)
      {
        console.log("Error occured while fetching Game history",error);
      }
    },

    async deleteGameEntry(gameId)
    {
    try{
      const response= await fetch(`${this.API_BASE_URL}/deleteGameRecord`,
        {
          method:"DELETE",
          headers:{
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            deletionId:gameId
          })
        }
      );  
      
      if(!response.ok)
          { throw new Error(`HTTP Error: ${response.status}`); }

          const data = await response.json();

          console.log("Deleted Records:");
          console.table(data);

          if(data.length === 0)
          { console.log("No game found with that ID"); }
          else
          { console.log("Record deleted successfully"); }
      }
    
      catch(error)
      { console.log("Deletion failed:", error.message); }
    },

    async logMove(turnNumber,playerID,playerName,moveNumber){
      const logdata= {
                  gameIdentity:game_id,
                  playerIdentity:playerID,
                  playerName:playerName,
                  moveUsed:moves[moveNumber],
                  turnNumber:turnNumber
            }

      await fetch(`${this.API_BASE_URL}/logPlayerMoves`,
        {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify(logdata)
        }
        )
    },

    async viewOldMatches(){
    },

    async viewLatestMatches(){
    },

    async viewSpecificGameLog(fetch_game_id){
        
      try{
      const response=await fetch(`${this.API_BASE_URL}/viewSpecificGameLog?gameId=${fetch_game_id}`);
      const data = await response.json();
   
      const {gameLogData,movesLogData}=data;

      console.table(gameLogData);
      console.table(movesLogData);
      }
      catch(error)
      {
        console.log("Error while fetching log ",error);
      }
    },

    async logGameStart(){

      const data={
        players: Array.from(playersData.players),
        count: playersData.count,
      };

      const response=await fetch(`${this.API_BASE_URL}/logGameStart`,
      {
          method:'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data)
      }
      );

      const respone_data=await response.json();
      game_id=respone_data.game_id;
    },

    async saveGame(winnerName) {
    
    const playerNames = [];

    for (const [id, name] of playersData.players) {
      playerNames.push(name);
    }

    await fetch(`${this.API_BASE_URL}/saveGameResult`,
      {
          method:'PATCH',
          headers:{
            'Content-Type':'application/json'
          },
          body: JSON.stringify({
            winner:winnerName,
            players:playerNames.join(", "),
            gameIdentity:game_id
          }
        )
      }
    );
    },
    async getAnnouncements()
    {
        const response=await fetch(`${this.API_BASE_URL}/getAnnouncements`)
        const data=  await response.json();
        console.log("Announcements");
        console.table(data);
    },
    async getVersions()
    {
       const response=await fetch(`${this.API_BASE_URL}/getVersions`)
       const data= await response.json();
       console.log("Available Versions");
       console.table(data);
    }
  }

  async function runGame() {
    
    console.log("Game started ");
    await bot.initaliseBot();
    await server.logGameStart();

    let choice = -1;
    while (gameFlag) {
      let turns = 1;

      for (let i = 0; i <= playersData.count; i++) {
        if (!playersData.isAlive.get(i)) {
          continue;
        }

        console.log("==================================");
        console.log(RED + `\nPlayer - ${i} has to make a move` + RESET);

        moves.menu();

        if (i == 0) {
          console.log("Bot made a move");
          await bot.move(turns);
          
        } 
        else {
          let moveNumber = await read();
          await moves.makeMove(i, Number(moveNumber));
          await server.logMove(turns,i,playersData.players.get(i),moveNumber);
        }
        turns+=1
        

        console.log(YELLOW + "\nImpact on other Players");
        playersData.hpStatus();
        playersData.checkAlive();
        console.log(RESET);
      }
    }
    console.log("Returning to main menu");
    await read();
  }

  async function choosePlayers() {
    console.log("Choose player count : ");
    playersData.count = await read();

    for (let playerID = 1; playerID <= playersData.count; playerID++) {
      console.log(`Enter player ${playerID} name : `);
      let playerName = await read();
      await playersData.addPlayer(playerID, playerName);
    }
    playersData.listPlayers();
  }

  async function GameData()
  {
    let ch=-1;
    do 
    {
      console.log(YELLOW);
  
      console.log("Enter 1 to view previous Game History");
      console.log("Enter 2 to delete specific game Histories");
      console.log("Enter 3 to view specific game Log");      
      console.log("Enter 4 to get game announcements");
      console.log("Enter 5 to show available game versions");
      console.log("Press q to return for main menu");
      process.stdout.write("Enter your option : ");
      console.log(RESET);
    
      ch=await read();

      switch(ch)
      {
        case "1":
          {
            await server.showGameHistory();
            break;
          }
        case "2":
          {
            console.log("Enter game id to delete a record");
            const gameId=await read();
            await server.deleteGameEntry(gameId);
            break;          
          }
        case "3":
          {
            console.log("Enter Game id to be fetched: ");
            let fetch_game_id=Number(await(read()));//
            await server.viewSpecificGameLog(fetch_game_id);
            break;
          }
        case "4":
          {
            await server.getAnnouncements();
            break;
          }
        case "5":
          {
            await server.getVersions();
            break;
          }
        case "q":
          {
            console.log("Returning to main menu");
            break;
          }
        default:
          console.log("Invalid Choice");
      }  
    }while(ch!="q");
  }

  async function startGame() {
    console.log("Welcome to Evolution Arena")
    while(true)
    {
    console.log(YELLOW);
    console.log("Enter 1 to start Game");
    console.log("Enter 2 to Manage stored game data");
    console.log("Enter 3 to show game instructions");
    console.log("Press q to close the game");
    process.stdout.write("Enter your option : ");
    console.log(RESET);
    const ch=await read();
    
    switch (ch)
    {
      case "1":
        {
          console.log(RESET + "Game has started");
          await choosePlayers();
          await runGame();
          break;
        }
      case "2":
        {
          console.log("Game Data");
          await GameData();
          break;
        }
      case "3":
        {
          showInstructions();
          break;
        }
      case "q":
        {
          console.log("Game closed");
          controlPanel.close();
          process.exit(0);
          break;
        }   
      }
    }
    
  }

  startGame();
