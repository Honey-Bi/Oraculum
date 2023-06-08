const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

exports.auth = (req, res, next) => {
    // 인증 완료
    try {
        // 요청 쿠키에 저장된 토큰과 비밀키를 사용하여 토큰을 req.decoded에 반환
        req.decoded = jwt.verify(req.cookies.token, config.jwtSecretKey);
        return next();
    }
    // 인증 실패
    catch (error) {
        // 유효시간이 초과된 경우
        if (error.name === 'TokenExpiredError') {
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }
        // 토큰의 비밀키가 일치하지 않는 경우
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                code: 401,
                message: '유효하지 않은 토큰입니다.'
            });
        }
    }
}