module.exports = function(){
  var Route = require('express').Router();
  var conn = require('../../config/mysql/db')();

  Route.get('/:id/delete', function(req, res){
    var sql = 'SELECT id,title FROM topic';
    var id = req.params.id;
    conn.query(sql, function(err, topics, fields){
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err,topic){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          if(topic.length === 0){
            console.log("there is no record");
            res.status(500).send('Internal Server Error');
          }else{
            res.render('topic/delete',{topics:topics,topic:topic[0]});
          }
        }
      });
    });
    // var id = req.params.id;
    // var sql = 'DELETE FROM topic WHERE id=?';
    // conn.query(sql, [id], function(err, rows, fields){
    //   if(err){
    //     console.log(err);
    //     res.status(500).send('Internal Server Error');
    //   }else{
    //     res.redirect('/topic');
    //   }
    // });
  });
  Route.post('/:id/delete',function(req, res){
    var id = req.params.id;
    var sql = 'DELETE FROM topic WHERE id=?';
    conn.query(sql, [id], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }else{
        res.redirect('/topic');
      }
    });
  })

  Route.post('/add', function(req, res){
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

  Route.get('/add', function(req, res){
    var sql = 'SELECT id,title FROM topic';
    conn.query(sql, function(err, topics, fields){
      if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
      }
      res.render('topic/add', {topics:topics});
    });
  });

  Route.get(['/:id/edit'], function(req, res){
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
            res.render('topic/edit', {topics:topics, topic:topic[0]});
          }
        });
      }else{
        //뷰
        console.log('There is no id');
        res.status(500).send('Internal Server Error');
      }
    });
  });

  Route.post(['/:id/edit'], function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;
    var sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';
    conn.query(sql, [title,description, author, id], function(err, rows, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }else{
        res.redirect('/topic/'+id);
      }
    });
  });

  Route.get(['/', '/:id'], function(req, res){
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
            res.render('topic/view', {topics:topics, topic:topic[0]});
          }
        });
      }else{
        //뷰
        res.render('topic/view', {topics:topics});
      }
    });
  });
  return Route;
}
