const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const User = require('../models/User');
const Main = require('../models/Main');

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
        if (user.access != 1) {
            return res.redirect('/404');
        }
        let type = req.query.type;
        var data;
        switch (type) {
            case 'users':
                data = await User.find({}, {});
                break;
            case 'events':
                data = await Main.MainEvent.find({}, {});
                break;
        }
        res.render('./admin/management', {data: data, type: type});

    } catch (error) {   
        console.log(error)
    }
});

module.exports = router;