const path = require ('path');
const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

const connectDB = require("./config/db");
connectDB();

app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/css', express.static(path.join(__dirname, '/views/css')));
app.use('/js', express.static(path.join(__dirname, '/views/js')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());



const account = require('./routes/account');
app.use('/account', account);

app.get('/', (req, res) => {
  res.render('', {title: 'ORACULUM'});
});


app.listen(8080, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 8080");
});

