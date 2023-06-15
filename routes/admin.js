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

router.get('/users', auth, async (req, res) => {
    const id = req.decoded.user.id;
    try {
        let user = await User.findOne({ _id: id }) ;
        if (user.access != 1) {
            return res.redirect('/404');
        }
        var data = await User.find({}, {}),
            notAddDefault = [
                'created', 'deathCount','access',
                ,'fuel','resourse','technology','risk','main_created'
            ],
            notId = ['_id', 'userId','nowEvent'],
            addDefault = ['password'],
            userMain = await Main.Main.find({}, {});

        res.render('./admin/users', {
            notId: notId,
            user: data, 
            notAddDefault: notAddDefault, 
            addDefault: addDefault,
            userMain: userMain
        });

    } catch (error) {   
        console.log(error)
    }
});

router.get('/events', auth, async (req, res) => {
    const id = req.decoded.user.id;
    try {
        let user = await User.findOne({ _id: id }) ;
        if (user.access != 1) {
            return res.redirect('/404');
        }
        var data = await Main.MainEvent.find({}, {}),
            notAddDefault = [],
            addDefault = [];

        res.render('./admin/events', {
            event: data, 
            notAddDefault: notAddDefault, 
            addDefault: addDefault
        });

    } catch (error) {   
        console.log(error)
    }
});


module.exports = router;