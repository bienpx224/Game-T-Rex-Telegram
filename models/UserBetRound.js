const mongoose = require('mongoose');
const roundSchema = new mongoose.Schema({
    userId : String,
    roundNumber : Number,
    BetType : Number, /* 0 is Small, 1 is Big */
    BetValue : Number, 
    dateCreated : Date
})
module.exports = mongoose.model('user_bet_round', roundSchema)