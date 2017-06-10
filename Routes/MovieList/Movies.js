var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Movies';

//GET ownerid={id of prss}
router.get('/', function(req, res) {
   var vld = req.validator;
   var movie = req.query.movie;
   var query, params;

   if(movie) {
      query = 'select id, director, duration, genre, title, ' +
       'movieLink, language, rating, year, imdbScore from Movie ' +
       'where title like ?';
      params = ['%' + movie + '%'];
   }
   else{
      query = 'select id, director, duration, genre, title, ' +
       'movieLink, language, rating, year, imdbScore from Movie';
      params = [];
   }

   if (req.query.num) {
      query += ' limit ?';
      params.push(parseInt(req.query.num));
   }

   async.waterfall([
       function(cb) {
          if (vld.checkPrsOK(req.session.id, cb)) {
             req.cnn.chkQry(query, params, cb);
          }
       },
       function(qRes, fields, cb) {
          res.status(200).json(qRes);
          cb();
       }],
    function(err) {
       req.cnn.release();
    });
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ['title'], cb) &&
       vld.check(body.title.length <= 80, Tags.badValue, ['title'], cb)) {
         cnn.chkQry('select * from Movie where title = ?',
          body.title, cb);
      }
   },
   function(existingCnv, fields, cb) {
      if (vld.check(!existingCnv.length, Tags.dupTitle, null, cb)) {
         //Add owner id to body
         cnn.chkQry("insert into Movie set ?", body, cb);
      }
   },
   function(insRes, fields, cb) {
      res.header("Content-Length", 0);
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.delete('/:movieId', function(req, res) {
   var vld = req.validator;
   var movieId = req.params.movieId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry('select * from Movie where id = ?', [movieId], cb);
      }
   },
   function(movies, fields, cb) {
      if (vld.check(movies.length, Tags.notFound, null, cb)) {
         cnn.chkQry('delete from Movie where id = ?', [movieId], cb);
      }
   },
   function(dRes, fields, cb) {
      res.header("Content-Length", 0);
      res.status(200).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

module.exports = router;
