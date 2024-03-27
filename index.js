const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
require('dotenv').config();

const TOKEN = process.env.TELE_BOT_TOKEN;
const server = express();
const bot = new TelegramBot(TOKEN, { polling: true });
const port = process.env.PORT || 3000;
const ws_port = process.env.WS_PORT || 3333;
const gameName = "trextest01"; // SHORT NAME GAME THAT SET ON TELE 
const gameNameTrex = "trextest01"; // SHORT NAME GAME THAT SET ON TELE 
const gameNameMatch3 = "match3"; // SHORT NAME GAME THAT SET ON TELE 
const gameNameShooter = "shooter"; // SHORT NAME GAME THAT SET ON TELE 
const gameNameBattleShip = "battleship"; // SHORT NAME GAME THAT SET ON TELE 
const gameNameBigSmall = "bigsmall"; // SHORT NAME GAME THAT SET ON TELE 
const domainGameHeroku = "https://trex-brian-tele-01-8d0441e438f8.herokuapp.com/";

const queries = {};

server.use(express.static(path.join(__dirname, 'public')));

bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot implements some funny games. Say /trex, /match3, /shooter if you want to play games."));

bot.onText(/game|play|start/, (msg) => { 
    bot.sendMessage(msg.from.id, `User : ${msg.from.username} called : Game name : ${gameNameMatch3}`)
    console.log(`User : ${msg.from.username} called /game|play : Game name : ${gameNameMatch3}`)
    bot.sendGame(msg.from.id, gameNameMatch3) 
});

bot.onText(/trex/, (msg) => { 
    bot.sendMessage(msg.from.id, `User : ${msg.from.username} called : Game name : ${gameNameTrex}`)
    console.log(`User : ${msg.from.username} called /trex : Game name : ${gameNameTrex}`)
    bot.sendGame(msg.from.id, gameNameTrex) 
});

bot.onText(/match3/, (msg) => { 
    bot.sendMessage(msg.from.id, `User : ${msg.from.username} called : Game name : ${gameNameMatch3}`)
    console.log(`User : ${msg.from.username} called /match3 : Game name : ${gameNameMatch3}`)
    bot.sendGame(msg.from.id, gameNameMatch3) 
});

bot.onText(/shooter/, (msg) => { 
    bot.sendMessage(msg.from.id, `User : ${msg.from.username} called : Game name : ${gameNameShooter}`)
    console.log(`User : ${msg.from.username} called /shooter : Game name : ${gameNameShooter}`)
    bot.sendGame(msg.from.id, gameNameShooter) 
});

bot.onText(/ship/, (msg) => { 
    bot.sendMessage(msg.from.id, `User : ${msg.from.username} called : Game name : ${gameNameBattleShip}`)
    console.log(`User : ${msg.from.username} called /ship : Game name : ${gameNameBattleShip}`)
    bot.sendGame(msg.from.id, gameNameBattleShip) 
});

bot.onText(/bigsmall/, (msg) => { 
    bot.sendMessage(msg.from.id, `User : ${msg.from.username} called : Game name : ${gameNameBigSmall}`)
    console.log(`User : ${msg.from.username} called /bigsmall : Game name : ${gameNameBigSmall}`)
    bot.sendGame(msg.from.id, gameNameBigSmall) 
});

bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameNameTrex && query.game_short_name !== gameNameMatch3 && query.game_short_name !== gameNameShooter &&  query.game_short_name !== gameNameBigSmall && query.game_short_name !== gameNameBattleShip) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = domainGameHeroku + query.game_short_name + "/index.html?id=" + query.id;
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });
    }
});

bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{ type: "game", id: "0", game_short_name: gameName }]);
});

/* API ROUTE */

server.get("/bet/:value", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    console.log("=== API Bet called : ")
    console.log(query)
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options,
        function (err, result) { });
});

server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options,
        function (err, result) { });
});




/* SERVER WEB SOCKET  */
var { Server }  = require('ws');
const timeCountdown = 1000
const timeDelayEachMatch = 4000
let wss = new Server({server})

// const wss = new WebSocket.Server({ port:9999 }, ()=>{
//     console.log("Server started")
// });

var Round = require("./models/Round")
var UserBetRound = require("./models/UserBetRound")

let response = {
    code: 200,
    message: "OK",
    data: {}
}

const mongoose = require('mongoose');
// user : bigsmall / hNZrf9HhXsMVteEr
mongoose.connect('mongodb+srv://bigsmall001:hNZrf9HhXsMVteEr@cluster0.wmvmwnc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', (e) => {
    if (e) {
        console.log("Mongoose connection error: " + e)
    } else {
        console.log("Mongoose connection established")
    }
});

var currentRoundNumber = null;
function createNewRound() {
    var newRound = new Round({
        small_money: 0,
        small_players: 0,
        big_money: 0,
        big_players: 0,
        counter: 0,
        result: -1,
        dateCreated: Date.now()
    })
    newRound.save((e) => {
        if (!e) {
            console.log("New round created : " + newRound.roundNumber)
            currentRoundNumber = newRound.roundNumber
            roundCounter(currentRoundNumber)
        } else {
            currentRoundNumber = null;
        }
    })
}
function roundCounter(roundNumber) {
    Round.findOne({ roundNumber }, (e, round) => {
        if (!e && round != null) {
            if (round.counter <= 10) {
                round.counter++;
                // round.small_money += Math.floor(Math.random() * 3000)
                // round.big_money += Math.floor(Math.random() * 3000)
                console.log(`Current round : ${currentRoundNumber} , count : ${round.counter}`)
                
                
                round.save((error, eSave) => {
                    response.message = `RoundCounter${roundNumber}`
                    response.data = eSave
                    wss.broadcast(JSON.stringify(response))    
                    setTimeout(() => {
                        roundCounter(roundNumber);
                    }, timeCountdown)
                })
            } else {
                round.result = Math.floor(Math.random() * 2);
                if (round.result == 0) {
                    round.dice = Math.floor(Math.random() * 3) + 1;
                } else {
                    round.dice = Math.floor(Math.random() * 3) + 4;
                }
                round.save((error,eSave) => {
                    console.log("Winner is : " + round.result)
                    response.message = `RoundCounter${roundNumber}`
                    response.data = eSave
                    wss.broadcast(JSON.stringify(response)) 

                    setTimeout(() => {
                        createNewRound()
                    }, timeDelayEachMatch)
                })
            }
        } else {
            // Have error or not found any round 
        }
    })
}

createNewRound()

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
wss.broadcast = function broadcast(msg) {
    wss.clients.forEach(function each(client) {
        client.send(msg);
     });
 };

wss.on('connection', function connection(ws, req) {
    ws.id = wss.getUniqueID();
    console.log("New WS connection established : " + ws.id);
    ws.on('message', (data) => {
        data = data.toString();
        console.log("Message received : ", data)
        response.message = data;
        ws.send(JSON.stringify(response))
    });

    wss.broadcast('Welcome to connect Web Socket Server');
});

wss.on("listening", () => {
    console.log("Server listening on " + ws_port)
})


server.listen(port);