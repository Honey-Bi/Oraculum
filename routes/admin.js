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
        let user = await User.findOne({ _id: id }, {access:1}) ;
        if (user.access != 1) {
            return res.redirect('/404');
        }

        // var data2 = await Main.Main.find().populate([
        //     { path: 'userId' },
        //     { path: 'nowEvent' }
        // ]);
        
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
        let user = await User.findOne({ _id: id }, {access:1}) ;
        if (user.access != 1) {
            return res.redirect('/404');
        }
        var data = await Main.MainEvent.find({}, {});

        res.render('./admin/events', {
            event: data, 
        });

    } catch (error) {   
        console.log(error)
    }
});

router.post('/deleteOne', auth, async (req, res) => {
    try {
        let userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        let deleteId;
        if (req.body.type == 'users') {
            deleteId = await User.findOne({ _id: req.body.id}, {access: 1});  
        } 

        if (userId.access != 1 || deleteId.access == 1) {
            return res.status(401).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }

        if (req.body.type == 'users') {
            await User.deleteOne({_id: req.body.id});
        } 
        if(req.body.type == 'events') {
            await Main.MainEvent.deleteOne({_id: req.body.id})
        }

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

router.post('/addEvent', auth, async (req, res) =>  {
    try {
        let userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        if (userId.access != 1) {
            return res.status(401).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }
        
        let mainEvent = new Main.MainEvent({
            event_code: req.body.event_code,
            title: req.body.title,
            contents: req.body.contents,
            r_text: req.body.r_text,
            l_text: req.body.l_text,
            r_result: req.body.r_result,
            l_result: req.body.l_result,
            next_event: (req.body.next_event == 'default')? null : req.body.next_event
        });

        await mainEvent.save();

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