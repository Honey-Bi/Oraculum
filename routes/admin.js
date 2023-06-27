const router = require('express').Router();
const { admin } = require('../middleware/adminValidation');
const User = require('../models/User');
const Main = require('../models/Main');
const bcrypt = require("bcryptjs");

router.get('/', admin, async (req, res) => { //관리 페이지 기본
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

router.get('/management', admin, async (req, res) => { //관리페이지 뷰 
    const id = req.decoded.user.id;
    try {
        const user = await User.findById(id, {access:1}) ;
        if (user.access != 1) {
            return res.redirect('/404');
        }
        
        var data = {};
        var notView = [],
            notAddDefault = [],
            addDefault = [];
            eventList = {};
        if (req.query.type == 'user') {
            data = await User.find({}, {});
            notAddDefault = ['_id', 'created', 'tryCount','access', 'idType'];
            notView = ['_id', 'userId','nowEvent', 'created'];
            addDefault = ['password'];
            eventList = await Main.MainEvent.find({}, {
                event_type:1,
                event_code: 1,
                title: 1
            });
        } else if (req.query.type == 'event') {
            data = await Main.MainEvent.find().sort({event_code:1});
            notView = ['_id', 'contents', 'next_event', 'rewards', 'choices', 'prerequisites']
        }

        res.render('./admin/management', {
            data: data, 
            notView: notView,
            type: req.query.type,
            notAddDefault: notAddDefault,
            addDefault: addDefault,
            eventList: eventList
        });

    } catch (error) {   
        console.log(error)
    }
});

router.post('/deleteOne', admin, async (req, res) => { //유저 및 이벤트 삭제
    try {
        const userId = await User.findById(req.decoded.user.id, {access: 1}) ;
        let deleteId = {access: 0};
        if (req.body.type == 'users') {
            deleteId = await User.findById(req.body.id, {access: 1});  
        } 

        if (userId.access != 1 || deleteId.access == 1) {
            return res.status(400).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }

        if (req.body.type == 'user') {
            await User.deleteOne({_id: req.body.id})    ;
            await Main.Main.deleteOne({userId: req.body.id});
        } 
        if(req.body.type == 'event') {
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
            await Main.MainEvent.findByIdAndDelete(req.body.id)
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

router.post('/actionEvent', admin, async (req, res) =>  { // 이벤트 변경 및 생성
    try {
        const userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        if (userId.access != 1) {
            return res.status(401).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }
        
        const formData = req.body.formData;
        
        const eventCount = (req.body.actionType == 'update') ? formData.eventCode : await Main.MainEvent.find({event_type: formData.eventType}).count();

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

        if(req.body.actionType == 'update') {
            await Main.MainEvent.findByIdAndUpdate(
                formData, {$set: data
            });
            console.log('event update accept');
        } else if(req.body.actionType == 'insert') {
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

router.post('/updateUser', admin, async (req, res) => {
    try {
        const userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        if (userId.access != 1) {
            return res.status(401).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }
        const formData = req.body.formData;
        const mainData = {
            fuel: formData.fuel,
            resource: formData.resource,
            technology: formData.technology,
            risk: formData.risk,
            nowEvent: formData.update_nowEvent
        };
        let userData = {
            name: formData.update_name,
        };

        if (formData.update_pw) {
            const salt = await bcrypt.genSalt(10);
            userData['password'] = await bcrypt.hash(formData.update_pw, salt);;
        } 

        await new Main.Main.findByIdAndUpdate(formData.id, {$set: {mainData}});
        await new User.findByIdAndUpdate(formData.userId, {$set: {userData}});

        return res.status(200).json({
            code: 200,
            message: '성공했습니다.',
        });
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            code: 401,
            message: '실패했습니다.',
        });
    }
});

router.get('/getData', async (req, res) => { // 이벤트 가져오는
    try {
        let data = {};
        if(req.query.type == 'user') {
            data = await Main.Main.findOne({userId:req.query.id}).populate('userId');
        } else if(req.query.type == 'event') {
            data = await Main.MainEvent.findById(req.query.id);
        }
        
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            code: 401,
            message: '실패했습니다.',
        });
    }
});

module.exports = router;