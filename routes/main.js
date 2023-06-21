const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const Main = require('../models/Main');

router.get('/', auth, (req, res) => {
    res.render('./main', {title: 'main', isLogin: true,});
});

router.post('/select', auth, async (req, res) =>{
    try {
        const main = await Main.Main.findOne({
            userId: req.decoded.user.id
        }).populate('nowEvent');


        let rewards, nextEvent;
        if (req.body.isLeft) {
            rewards = main.nowEvent.rewards.left;
            nextEvent = main.nowEvent.next_event.left;
        } else if (req.body.isLeft) {
            rewards = main.nowEvent.rewards.right;
            nextEvent = main.nowEvent.next_event.right;
        }

        let stats = {
            fuel: main.fuel + rewards.fuel,
            resourse:  main.resourse + rewards.resourse,
            technology: main.technology + rewards.technology,
            risk: main.risk + rewards.risk,
        }

        console.log(stats);

        let nextEventId = isOver(stats); // 게임오버인지 확인
        if (nextEventId) { // 게임 오버시
            nextEvent = await Main.MainEvent.findOne({
                event_type: 'ending', event_code: nextEventId
            });
        } else if (nextEvent === null){ //정해진 다음 이벤트가 없을경우
            nextEvent = await Main.MainEvent.findOne({
                event_type: 'random'
            }).skip(getRandom());
        }
        console.log(nextEvent._id);

        // await Main.Main.updateOne({
        //     _id: main._id
        // }, {
        //     $set: {
        //         turn: ++main.turn,
        //         nowEvent: nextEvent._id,
        //         fuel: stats.fuel,
        //         resourse: stats.resourse,
        //         technology: stats.technology,
        //         risk: stats.risk
        //     }
        // });
        return res.status(200).send(true);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);  
    }
});

router.post('/getView', auth, async (req, res) => {
    try {
        const main = await Main.Main.findOne({
            userId: req.decoded.user.id
        }, {
            fuel: 1,
            resourse: 1,
            technology: 1,
            risk: 1
        }).populate('nowEvent', {
            contents: 1,
            choices: 1
        });
        return res.status(200).send(main);
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