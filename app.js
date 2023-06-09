const path = require ('path');
const express = require("express");
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const app = express();

const userStatus = require('./middleware/userStatus');
const connectDB = require("./config/db");
connectDB();

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/css', express.static(path.join(__dirname, '/views/css')));
app.use('/js', express.static(path.join(__dirname, '/views/js')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressSession({
  secret: 'my key',
  resave: false,
  saveUninitialized: false
}));

const account = require('./routes/account');
const main = require('./routes/main');
// const { auth } = require('./middleware/userValidation');

app.use('/account', account);
app.use('/main', main);

app.get('/', async (req, res) => {
  res.render('',{ title: 'Oraculum', isLogin: userStatus.isLogin(req) });
});

app.all('*', (req,res) => {
  // res.render('./404', {title: '404 Not', isLogin: userStatus.isLogin(req) });
  res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>')
})


app.listen(8080, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 8080");
});