function isLogin(req) {
    if (req.session.token) return true;
    return false;
}

module.exports.isLogin = isLogin;