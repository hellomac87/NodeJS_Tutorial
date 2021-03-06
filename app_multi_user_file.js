var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

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
    if(uname === user.username) {
      return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
        if(hash === user.password){
          req.session.displayName = user.displayName;
          return req.session.save(function(){
            res.redirect('/welcome');
          });
        } else {
          res.send('there is no user <a href="/auth/login">login</a>');
        }
      });
    }
    // if(uname === user.username && sha256(pwd+user.salt) === user.password){
    //   req.session.displayName = user.displayName;
    //   return req.session.save(function(){
    //       res.redirect('/welcome');
    //   });
    // }
  }
  res.send('there is no user <a href="/auth/login">login</a>');
});

app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      username : req.body.username,
      password : hash,
      salt: salt,
      displayName : req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
      res.redirect('/welcome');
    });
  });
});

var users = [
  {
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
  `;
  res.send(output);
})

app.listen(3000, function(){
    console.log('Connected 3000 port');
});
