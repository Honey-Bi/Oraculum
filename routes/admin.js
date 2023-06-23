const router = require('express').Router();
const { admin } = require('../middleware/adminValidation');
const User = require('../models/User');
const Main = require('../models/Main');
const { default: mongoose } = require('mongoose');

router.get('/', admin, async (req, res) => {
    const id = req.decoded.user.id;
    try {
        const user = await User.findOne({ _id: id }) ;
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
        const user = await User.findOne({ _id: id }, {access:1}) ;
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
        let notView = ['_id', 'contents', 'next_event', 'rewards', 'choices', 'prerequisites']

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
        const userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        let deleteId = {access: 0};
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
            await User.deleteOne({_id: req.body.id})    ;
            await Main.Main.deleteOne({userId: req.body.id});
        } 
        if(req.body.type == 'events') {
            const delEvent = await Main.MainEvent.findById(req.body.id);
            const renameCode = await Main.MainEvent.find({
                event_type: delEvent.event_type,
                event_code: {'$gt': delEvent.event_code}
            });
            
            for (let i = 0; i < renameCode.length; i++) {
                const rename = renameCode[i];
                renameCode[i].event_code = renameCode[i].event_code -1
                await rename.save();
            }
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
        
        const eventCount = (req.body.type == 'update') ? formData.eventCode : await Main.MainEvent.find({event_type: formData.eventType}).count();

        let data = {
            event_type: formData.eventType,
            event_code: eventCount,
            title: formData.eventTitle,
            contents: formData.eventContents,
            prerequisites: {
                over: {
                    fuel: (formData.over_fuel) ? formData.over_fuel : 0,
                    resource: (formData.over_resource) ? formData.over_resource : 0,
                    technology: (formData.over_technology) ? formData.over_technology : 0,
                    risk: (formData.over_risk) ? formData.over_risk : 0
                },
                under: {
                    fuel: (formData.under_fuel) ? formData.under_fuel : 100,
                    resource: (formData.under_resource) ? formData.under_resource : 100,
                    technology: (formData.under_technology) ? formData.under_technology : 100,
                    risk: (formData.under_risk) ? formData.under_risk : 100
                },
                hold: formData.prerequisites
            },
            choices: {
                left: formData.choice_left,
                right: formData.choice_right
            },
            rewards: {
                left: {
                    fuel: (formData.left_fuel) ? formData.left_fuel : 0,
                    resource:(formData.left_resource) ? formData.left_resource : 0,
                    technology: (formData.left_technology) ? formData.left_technology : 0,
                    risk: (formData.left_risk) ? formData.left_risk : 0,
                },
                right: {
                    fuel: (formData.right_fuel) ? formData.right_fuel : 0,
                    resource: (formData.right_resource) ? formData.right_resource : 0,
                    technology: (formData.right_technology) ? formData.right_technology : 0,
                    risk: (formData.right_risk) ? formData.right_risk : 0
                }
            },
            next_event: {
                left: (formData.leftEvent == 'default')? null : formData.leftEvent,
                right: (formData.rightEvent == 'default')? null : formData.rightEvent
            },
            is_ending: (formData.eventType=='ending') ? true : false
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
        const events = await Main.MainEvent.findById(req.query.id);;
        return res.status(200).send(events);
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            code: 401,
            message: '실패했습니다.',
        });;
    }
});

// router.get('/addEvent', async (req, res) => {
//     await new Main.MainEvent({
//         event_type: 'random',
//         event_code: 0,
//         title: 'Test Event 1',
//         contents: 'This is a test event 1.',
//         prerequisites: {
//             over: {
//                 fuel: 0,
//                 resource: 0,
//                 technology: 0,
//                 risk: 0
//             },
//             under: {
//                 fuel: 100,
//                 resource: 100,
//                 technology: 100,
//                 risk: 100
//             },
//             hold: []
//         },
//         choices: {
//             left: 'Option 1',
//             right: 'Option 2',
//         },
//         rewards: {
//             left: {
//                 fuel: 10,
//                 resource: 0,
//                 technology: 0,
//                 risk: 0,
//             },
//             right: {
//                 fuel: 0,
//                 resource: 20,
//                 technology: 0,
//                 risk: 0,
//             },
//         },
//     }).save();
// });

module.exports = router;