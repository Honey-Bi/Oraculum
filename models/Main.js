const mongoose = require("mongoose"); // mongoose 불러오기

// Schema 생성
const MainSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    nowEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event'
    },
    fuel: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },  
    resourse: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },
    technology: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },
    risk: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },
    main_created : {
        type : Date,
        default : Date.now
    } 

}, {versionKey: false});

const EventSchema = new mongoose.Schema({
    event_code: {
        type: Number,
        required: true,
        unique: true
    },
    title: String,
    contents: String,
    r_text: String,
    l_text: String,
    r_result: [Number],
    l_result: [Number],
    next_event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        default: null
    },
}, {versionKey: false});

// model을 export 해주기
module.exports = {
    Main: mongoose.model("main", MainSchema),
    MainEvent: mongoose.model("event", EventSchema)
};