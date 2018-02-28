var express = require('express');
var app = express();

var p1 = require('./routes/p1')(app);
app.use('/p1', p1);

var p2 = require('./routes/p2')(app);
app.use('/p2', p2);

app.listen('3000', function(){
  console.log('port 3000 connected!')
});
