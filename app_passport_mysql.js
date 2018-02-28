var app = require('./config/mysql/express')();
var passport = require('./config/mysql/passport')(app);

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

var auth = require('./routes/mysql/auth')(passport);
app.use('/auth', auth);

app.listen(3000, function(){
    console.log('Connected 3000 port');
});
