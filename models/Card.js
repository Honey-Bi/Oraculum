const mongoose = require("mongoose"); // mongoose 불러오기

const CardSchema = new mongoose.Schema({
    type: { //유저 스키마
        type: String,
        enum: ['scene', 'npc'],
        require: true
    },
    name: {
        type: String,
        require: true,
        unique: true
    },
    file: {
        type: String,
        require: true
    },
    extension: {
        type: String,
        require: true
    }
}, {versionKey: false});

module.exports = Card = mongoose.model("card", CardSchema);