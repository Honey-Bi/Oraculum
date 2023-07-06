const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const User = require('../models/User'); 
const userStatus = require('./userStatus');

const SECRET_KEY = config.jwtSecretKey;

exports.auth = async (req, res, next) => {
    // 인증 완료
    try {
        // 요청 쿠키에 저장된 토큰과 비밀키를 사용하여 토큰을 req.decoded에 반환
        req.decoded = jwt.verify(req.session.token, SECRET_KEY); 
        return next();
    }
    // 인증 실패
    catch (error) {
        // access_token 유효시간이 초과된 경우
        if (error.name === 'TokenExpiredError') { 
            console.log('access_token 유효시간 초과');
            req.decoded = jwt.decode(req.session.token);
            const user = await User.findById(req.decoded.user.id);
            try {
                const token = jwt.verify(user.refresh_token, SECRET_KEY);
                userStatus.setAccessToken(req, req.decoded.user.id);
            } catch (error) {
                console.log('refresh_token 유효시간이 초과');

                const user = await User.findById(req.decoded.user.id)
                user.refresh_token = null;
                user.save();
                req.session.destroy();
                // refresh_token 유효시간이 초과또는 비밀키가 일치하지 않는 경우
                return res.redirect("/account/login");
            }
            return next();
        }
        // 토큰의 비밀키가 일치하지 않는 경우
        if (error.name === 'JsonWebTokenError') {
            return res.redirect('/account/login');
            // return res.status(401).json({
            //     code: 401,
            //     message: '유효하지 않은 토큰입니다.'
            // });
        }
    }
}


