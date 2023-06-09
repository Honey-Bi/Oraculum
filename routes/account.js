const router = require('express').Router();
const bcrypt = require("bcryptjs");
const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const SECRET_KEY = config.jwtSecretKey;


router.get('/login', (req, res) => {
    res.render('./account/login');
});

router.post("/login-confirm", async (req, res) => {
    const id = req.body.id, 
          pw = req.body.pw;
    try {
        let user = await User.findOne({email: id});
        if(!user){
            return res.status(401).json({
                code: 401,
                message: '아이디 혹은 비밀번호가 틀림니다.',
            });;
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
            const payload = {
                type: 'JWT',
                user: {
                    id: user._id,
                },
            };
            token = jwt.sign(
                payload,            // token으로 변환할 데이터
                SECRET_KEY,        // secret key 값
                { expiresIn: "1h", },// token의 유효시간을 1시간으로 설정
            );

            // res.status(statusCode.OK).send(util.success(statusCode.OK, responseMsg.LOGIN_SUCCESS, {
            //     /* 생성된 Token을 클라이언트에게 Response */
            //      token: jwtToken.token                
            // }));

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
    res.render('./account/register');
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
          password = req.body.password;
    try {
        // email을 비교하여 user가 이미 존재하는지 확인
        // let user = await User.findOne({ email });
        // if (user) {
        //     return res.status(400).json({ errors: [{ msg: "User already exists" }] });
        // }
        // email-confirm 처리를 통해 먼저 확인하기에 주석처리함
              
        // user에 name, email, password 값 할당        
        user = new User({
            name,
            email,
            password,
        });
  
        // password를 암호화 하기
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
  
        await user.save(); // db에 user 저장
        res.send(true);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;