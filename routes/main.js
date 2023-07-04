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


        var rewards, nextEvent;
        if (req.body.isLeft == 1) {
            rewards = main.nowEvent.rewards.left;
            nextEvent = main.nowEvent.next_event.left;
        } else {
            rewards = main.nowEvent.rewards.right;
            nextEvent = main.nowEvent.next_event.right;
        }

        let stats = {
            fuel: main.fuel + rewards.fuel,
            resource:  main.resource + rewards.resource,
            technology: main.technology + rewards.technology,
            risk: main.risk + rewards.risk,
        }
        if (main.nowEvent.nextEvent == "6495120e349f970d45344f5a") {
            stats.fuel = 0;
            stats.resource = 0;
            stats.technology = 0;
            stats.risk = 0;
        } else if (isOver(stats) && !main.nowEvent.is_ending) { // 게임오버인지 확인
            nextEvent = await Main.MainEvent.find(
                getQuery('ending', stats)
            );

            nextEvent = nextEvent[getRandom(nextEvent.length)];

            stats.fuel = 0;
            stats.resource = 0;
            stats.technology = 0;
            stats.risk = 0;
        } else if (nextEvent === null) { //정해진 다음 이벤트가 없을경우
            nextEvent = await Main.MainEvent.find(
                getQuery('random', stats)
            );
            nextEvent = nextEvent[getRandom(nextEvent.length)];
        } 
        
        for (i in stats) {
            main[i] = stats[i];
        }
        main.nowEvent = nextEvent;
        await main.save();

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
            resource: 1,
            technology: 1,
            risk: 1
        }).populate('nowEvent', {
            contents: 1,
            choices: 1,
            view:1
        })
        // console.log(main2);
        // main.view = main2;
        return res.status(200).send(main);
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);    
    }
    
});

function isOver(stats) {
    for (i in stats) {
        if(stats[i] >= 100 || stats[i] <= 0) {
            return true;
        }
    }
    return false;
}

function getQuery(type, stats) {
    return {
        'event_type': type,
        'prerequisites.over.fuel': {"$lt" : stats.fuel},
        'prerequisites.under.fuel': {"$gt" : stats.fuel},
        'prerequisites.over.resource': {"$lt" : stats.resource},
        'prerequisites.under.resource': {"$gt" : stats.resource},
        'prerequisites.over.technology': {"$lt" : stats.technology},
        'prerequisites.under.technology': {"$gt" : stats.technology},
        'prerequisites.over.risk': {"$lt" : stats.risk},
        'prerequisites.under.risk': {"$gt" : stats.risk},
    };
}

function getRandom(max) {
    let min = 0;  // 랜덤 최소치
    return Math.floor(Math.random() * (max - min) + min);
}   

module.exports = router;