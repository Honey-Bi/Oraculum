const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const SECRET_KEY = config.jwtSecretKey;

exports.auth = (req, res, next) => {
    // 인증 완료
    try {
        // 요청 쿠키에 저장된 토큰과 비밀키를 사용하여 토큰을 req.decoded에 반환
        req.decoded = jwt.verify(req.session.token, SECRET_KEY);
        return next();
    }
    // 인증 실패
    catch (error) {
        // 유효시간이 초과된 경우
        if (error.name === 'TokenExpiredError') {
            return res.write("<script>alert('code: 419, message: 토큰이 만료되었습니다. 다시 로그인해 주세요'); location.href='/account/logout'</script>");
            // return res.redirect('/account/logout');
            // return res.status(419).json({
                
            // });
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