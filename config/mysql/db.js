module.exports = function(){
  var mysql = require('mysql');
  var db_config = require('../mysql_config.json');
  var conn = mysql.createConnection({
    host     : db_config.host,
    user     : db_config.user,
    password : db_config.password,
    database : db_config.database
  });
  conn.connect();
  return conn;
}
