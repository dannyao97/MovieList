var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Entry';

router.get('/:entryId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var entryId = req.params.entryId;

   async.waterfall([
   function(cb) {
      //Check if Entry exists
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry("select * from Entry where id = ?", [entryId], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         cnn.chkQry("select e.whenAdded, p.firstName, p.lastName, " +
          "e.movieId from Entry e, " +
          "Person p where p.id = e.prsId && e.id = ?", [entryId], cb);
      }
   },
   function(rRes, fields, cb) {
      rRes.forEach(function(ent) {
         var wAdded = new Date(ent.whenAdded).getTime();
         ent.whenAdded = wAdded;
      });
      res.status(200).json(rRes[0]);
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.get('/', function(req, res) {
   req.cnn.release();
   res.status(404).end();
});

router.delete('/:entryId', function(req, res) {
   var vld = req.validator;
   var entryId = req.params.entryId;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry('select * from Entry where id = ?', [entryId], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         cnn.chkQry('delete from Entry where id = ?', [entryId], cb);
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
