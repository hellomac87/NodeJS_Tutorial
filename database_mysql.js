var mysql      = require('mysql');
var db_config  = require('./config/mysql_config.json');
var conn = mysql.createConnection({
  host     : db_config.host,
  user     : db_config.user,
  password : db_config.password,
  database : db_config.database
});

conn.connect();
/*
var sql = 'SELECT * FROM topic';
conn.query(sql, function(err, rows, fields){
  if(err){
    console.log(err);
  } else {
    for(var i=0; i<rows.length; i++){
      console.log(rows[i].author);
    }
  }
});
*/

var sql ='INSERT INTO topic (title, description, author) VALUES(?,?,?)';
var params = ['config', 'secret information', 'slanude'];
conn.query(sql, params, function(err, rows, fields){
  if(err){
    console.log(err);
  }else{
    console.log(rows.insertId);
  }
});

/*
var sql ='UPDATE topic SET title=?, author=? WHERE id=?';
var params = ['NPM', 'slanude', '1'];
conn.query(sql, params, function(err, rows, fields){
  if(err){
    console.log(err);
  }else{
    console.log(rows);
  }
});
*/
/*
var sql ='DELETE FROM topic WHERE id=?';
var params = [1];
conn.query(sql, params, function(err, rows, fields){
  if(err){
    console.log(err);
  }else{
    console.log(rows);
  }
});
*/
conn.end();
