const router = require('express').Router();
const { admin } = require('../middleware/adminValidation');
const User = require('../models/User');
const Main = require('../models/Main');
const Card = require('../models/Card');
const bcrypt = require("bcryptjs");
const fs = require('fs');

const multer = require('multer');
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, 'views/img');
    },
    filename(req, file, callback) {
        let array = file.originalname.split('.');
        array[0] = array[0] + '_';
        array[1] = '.' + array[1];
        array.splice(1, 0, Date.now().toString());
        const result = array.join('');
        console.log(`image upload: ${result}`);
        callback(null, result);
    }
});
const upload = multer({storage});


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
        
        var data = notView = notAddDefault = addDefault = select_list = [],
            eventList = cardList = {};

        let select_type = req.query.select_type;
        var regex = new RegExp("("+req.query.search_text+")");
        switch (req.query.type) {
            case 'user': // user 정보
                select_list = ['all', 'basic', 'naver', 'kakao', 'test']
                notAddDefault = ['_id', 'created', 'tryCount','access', 'idType'];
                notView = ['_id', 'userId','nowEvent', 'created'];
                addDefault = ['password'];

                if (select_type !== undefined) {
                    query = {
                        idType: select_type,
                        $or: [{name: regex}, {email: regex}]
                    }

                    if (select_type == 'all') delete query.idType
                    if (!req.query.search_text) delete query.$or;

                    data = await User.find(query);   
                }
                eventList = await Main.MainEvent.find({}, {
                    event_type:1,
                    event_code: 1,
                    title: 1
                });
                break;
            case 'event': // event 정보
                select_list = ['all', 'random', 'link', 'ending'];
                notView = ['_id', 'contents', 'next_event', 'rewards', 'choices', 'prerequisites', 'view']

                if (select_type !== undefined) {
                    var query = {
                        event_type: select_type,
                        title: regex
                    }
                    if (select_type=='all') delete query.event_type;
                    if (!req.query.search_text) delete query.title;
    
                    data = await Main.MainEvent.find(query).sort({event_type: -1, event_code:1});
                }
                eventList = await Main.MainEvent.find({event_type: 'link'});
                cardList = await Card.find();
                break;
            case 'card': // card 정보
                select_list = ['all', 'scene', 'npc'];
                notView = ['_id']
                if (select_type !== undefined) {
                    var query = {
                        type: select_type,
                        $or: [{name: regex}, {file: regex}]
                    }
                    if (select_type=='all') delete query.type;
                    if (!req.query.search_text) delete query.$or;
                
                    data = await Card.find(query);
                }
                break;
        }

        res.render('./admin/management', {
            data: data, 
            notView: notView,
            select_list: select_list,
            type: req.query.type,
            search: select_type,
            notAddDefault: notAddDefault,
            addDefault: addDefault,
            eventList: eventList,
            cardList: cardList
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
            await User.findByIdAndDelete(req.body.id);
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
        if (req.body.type == 'card') {
            const delCard = await Card.findById(req.body.id);

            if (fs.existsSync("views/img/" + delCard.file)) {
                // 파일이 존재한다면 true 그렇지 않은 경우 false 반환
                try {
                    fs.unlinkSync("views/img/" + delCard.file);
                    console.log("image delete");
                } catch (error) {
                    console.log(error);
                }
            }
            await Card.findByIdAndDelete(req.body.id);
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
            return res.status(400).json({
                code: 400,
                message: '권한이 없습니다.',
            });
        }
        const formData = req.body;

        const user = await Main.Main.findOne({userId: formData.id}).populate('userId');

        user.fuel = formData.fuel;
        user.resource = formData.resource;
        user.technology = formData.technology;
        user.risk = formData.risk;
        user.nowEvent = formData.update_nowEvent;
        user.userId.name = formData.update_name;

        if (formData.update_pw) {

            const salt = await bcrypt.genSalt(10);
            user.userId.password = await bcrypt.hash(formData.update_pw, salt);
        } 

        user.save();

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

router.post('/actionEvent', admin, async (req, res) =>  { // 이벤트 변경 및 생성
    try {
        const userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        if (userId.access != 1) {
            return res.status(400).json({
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
            view: formData.eventCard,
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
            is_ending: (req.body.is_ending == 'true') ? true : false
        }

        if(req.body.actionType == 'update') {
            await Main.MainEvent.findByIdAndUpdate(formData.id, {$set: data});
            console.log('event update accept');
        } else {
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
router.post('/actionCard', admin, upload.single('image'), async (req, res) => {
    try {
        const userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        if (userId.access != 1) {
            return res.status(401).json({
                code: 401,
                message: '권한이 없습니다.',
            });
        }

        const formData = req.body;
        let filename = extension = '';

        if (req.file) {
            files = req.file.filename.split('.')
            filename = files[0];
            extension = files[1]
        }
        if (formData.actionType == 'insert') {
            upload.single('image');
            new Card({
                type: formData.type,
                name: formData.name,
                file: filename,
                extension: extension
            }).save();
        } else if (req.body.actionType == 'update') {
            const card = await Card.findById(formData.id);

            card.type = formData.type;
            card.name = formData.name;
            
            if (req.file) {
                console.log('image 변경');
                if (fs.existsSync(`views/img/${card.file}.png`)) {
                    // 파일이 존재한다면 true 그렇지 않은 경우 false 반환
                    try {
                        fs.unlinkSync(`views/img/${card.file}.png`);
                        console.log("image delete");
                    } catch (error) {
                        console.log(error);
                    }
                }
                card.file = files[0];
                card.extension = files[1];
                
            }
            card.save();
        }
        res.redirect(req.headers.referer);

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            code: 401,
            message: '실패했습니다.',
        });
    }
});

router.get('/getData', admin, async (req, res) => { // 이벤트 가져오는
    try {
        const userId = await User.findOne({ _id: req.decoded.user.id }, {access: 1}) ;
        if (userId.access != 1) {
            return res.status(401).json({
                code: 401,
                message: '권한이 없습니다.',
            });
        }

        let data = {};
        switch (req.query.type) {
            case 'user':
                data = await Main.Main.findOne({userId:req.query.id}).populate('userId');
                break;
            case 'event':
                data = await Main.MainEvent.findById(req.query.id).populate('view');
                break;
            case 'card':
                data = await Card.findById(req.query.id);
                break;
            default:
                break;
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

// db.mains.updateOne({},{$set:{nowEvent:ObjectId("6495120e349f970d45344f5a")}})
// 이벤트 삭제오류 대비