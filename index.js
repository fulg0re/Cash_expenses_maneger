// MONGODB sudo systemctl start mongodb
// MONGODB sudo systemctl start mongod
var express = require('express');
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var flash = require('connect-flash');
var path = require('path');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var auth = require('./routes/authentication.js');
var expenses = require('./routes/expenses.js');
var mainConfig = require('./config/mainConfig.js');

var app = express();

app.engine('ejs', engine);

// app SETs...
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app USEs...
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({
    secret: 'some_secret_key',
    saveUninitialized: false,
    resave: false
}));
app.use(flash());
app.use('/authentication', auth);

app.listen(3000, function(){
    console.log('Server started on port 3000...');
});

app.use(function(req, res, next) {
    //verify token in cookies
    jwt.verify(req.cookies.auth_token, mainConfig.tokenSecretKey, (err, authData) => {
        if(err) {
            //if token expires, redirect on login page
            res.redirect('/authentication/login');
        } else {
            //if token not expires, generate new token,set in cookie and go next
            jwt.sign({authUser: authData.authUser}, mainConfig.tokenSecretKey, {expiresIn: '1800s'}, (err, newToken) => {
                res.cookie('auth_token', newToken);
                res.cookie('login', authData.authUser.login);
                next();
            });
        }
    });
});

var cashExpenses = require('./model/cashExpenses.js');

app.use('/expenses', expenses);

app.get('/', function(req, res) {
  var query = getQueryFromFilter(req.cookies);
  var limit = parseInt(req.cookies.filter_limit, 10);

  cashExpenses.getByQuery(query, limit, function(err, userExpenses){
    if (err) throw err;

    res.render("main/homePage.ejs", {
      title: mainConfig.homeTitle,
      messages: req.flash(),
      userExpenses: userExpenses,
      currency: mainConfig.currency
    });
  });
});

function getQueryFromFilter(filterCookies) {
  var query = {
    login: filterCookies.login
  };

  if (typeof filterCookies.filter_day !== 'undefined') {
    query.day = filterCookies.filter_day
  }

  if (typeof filterCookies.filter_month !== 'undefined') {
    query.month = filterCookies.filter_month
  }

  if (typeof filterCookies.filter_year !== 'undefined') {
    query.year = filterCookies.filter_year
  }

  return query;
}
