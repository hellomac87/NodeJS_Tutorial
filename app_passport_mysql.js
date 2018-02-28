var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();
var mysql = require('mysql');
var db_config = require('./config/mysql_config.json');
var conn = mysql.createConnection({
  host     : db_config.host,
  user     : db_config.user,
  password : db_config.password,
  database : db_config.database
});
conn.connect();
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: 'somerandomvalue',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '111111',
    database: 'o2'
  })
}));

//passport init : session설정 뒤에 와야함
app.use(passport.initialize());
app.use(passport.session());

app.set('views', './views/mysql');
app.set('view engine', 'pug');

app.get('/count', function(req, res){
  if(req.session.count){
    req.session.count++;
  }else{
    req.session.count = 1;
  }
  res.send('count : ' + req.session.count);
});

app.get('/auth/logout', function(req, res){
  req.logout();
  return req.session.save(function(){
    res.redirect('/welcome');
  });
});

app.get('/welcome', function(req, res){
  //로그인 성공시 세션 다룰 코드
  if(req.user && req.user.displayName){
    //로그인 성공
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href='/auth/logout'>logout</a>
      `);
  }else{
    //로그인 실패, 없음
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href='/auth/login'>Login</a></li>
        <li><a href='/auth/register'>register</a></li>
      </ul>
      `);
  }
});

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.authId);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  var sql = 'SELECT * FROM users WHERE authId=?';
  conn.query(sql, [id], function(err, results){
    console.log(sql, err, results);
    if(err){
      console.log(err);
      done('There is no user');
    }else{
      done(null, results[0]);
    }
  });
  // for(var i=0; i<users.length; i++){
  //   var user = users[i];
  //   if(user.authId === id){
  //     return done(null, user)
  //   }
  // }
  // done('there is no user');
});

passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    var sql = 'SELECT * FROM users WHERE authId=?'
    conn.query(sql,['local:'+uname], function(err, results){
      if(err){
        return done('There is no user');
      }else{
        var user = results[0];
        return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
          if(hash === user.password){
            console.log('LocalStrategy', user);
            done(null, user);
          } else {
            done(null, false);
          }
        });
      }
    })
  }
));

passport.use(new FacebookStrategy({
    clientID: '337257946769997',
    clientSecret: '5777399cad8042e97b8b13e07ec7cbb0',
    callbackURL: "/auth/facebook/callback",
    profileFields:['id','email','name','displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    var authId = 'facebook:'+profile.id;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, [authId], function(err, results){
      if(results.length>0){
        done(null, results[0]);
      } else {
        var sql = 'INSERT INTO users SET ?';
        var newuser = {
          'authId':authId,
          'displayName': profile.displayName,
          'email': profile.emails[0].value
        }
        conn.query(sql, [newuser], function(err, results){
          if(err){
            console.log(err);
            done('err');
          } else {
            done(null, newuser);
          }
        });
      }
    });
  }
));

var auth = require('./routes/mysql/auth')(passport);
app.use('/auth', auth);

app.listen(3000, function(){
    console.log('Connected 3000 port');
});
