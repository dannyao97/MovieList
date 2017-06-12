var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Lists';

//GET ownerid={id of prss}
router.get('/', function(req, res) {
   var vld = req.validator;
   var qOwnerId = req.query.owner;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.session.id, cb)) {
         if (qOwnerId) {
            req.cnn.chkQry('select id, title from MovieList where ownerId = ?'
             , [qOwnerId], cb);
         }
         else {
            req.cnn.chkQry('select id, title, ownerId from MovieList', null, cb);
         }
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

//POST
router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ['title'], cb) &&
       vld.check(body.title.length <= 80, Tags.badValue, ['title'], cb)) {
         cnn.chkQry('select * from MovieList where title = ?',
          body.title, cb);
      }
   },
   function(existingCnv, fields, cb) {
      if (vld.check(!existingCnv.length, Tags.dupTitle, null, cb)) {
         //Add owner id to body
         body.ownerId = req.session.id;
         cnn.chkQry("insert into MovieList set ?", body, cb);
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

//List/{listId} GET
router.get('/:listId', function(req, res) {
   var vld = req.validator;
   var listId = req.params.listId;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.session.id, cb)) {
         req.cnn.chkQry('select id, title, ownerId from MovieList where id = ?'
          , [listId], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         res.status(200).json(qRes);
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

//List/{listId} PUT
router.put('/:listId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var listId = req.params.listId;

   async.waterfall([
   function(cb) {
      //Get owner of list
      cnn.chkQry('select * from MovieList where id = ?', [listId], cb);
   },
   function(movLists, fields, cb) {
      if (vld.check(movLists.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(movLists[0].ownerId, cb) &&
       vld.chain(body.title.length <= 80, Tags.badValue, ["title"])
       .check(movLists.length, Tags.notFound, null, cb)) {
         cnn.chkQry('select * from MovieList where id <> ? && title = ?',
          [listId, body.title], cb);
      }
   },
   function(sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry("update MovieList set title = ? where id = ?",
          [body.title, listId], cb);
      }
   },
   function(uRes, fields, cb) {
      res.header("Content-Length", 0);
      res.status(200).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});


router.delete('/:listId', function(req, res) {
   var vld = req.validator;
   var listId = req.params.listId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry('select * from MovieList where id = ?', [listId], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(qRes[0].ownerId, cb)) {
         cnn.chkQry('delete from MovieList where id = ?', [listId], cb);
      }
   },
   function(eRes, fields, cb) {
      cnn.chkQry('delete from Entry where listId = ?', [listId], cb);
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

router.get('/:listId/Entry', function(req, res) {
   var vld = req.validator;
   var listId = req.params.listId;
   var cnn = req.cnn;
   var query = 'select Entry.id as entryId, mov.genre, mov.title, mov.duration,' +
    ' mov.director, mov.id as movieId, mov.movieLink, mov.language from Entry, Movie' +
    ' mov where Entry.movieId = mov.id and Entry.listId = ?';
   var params = [parseInt(listId)];

   // And finally add a limit clause and parameter if indicated.
   if (req.query.num) {
      query += ' limit ?';
      params.push(parseInt(req.query.num));
   }

   async.waterfall([
   function(cb) {  // Check for existence of conversation
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry('select * from MovieList where id = ?', [listId], cb);
      }
   },
   function(res, fields, cb) { // Get indicated messages
      if (vld.check(res.length, Tags.notFound, null, cb)) {
         cnn.chkQry(query, params, cb);
      }
   },
   function(qRes, fields, cb) { // Return retrieved messages
      res.status(200).json(qRes);
      cb();
   }],
   function(err){
      cnn.release();
   });
});

router.post('/:listId/Entry', function(req, res){
   var vld = req.validator;
   var cnn = req.cnn;
   var listId = req.params.listId;
   var body = req.body;
   var curTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
   var listOwner;

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ['movieId'], cb)) {
         cnn.chkQry('select * from MovieList where id = ?', [listId], cb);
      }
   },
   function(movies, fields, cb) {
      if (vld.check(movies.length, Tags.notFound, null, cb)) {
         listOwner = movies[0].ownerId;
         cnn.chkQry('select * from Entry where listId = ? and movieId = ?',
          [listId, body.movieId], cb);
      }
   },
   function(exist, fields, cb) {
      //Checks if the Entry already exists in the list
      if (vld.check(listOwner === req.session.id, Tags.noPermission,
       null, cb) && exist.length === 0) {
         cnn.chkQry('insert into Entry set ?',
         {
            listId: listId, prsId: req.session.id,
            whenAdded: curTime, movieId: body.movieId
         }, cb);
         res.header("Content-Length", 0);
         res.location('/Lists/' + exist.insertId).end();
      }
   }],
   function(err) {
      cnn.release();
   });
});

module.exports = router;
