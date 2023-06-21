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
    try {
        let main = await Main.Main.findOne({
            userId: req.decoded.user.id
        }).populate('nowEvent');

        var selectResult = [];
        if (req.body.answer == 'right') {
            selectResult = main.nowEvent.r_result;
        } else if (req.body.answer == 'left') {
            selectResult = main.nowEvent.l_result;
        }
        var stats = [ //현재 상태 저장
            main.fuel,
            main.resourse,
            main.technology,
            main.risk
        ]

        for (i in selectResult) { //선택 결과 계산
            stats[i] += selectResult[i];
        } 

        let nextEventId = isOver(stats);
        let nextEvent = main.nowEvent.next_event;


        if (nextEventId) { // 게임 오버시
            nextEvent = await Main.MainEvent.findOne({event_type: 'ending', event_code: nextEventId});
        } else if (nextEvent === null){ //정해진 다음 이벤트가 없을경우
            nextEvent = await Main.MainEvent.findOne({event_type: 'random'}).skip(getRandom());
        }

        await Main.Main.updateOne({
            _id: main._id
        }, {
            $set: {
                nowEvent: nextEvent._id,
                fuel: stats[0],
                resourse: stats[1],
                technology: stats[2],
                risk: stats[3]
            }
        });
        return res.status(200).send(true);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);  
    }
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

function isOver(stats) {
    for (i in stats) {
        if(stats[i] >= 100) {
            ++i;
            return i;
        } else if(stats[i] <= 0) {
            ++i;
            return i*2;
        }
    }
    return 0;
    // 1 = 연료과다
    // 2 = 자원과다
    // 3 = 기술과다
    // 4 = 위험과다
    // 5 = 연료부족
    // 6 = 자원부족
    // 7 = 기술부족
    // 8 = 위험부족
}

function getRandom() {
    let min = 1;
    let max = Main.MainEvent.find({event_code:'random'}).count();
    return Math.floor(Math.random() * (max+1 - min) + min);
}   

function arrayMax(arr) {
    var len = arr.length, max = -Infinity;
    while (len--) {
        if (arr[len] > max) {
            max = arr[len];
        }
    }
    return arr.indexOf(max);
};

module.exports = router;