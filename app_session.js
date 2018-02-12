var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  secret: 'somerandomvalue',
  resave: false,
  saveUninitialized: true
}));

app.get('/count', function(req, res){
  if(req.session.count){
    req.session.count++;
  }else{
    req.session.count = 1;
  }
  res.send('count : ' + req.session.count);
});

app.post('/auth/login', function(req, res){
  var user = {
    username : 'egoing',
    password : '111'
  };

  var uname = req.body.username;
  var pwd = req.body.password;

  if(uname === user.username && pwd === user.password){
    res.redirect('/welcome');
  }else{
    res.send('there is no user <a href="/auth/login">login</a>');
  }

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
