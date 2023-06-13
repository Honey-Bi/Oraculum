const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
    const id = req.decoded.user.id;
    try {
        let user = await User.findOne({ _id: id }) ;
        if (user.access == 1) {
            res.render('./admin/', {});
        } else {
            return res.redirect('/404');
        }
    } catch (error) {
        
    }
});

router.get('/management', auth, async (req, res) => {
    const id = req.decoded.user.id;
    try {
        let user = await User.findOne({ _id: id }) ;
        if (user.access == 1) {
            let data = await User.find({}, {_id: 0, password: 0, __v: 0,});
            res.render('./admin/management', {data: data});
        } else {
            res.redirect('/404');
        }
    } catch (error) {   
        console.log(error)
    }
});

module.exports = router;