var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();

var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: 'somerandomvalue',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

//passport init : session설정 뒤에 와야함
app.use(passport.initialize());
app.use(passport.session());

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
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(user.authId === id){
      return done(null, user)
    }
  }
  done('there is no user');
});

passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;

    for(var i=0; i<users.length; i++){
      var user = users[i];
      if(uname === user.username) {
        return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
          if(hash === user.password){
            console.log('LocalStrategy', user);
            done(null, user);
          } else {
            done(null, false);
          }
        });
      }
    }
    done(null, false);
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
    for(var i=0; i<users.lenth; i++){
      var user =users[i];
      if(user.authId === authId){
        return done(null, user);
      }
    }
    var newuser = {
      'authId':authId,
      'displayName': profile.displayName,
      'email': profile.emails[0].value
    }
    users.push(newuser);
    done(null, newuser);
  }
));

//LocalStrategy
app.post(
  '/auth/login',
  passport.authenticate(
    'local',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  )
);
//FacebookStrategy
app.get(
  '/auth/facebook',
  passport.authenticate(
    'facebook',
    {scope:'email'}
  )
);
app.get(
  '/auth/facebook/callback',
  passport.authenticate(
    'facebook', {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login'
    }
  )
);

app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      authId : 'local:'+req.body.username,
      username : req.body.username,
      password : hash,
      salt: salt,
      displayName : req.body.displayName
    };
    users.push(user);
    req.login(user, function(err){
      req.session.save(function(){
        res.redirect('/welcome');
      });
    });
  });
});

var users = [
  {
    authId:'local:egoing',
    username : 'egoing',
    password : 'JbSxG1H2cG3T1STHVVjtfHjSO03hfiw1GN6IUGCUqBkN9o3Zp2sZx6M7B7XHTRQhPZiYQwIcfEZIBDsqZ148yZPPVcIgJHUh8CM6O8i6WaSvcJU8kQUc9BnlkI/nE0ExebjO1NvMsJcGWtxZvntlE3ew1b8EDfa+AK0Tyf5E3dU=',
    salt: 'L+un0nx5Fj2zRM5J3YKoikB7Vlaow0EHEdO7ODJzXSdI1/2Mh7hAESBTNDbvmdFsLh07V1hSzqABft0P7mOl6w==',
    displayName:'Egoing'
  }
];
app.get('/auth/register', function(req, res){
  var output = `
    <h1>Register</h1>
    <form action='/auth/register' method='post'>
    <p>
    <input type='text' name='username' placeholder='username'>
    </p>
    <p>
    <input type='password' name='password' placeholder='password'>
    </p>
    <p>
    <input type='text' name='displayName' placeholder='displayName'>
    </p>
    <p>
    <input type='submit'>
    </p>
    </form>
  `;
  res.send(output);
});

app.get('/auth/login', function(req, res){
  var output = `
    <h1>Login</h1>
    <form action='/auth/login' method='post'>
    <p>
    <input type='text' name='username' placeholder='username'>
    </p>
    <p>
    <input type='password' name='password' placeholder='password'>
    </p>
    <p>
    <input type='submit'>
    </p>
    </form>
    <a href='/auth/facebook'>facebook</a>
  `;
  res.send(output);
});

app.listen(3000, function(){
    console.log('Connected 3000 port');
});
