const mongoose = require("mongoose"); // mongoose 불러오기

// Schema 생성
const MainSchema = new mongoose.Schema({
    userId: new mongoose.Types.ObjectId,
    nowEvent: new mongoose.Types.ObjectId,
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
    created : {
        type : Date,
        default : Date.now
    } 

});

const EventSchema = new mongoose.Schema({
    contents: {
        type: String,
        required: true
    },
    r_text: {
        type: String,
        required: true,
    },
    l_text: {
        type: String,
        required: true,
    },
    r_result: [Number],
    l_result: [Number]
});

// model을 export 해주기
module.exports = Main = mongoose.model("main", MainSchema);
module.exports = mongoose.model("event", EventSchema);