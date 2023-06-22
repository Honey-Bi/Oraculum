const mongoose = require("mongoose"); // mongoose 불러오기

// Schema 생성
const MainSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: true,
        unique: true
    },
    nowEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        require: true
    },
    turn: {
        type: Number,
        default:0
    },
    fuel: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },  
    resource: {
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
    event_type: {
        type: String,
        enum: ['random', 'link', 'ending'],
        required: true
    },
    event_code: {
        type: Number,
        required: true,
    },
    title: String,
    contents: String,
    prerequisites: [String], 
    choices: { //좌우선택 텍스트
        left: String,
        right: String
    },
    rewards: { 
        left: { //좌 선택 결과
            fuel: {
                type: Number,
                default: 0
            },
            resource: {
                type: Number,
                default: 0
            },
            technology: {
                type: Number,
                default: 0
            },
            risk: {
                type: Number,
                default: 0
            }
        },
        right: { //우 선택 결과
            fuel: {
                type: Number,
                default: 0
            },
            resource: {
                type: Number,
                default: 0
            },
            technology: {
                type: Number,
                default: 0
            },
            risk: {
                type: Number,
                default: 0
            }
        }
    },
    next_event: { //선택후 연계용 이벤트
        left: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'event',
            default: null
        },
        right: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'event',
            default: null
        },
    },
    is_ending: {
        type: Boolean,
        default: false,
    }
}, {versionKey: false});

// model을 export 해주기
module.exports = {
    Main: mongoose.model("main", MainSchema),
    MainEvent: mongoose.model("event", EventSchema)
};