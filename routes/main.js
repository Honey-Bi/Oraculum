const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const SECRET_KEY = config.jwtSecretKey;

router.get('/', (req, res) => {
    res.render('./main');
});

// router.get('/main', (req, res) => {
//     res.render('./main/');
// });

module.exports = router;