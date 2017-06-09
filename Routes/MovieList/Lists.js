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
      if (vld.checkPrsOK(movLists[0].ownerId, cb) &&
       vld.check(movLists.length, Tags.notFound, null, cb)) {
         cnn.chkQry('select * from MovieList where id <> ? && title = ?',
          [listId, body.title], cb);
      }
   },
   function(sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb)) {
         cnn.chkQry("update Conversation set title = ? where id = ?",
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

/*
router.delete('/:cnvId', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
      }
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb) &&
       vld.checkPrsOK(cnvs[0].ownerId, cb)) {
         cnn.chkQry('delete from Conversation where id = ?', [cnvId], cb);
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

router.get('/:cnvId/Msgs', function(req, res) {
   var vld = req.validator;
   var cnvId = req.params.cnvId;
   var cnn = req.cnn;
   var query = 'select Message.id, whenMade, email, content from ' +
    'Conversation c join Message on cnvId = c.id join Person p on ' +
    'prsId = p.id where c.id = ? ';
   var params = [parseInt(cnvId)];

   if (req.query.dateTime) {
      query += 'and Message.whenMade < ?';
      //offset in milliseconds
      var tzoffset = (new Date()).getTimezoneOffset() * 60000;
      var localISOTime = (new Date(parseInt(req.query.dateTime) - tzoffset))
       .toISOString().slice(0, 19).replace('T', ' ');
      params.push(localISOTime);
   }

   query += ' order by whenMade asc';
   // And finally add a limit clause and parameter if indicated.
   if (req.query.num) {
      query += ' limit ?';
      params.push(parseInt(req.query.num));
   }

   async.waterfall([
   function(cb) {  // Check for existence of conversation
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
      }
   },
   function(cnvs, fields, cb) { // Get indicated messages
      if (vld.check(cnvs.length, Tags.notFound, null, cb)) {
         cnn.chkQry(query, params, cb);
      }
   },
   function(msgs, fields, cb) { // Return retrieved messages
      msgs.forEach(function(val) {
         if (val.whenMade !== null) {
            var newDate = new Date(val.whenMade).getTime();
            val.whenMade = newDate;
         }
      });
      res.status(200).json(msgs);
      cb();
   }],
   function(err){
      cnn.release();
   });
});

router.post('/:cnvId/Msgs', function(req, res){
   var vld = req.validator;
   var cnn = req.cnn;
   var cnvId = req.params.cnvId;
   var body = req.body;
   var curTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ['content'], cb) &&
       vld.check(body.content.length <= 5000, Tags.badValue,
       ['content'], cb)) {
         cnn.chkQry('select * from Conversation where id = ?', [cnvId], cb);
      }
   },
   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb)) {
         cnn.chkQry('insert into Message set ?',
         {
            cnvId: cnvId, prsId: req.session.id,
            whenMade: curTime, content: body.content
         }, cb);
      }
   },
   function(insRes, fields, cb) {
      cnn.chkQry("update Conversation set lastMessage = ? where id = ?",
       [curTime, cnvId], cb);
      res.header("Content-Length", 0);
      res.location('/Msgs/' + insRes.insertId).end();
   }],
   function(err) {
      cnn.release();
   });
});*/

module.exports = router;
