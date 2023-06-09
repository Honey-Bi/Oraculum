const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const userStatus = require('../middleware/userStatus')
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const SECRET_KEY = config.jwtSecretKey;

// router.get('/', auth, async (req, res) => {
//     const id = req.decoded.user.id;
//     user = await User.findOne({ _id: id }) ;
//     res.render('./main', {title: 'main', userName: user.name, isLogin: true});
// });


router.get('/', (req, res) => {
    res.render('./main', {title: 'main', isLogin: true,});
});

module.exports = router;