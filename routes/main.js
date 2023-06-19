const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const userStatus = require('../middleware/userStatus')
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const Main = require('../models/Main');
const SECRET_KEY = config.jwtSecretKey;

// router.get('/', auth, async (req, res) => {
//     const id = req.decoded.user.id;
//     user = await User.findOne({ _id: id }) ;
//     res.render('./main', {title: 'main', userName: user.name, isLogin: true});
// });


router.get('/', auth, (req, res) => {
    res.render('./main', {title: 'main', isLogin: true,});
});

router.post('/select', auth, async (req, res) =>{
    // console.log(main);
});

router.post('/getView', auth, async (req, res) => {
    try {
        let main = await Main.Main.findOne({
            userId: req.decoded.user.id
        }, {
            fuel: 1,
            resourse: 1,
            technology: 1,
            risk: 1
        }).populate('nowEvent', {
            contents: 1,
            r_text: 1,
            l_text: 1
        });
        let result = {
            fuel: main.fuel,
            resourse: main.resourse,
            technology: main.technology,
            risk: main.risk,
            content: main.nowEvent.contents,
            r_text: main.nowEvent.r_text,
            l_text: main.nowEvent.l_text
        }       
        return res.status(200).send(result);
    } catch (error) {
        return res.status(400).send(error);    
    }
    
});

module.exports = router;