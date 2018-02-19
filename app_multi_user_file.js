var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var sha256 = require('sha256');
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: 'somerandomvalue',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}));

app.get('/count', function(req, res){
  if(req.session.count){
    req.session.count++;
  }else{
    req.session.count = 1;
  }
  res.send('count : ' + req.session.count);
});

app.get('/auth/logout', function(req, res){
  delete req.session.displayName;
  return req.session.save(function(){
    res.redirect('/welcome');
  });
});

app.get('/welcome', function(req, res){
  //로그인 성공시 세션 다룰 코드
  if(req.session.displayName){
    //로그인 성공
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
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

app.post('/auth/login', function(req, res){

  var uname = req.body.username;
  var pwd = req.body.password;

  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(uname === user.username && sha256(pwd+user.salt) === user.password){
      req.session.displayName = user.displayName;
      return req.session.save(function(){
          res.redirect('/welcome');
      });
    }
  }
  res.send('there is no user <a href="/auth/login">login</a>');
});

app.post('/auth/register', function(req, res){
  var user = {
    username : req.body.username,
    password : req.body.password,
    displayName : req.body.displayName
  };
  users.push(user);
  req.session.displayName = req.body.displayName;
  req.session.save(function(){
    res.redirect('/welcome');
  });
});
var users = [
  {
    username : 'egoing',
    password : 'dbbbdd8010ef896e3fa976ddc376b5aba35eb66f21feaa7c898e2ea8b9f2b9f1',
    salt: 'asfasdf',
    displayName:'Egoing'
  },
  {
    username : 'K8805',
    password : '2c8951bbd5ddd080f158810a6169d9ac139d0e78762d53c1fcf10cd3d4658a73',
    salt: 'asdawqe',
    displayName:'K5'
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
  `;
  res.send(output);
})

app.listen(3000, function(){
    console.log('Connected 3000 port');
});