const mongoose = require("mongoose"); // mongoose 불러오기

// Schema 생성
const MainSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true
    },
    nowEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        require: true
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
    // 0 = 시작,
    // 1 ~ 999 랜덤 인카운터
    // 1000 ~  연결용이벤트
    // 4000 ~  엔딩용 이벤트
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