var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: _storage })
var fs = require('fs');
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
app.use(bodyParser.urlencoded({ extended: false }));
app.locals.pretty = true;
app.set('views', './views_mysql');
app.set('view engine', 'pug');
app.get('/upload', function(req, res){
  res.render('upload');
});
app.post('/upload', upload.single('userfile'), function(req, res){
  res.send('Uploaded : '+req.file.filename);
});

app.post('/topic/add', function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var sql = 'INSERT INTO topic (title, description, author) VALUES(?,?,?)';
  conn.query(sql,[title,description, author], function(err, result, fields){
    if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }else{
        res.redirect('/topic/'+result.insertId);
      }
  });
});

app.get('/topic/add', function(req, res){
  var sql = 'SELECT id,title FROM topic';
  conn.query(sql, function(err, topics, fields){
    if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
    res.render('add', {topics:topics});
  });
});

app.get(['/topic', '/topic/:id'], function(req, res){
  var sql = 'SELECT id,title FROM topic';
  conn.query(sql, function(err, topics, fields){
    var id = req.params.id;
    if(id){
      //상세보기
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          res.render('view', {topics:topics, topic:topic[0]});
        }
      });
    }else{
      //뷰
      res.render('view', {topics:topics});
    }
  });
});

app.listen(3000, function(){
  console.log('Connected, 3000 port!');
})
