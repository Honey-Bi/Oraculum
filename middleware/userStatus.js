const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const SECRET_KEY = config.jwtSecretKey;

function isLogin(req) {
    if (req.session.token) return true;
    return false;
}

function dateFormat() {
    date = new Date(Date.now());
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

function setAccessToken(req, id) {
    const access_payload = {
        type: 'JWT',
        user: {
            id: id,
        },
    };
    token = jwt.sign(
        access_payload,         // token으로 변환할 데이터
        SECRET_KEY,             // secret key 값
        { expiresIn: '30m', },   // token의 유효시간을 30분로 설정
    );

    req.session.token = token;  //session.token에 token 저장
}

async function setRefreshToken(id) {
    const token = jwt.sign(
        {type: 'JWT'},          // token으로 변환할 데이터
        SECRET_KEY,             // secret key 값
        { expiresIn: '12h', },   // token의 유효시간을 12시간로 설정
    );
    const user = await User.findById(id);
    user.refresh_token = token
    user.save();                //userdb의 refresh_token에 token 저장
}

module.exports.setAccessToken = setAccessToken;
module.exports.setRefreshToken = setRefreshToken;
module.exports.dateFormat = dateFormat;
module.exports.isLogin = isLogin;