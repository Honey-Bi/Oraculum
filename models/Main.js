const mongoose = require("mongoose"); // mongoose 불러오기

// Schema 생성
const MainSchema = new mongoose.Schema({
    userId: new mongoose.Types.ObjectId,
    nowEvent: {
        type: Number,
        default: 0
    },
    
    created : {
        type : Date,
        default : Date.now
    } 
  });
  
  // model을 export 해주기
  module.exports = Main = mongoose.model("main", MainSchema);