const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const User = require('../models/User');
const Main = require('../models/Main');
const { default: mongoose } = require('mongoose');

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

router.post('/deleteUser', auth, async (req, res) => {
    try {
        let userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        let deleteId = await User.findOne({ _id:  req.body.id}, {access: 1});
        
        if (deleteId.access == 1 || userId.access != 1) {
            return res.status(401).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }
        await User.deleteOne({_id: req.body.id});

        return res.status(200).json({
            code: 200,
            message: '성공했습니다.',
        });

    } catch (error) {   
        console.log(error);
        return res.status(401).json({
            code: 401,
            message: '실패했습니다.',
        });;
    }
    
});

module.exports = router;