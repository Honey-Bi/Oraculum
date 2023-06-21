const router = require('express').Router();
const { admin } = require('../middleware/adminValidation');
const User = require('../models/User');
const Main = require('../models/Main');
const { default: mongoose } = require('mongoose');

router.get('/', admin, async (req, res) => {
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

router.get('/users', admin, async (req, res) => {
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
            notAddDefault = ['created', 'tryCount','access'],
            notView = ['_id', 'userId','nowEvent'],
            addDefault = ['password'];
            // userMain = await Main.Main.find({}, {});

        res.render('./admin/users', {
            notView: notView,
            user: data, 
            notAddDefault: notAddDefault, 
            addDefault: addDefault
        });
        // userMain: userMain

    } catch (error) {   
        console.log(error)
    }
});

router.get('/events', admin, async (req, res) => {
    const id = req.decoded.user.id;
    try {
        const user = await User.findOne({ _id: id }, {access:1}) ;
        if (user.access != 1) {
            return res.redirect('/404');
        }
        const data = await Main.MainEvent.find().sort({event_code:1});
        let notView = ['_id', 'contents', 'next_event', 'rewards', 'choices']

        res.render('./admin/events', {
            event: data, 
            notView: notView,
        });

    } catch (error) {   
        console.log(error)
    }
});

router.post('/deleteOne', admin, async (req, res) => {
    try {
        let userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        let deleteId;
        if (req.body.type == 'users') {
            deleteId = await User.findOne({ _id: req.body.id}, {access: 1});  
        } 

        if (userId.access != 1 || deleteId.access == 1) {
            return res.status(400).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }

        if (req.body.type == 'users') {
            await User.deleteOne({_id: req.body.id});
            await Main.Main.deleteOne({userId: req.body.id});
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

router.post('/actionEvent', admin, async (req, res) =>  {
    try {
        const userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        if (userId.access != 1) {
            return res.status(401).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }
        
        const formData = req.body.formData;
        let data = {
            event_type: formData.eventType,
            event_code: formData.eventCode,
            title: formData.eventTitle,
            contents: formData.eventContents,
            choices: {
                left: formData.choice_left,
                right: formData.choice_right
            },
            rewards: {
                left: {
                    fuel: formData.left_fuel,
                    resource:formData.left_resource,
                    technology: formData.left_technology,
                    risk: formData.left_risk,
                },
                right: {
                    fuel: formData.right_fuel,
                    resource: formData.right_resource,
                    technology: formData.right_technology,
                    risk: formData.right_risk
                }
            },
            next_event: {
                left: (formData.leftEvent == 'default')? null : formData.leftEvent,
                right: (formData.rightEvent == 'default')? null : formData.rightEvent
            }
        }
        
        if(req.body.type == 'update') {
            await Main.MainEvent.findOneAndUpdate({_id: req.body.id}, {$set: data});
            console.log('event update accept');
        } else if(req.body.type == 'insert') {
            await new Main.MainEvent(data).save();
            console.log('event insert accept');
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

router.get('/getEvent', async (req, res) => {
    try {
        let events = await Main.MainEvent.findById(req.query.id);;
        return res.status(200).send(events);
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            code: 401,
            message: '실패했습니다.',
        });;
    }
});

module.exports = router;