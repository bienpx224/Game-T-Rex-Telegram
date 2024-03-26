const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
require('dotenv').config();

const TOKEN = process.env.TELE_BOT_TOKEN;
const server = express();
const bot = new TelegramBot(TOKEN, { polling: true });
const port = process.env.PORT || 3000;
const gameName = "trextest01"; // SHORT NAME GAME THAT SET ON TELE 
const domainGameHeroku = "https://trex-brian-tele-01-8d0441e438f8.herokuapp.com/";
console.log("TOKEN : ")
console.log(TOKEN)
const queries = {};

server.use(express.static(path.join(__dirname, 'public')));

bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "This bot implements a T-Rex jumping game. Say /game if you want to play."));
bot.onText(/start|game/, (msg) => { 
    bot.sendMessage(msg.from.id, `User : ${msg.from.username} called /startgame : Game name : ${gameName}`)
    console.log(`User : ${msg.from.username} called /startgame : Game name : ${gameName}`)
    bot.sendGame(msg.from.id, gameName) 
});

bot.on("callback_query", function (query) {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    } else {
        queries[query.id] = query;
        let gameurl = domainGameHeroku + "index.html?id=" + query.id;
        bot.answerCallbackQuery({
            callback_query_id: query.id,
            url: gameurl
        });
    }
});

bot.on("inline_query", function (iq) {
    bot.answerInlineQuery(iq.id, [{ type: "game", id: "0", game_short_name: gameName }]);
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

server.listen(port);