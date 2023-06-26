const router = require('express').Router();
const { auth } = require('../middleware/userValidation');
const userStatus = require('../middleware/userStatus');
const bcrypt = require("bcryptjs");
const User = require('../models/User'); 
const Main = require('../models/Main'); 
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');

const SECRET_KEY = config.jwtSecretKey;
const client_id = config.naver.client_id;
const client_secret = config.naver.client_secret;
const redirectURI = config.naver.redirectURI;

router.get('/callback', function (req, res) {
    code = req.query    .code;
    state = req.query.state;
    api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
        + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
                // res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                // res.end(body);
                req.session.naver = JSON.parse(body);
                res.redirect('/account/member');
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

router.get('/member', function (req, res) {
    var api_url = 'https://openapi.naver.com/v1/nid/me';
    var request = require('request');
    var token = req.session.naver.access_token;
    var header = "Bearer " + token; 
    var options = {
        url: api_url,
        headers: {
            'Authorization': header,
        }
    };
    request.get(options, async function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            // res.end(body);
            const naver_res =JSON.parse(body).response;
            
            const user = await User.findOne({email: naver_res.email});
            if (!user) { // 유저정보가 존재하지 않을시
                const newUser = new User({
                    name: naver_res.nickname,
                    email: naver_res.email,
                    password: ' ',
                    idType: 'naver'
                });
                newUser.save();

                console.log(newUser._id);
                const event = await Main.MainEvent.findOne({ 
                    event_type: 'link',
                    event_code: 0 // 시작 이벤트
                }, {_id:1})._id;

                new Main.Main({
                    userId: newUser._id,
                    nowEvent: event,
                }).save();
                setToken(req, newUser._id);
            } else {
                setToken(req, user._id);
            }
            console.log('네이버 로그인성공');
            res.redirect('/');
        } else {
            console.log('error');
            if(response != null) {
                res.status(response.statusCode).end();
                console.log('error = ' + response.statusCode);
            }
            res.redirect('/account/login');
        }
    });
});

router.get('/login', async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    state = await bcrypt.hash(Date.now().toString(), salt);
    api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
    res.render('./account/login', {
        title: 'Login', 
        isLogin: userStatus.isLogin(req),
        api_url: api_url
    });
});

router.post("/login-confirm", async (req, res) => {
    const id = req.body.id, 
          pw = req.body.pw;
    try {
        let user = await User.findOne({email: id, idType: 'basic'}).select('+password');
        if(!user){
            return res.status(401).json({
                code: 401,
                message: '아이디 혹은 비밀번호가 틀림니다.',
            });
        }
        console.log("id confirm");
        // await User.findOne({email: id}, (err, user)=>{
        // 요청된 이메일이 db에 있다면 비밀번호 일치여부 확인

        bcrypt.compare(pw, user.password, (error, result)=>{  // 기존 로그인 확인 코드
            if(result) console.log('로그인성공');
            else {
                console.log('로그인실패: 비번틀림');
                return res.status(401).json({
                    code: 401,
                    message: '아이디 혹은 비밀번호가 틀림니다.',
                });;
            }

            setToken(req, user._id);
            return res.status(200).json({
                code: 200,
                message: '토큰이 발급되었습니다.',
                token: token
            });
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

router.get('/register', (req, res) => {
    res.render('./account/register', { title: 'Sign Up', isLogin: userStatus.isLogin(req) });
});

router.post('/exist-confirm', async (req, res) => {
    try {
        let input = req.body.input;
        var user;
        if (input.includes('@')) {
            user = await User.findOne({ email: input }) ;
        } else {
            user = await User.findOne({ name: input }) ;
        }
        if (user) {
            res.send(true);
        } else {
            res.send(false);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({"err" : "Server Error"});
    }
});

router.post("/register-confirm", async (req, res) => {
    const name = req.body.name, 
          email = req.body.id, 
          password = req.body.password,
          idType = req.body.idType;
    try {
        // email을 비교하여 user가 이미 존재하는지 확인
        // let user = await User.findOne({ email });
        // if (user) {
        //     return res.status(400).json({ errors: [{ msg: "User already exists" }] });
        // }
        // email-confirm 처리를 통해 먼저 확인하기에 주석처리함
              
        // user에 name, email, password 값 할당        
        let user = new User({
            name: name,
            email: email,
            password: password,
            idType: (req.body.idType)?req.body.idType:'basic',
        });
  
        // password를 암호화 하기
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
  
        await user.save(); // db에 user 저장

        let id = user._id;
        let event = await Main.MainEvent.findOne({ 
            event_type: 'link',
            event_code: 0 // 시작 이벤트
        })._id;

        new Main.Main({
            userId: id,
            nowEvent: event,
        }).save();

        if (req.body.idType != 'test') {
            setToken(req, user._id);
        }

        res.send(true);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

router.get('/logout', (req, res) => {
    var session = req.session;
    try {
        if (session.token || session.naver) { //세션정보가 존재하는 경우
            req.session.destroy(function (err) {
                if (err)
                    console.log(err);
                else {
                    res.redirect(req.query.callback);
                }
            })
        }
    }
    catch (e) {
        console.log(e)
    }
})

router.get('/mypage', auth, (req, res) => {
    res.render('./account/mypage', { title: 'My page', isLogin: userStatus.isLogin(req) });
});

router.get('/pw-forgot', (req, res) => {
    res.render('./account/forgotPw', {
        title: 'Forgot PassWord',
        isLogin: false
    })
});

module.exports = router;

function setToken(req, id) {
    const payload = {
        type: 'JWT',
        user: {
            id: id,
        },
    };
    token = jwt.sign(
        payload,                // token으로 변환할 데이터
        SECRET_KEY,             // secret key 값
        { expiresIn: "1h", },// token의 유효시간을 1시간으로 설정
    );
    req.session.token = token;
}