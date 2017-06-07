var Express = require('express');
var CnnPool = require('../CnnPool.js');
var Tags = require('../Validator.js').Tags;
var ssnUtil = require('../Session.js');
var async = require('async');
var router = Express.Router({caseSensitive: true});

router.baseURL = '/Ssns';

router.get('/', function(req, res) {
   var body = [], ssn;

   if (req.validator.checkAdmin()) {
      for (var cookie in ssnUtil.sessions) {
         ssn = ssnUtil.sessions[cookie];
         body.push({cookie: cookie, prsId: ssn.id, loginTime: ssn.loginTime});
      }
      req.cnn.release();
      res.status(200).json(body);
   }
   else
      req.cnn.release();
});

router.post('/', function(req, res) {
   var cookie;
   var vld = req.validator;
   var cnn = req.cnn;

   cnn.query('select * from Person where email = ?', [req.body.email],
   function(err, result) {
      if (vld.check(result.length && result[0].password ===
       req.body.password, Tags.badLogin)) {
         cookie = ssnUtil.makeSession(result[0], res);
         cnn.release();
         res.header("Content-Length", 0);
         res.location(router.baseURL + '/' + cookie).status(200).end();
      }
      else
         cnn.release();
   });
});

router.delete('/:cookie', function(req, res, next) {
   var admin = req.session.isAdmin();

   async.waterfall([
   function(cb) {
      if (req.validator.check(req.params.cookie ===
       req.cookies[ssnUtil.cookieName] || admin,
       Tags.noPermission, null, cb)) {
         ssnUtil.deleteSession(req.params.cookie);
         res.status(200).end();
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

router.get('/:cookie', function(req, res, next) {
   var cookie = req.params.cookie;
   var vld = req.validator;

   if (vld.check(ssnUtil.sessions.hasOwnProperty(cookie), Tags.notFound) &&
    vld.checkPrsOK(ssnUtil.sessions[cookie].id)) {
      for (var sesh in ssnUtil.sessions) {
         if (sesh === cookie) {
            var ssn = ssnUtil.sessions[cookie];
            res.json({cookie: sesh, prsId: ssn.id, loginTime: ssn.loginTime});
         }
      }
   }
   req.cnn.release();
});

module.exports = router;
