module.exports = function(passport){
  //var express = rquire('express');
  var route = require('express').Router();
  //LocalStrategy
  route.post(
    '/login',
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
  route.get(
    '/facebook',
    passport.authenticate(
      'facebook',
      {scope:'email'}
    )
  );
  route.get(
    '/facebook/callback',
    passport.authenticate(
      'facebook', {
        successRedirect: '/welcome',
        failureRedirect: '/auth/login'
      }
    )
  );

  route.post('/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var user = {
        authId : 'local:'+req.body.username,
        username : req.body.username,
        password : hash,
        salt: salt,
        displayName : req.body.displayName
      };
      var sql = 'INSERT INTO users SET ?';
      conn.query(sql, user, function(err, results){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          req.login(user, function(err){
            req.session.save(function(){
              res.redirect('/welcome');
            });
          });
        }
      });

    });
  });
  route.get('/register', function(req, res){
    res.render('auth/register');
  });

  route.get('/login', function(req, res){
    res.render('auth/login');
  });
  route.get('/logout', function(req, res){
    req.logout();
    return req.session.save(function(){
      res.redirect('/welcome');
    });
  });
  return route;
}
