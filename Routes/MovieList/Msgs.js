var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');

router.baseURL = '/Msgs';

router.get('/:msgId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;
   var msgId = req.params.msgId;

   async.waterfall([
   function(cb) {
      //Check if message exists
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry("select * from Message where id = ?", [msgId], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)) {
         cnn.chkQry("select m.whenMade, p.email, m.content from Message m, " +
          "Person p where p.id = m.prsId && m.id = ?", [msgId], cb);
      }
   },
   function(rRes, fields, cb) {
      rRes.forEach(function(gMsg) {
         var wMade = new Date(gMsg.whenMade).getTime();
         gMsg.whenMade = wMade;
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

module.exports = router;