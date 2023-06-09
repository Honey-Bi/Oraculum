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
  },
  created : {
    type : Date,
    default : Date.now
  },
  deathCount: {
    type: Number,
    default: 0
  }
});

// model을 export 해주기
module.exports = User = mongoose.model("user", UserSchema);