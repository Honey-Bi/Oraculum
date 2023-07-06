const mongoose = require("mongoose"); // mongoose 불러오기

// Schema 생성
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  created : {
    type : Date,
    default : Date.now
  },
  tryCount: {
    type: Number,
    default: 0
  },
  access: {
    type: Number,
    default: 0
  },
  idType: {
    type: String,
    enum: ['basic', 'naver', 'kakao', 'test'],
    required: true
  },
  refresh_token: {
    type: String,
    default: null
  }

}, {versionKey: false});

// model을 export 해주기
module.exports = User = mongoose.model("user", UserSchema);