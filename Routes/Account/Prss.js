var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

//Get own connection.json
var cnnConfig = require('../connection.json');

router.baseURL = '/Prss';

// Much nicer versions
router.get('/', function(req, res) {
   var email = req.session.isAdmin() && req.query.email ||
    !req.session.isAdmin() && req.session.email;
   var admin = req.session.isAdmin();
   var qEmail = req.query.email;
   var sEmail = req.session.email;

   var handler = function(err, prsArr) {
      res.json(prsArr);
      req.cnn.release();
   };

   if (qEmail && admin) {
      req.cnn.chkQry('select id, email from Person where email like ' +
       'concat(?, \'%\')', [qEmail], handler);
   }
   else if (!qEmail && admin) {
      req.cnn.chkQry('select id, email from Person', handler);
   }
   //Check to see if non-admin and query email is own email
   else if (!qEmail || sEmail.indexOf(String(qEmail)) !== -1 ||
    sEmail.indexOf(String(qEmail).toLowerCase()) !== -1) {
      req.cnn.chkQry('select id, email from Person where email = ?', [sEmail],
       handler);
   }
   else {
      req.cnn.release();
      res.json([]);
   }
});

//Get all users
router.get('/all', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {  // Check for existence of conversation
      if (vld.checkPrsOK(req.session.id, cb)) {
         cnn.chkQry('select id, firstName, lastName from Person where role = 0'
          , [], cb);
      }
   },
   function(qRes, fields, cb) {
      res.status(200).json(qRes);
      cb();
   },
   function(err){
      cnn.release();
   }]);
});

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var admin = req.session && req.session.isAdmin();
   var cnn = req.cnn;

   if (admin && !body.password)
      body.password = "*";

   var curTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

   if (body.hasOwnProperty("password") && body.password === "")
      delete body.password;
   if (body.hasOwnProperty("lastName") && body.lastName === "")
      delete body.lastName;
   if (body.hasOwnProperty("email") && body.email === "")
      delete body.email;

   async.waterfall([
   function(cb) { // Check properties and search for Email duplicates
      if (vld.hasFields(body, ["email", "lastName", "password", "role"], cb) &&
       vld.chain(body.role === 0 || admin, Tags.noPermission)
       .chain(body.termsAccepted || admin, Tags.noTerms)
       .check(body.role === 0 || body.role === 1 && admin,
       Tags.badValue, ["role"], cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },
   function(existingPrss, fields, cb) {  // If no duplicates, insert new Person
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         if (body.hasOwnProperty("termsAccepted")
          && body.termsAccepted === true) {
            body.termsAccepted = curTime;
         }
         else {
            body.termsAccepted = null;
         }
         body.whenRegistered = curTime;
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },
   function(result, fields, cb) { // Return location of inserted Person
      res.header('Content-Length', 0);
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],
   function() {
      cnn.release();
   });
});

router.get('/:id', function(req, res) {
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.params.id, cb))
         req.cnn.query('select id, firstName, lastName, email, whenRegistered' +
          ', termsAccepted, role from Person where id = ?',
          [req.params.id], cb);
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.length, Tags.notFound, null, cb)){
         if (qRes[0].whenRegistered !== null) {
            var reg = new Date(qRes[0].whenRegistered).getTime();
            qRes[0].whenRegistered = reg;
         }

         if (qRes[0].termsAccepted !== null) {
            var term = new Date(qRes[0].termsAccepted).getTime();
            qRes[0].termsAccepted = term;
         }

         res.status(200).json(qRes);
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });

});

router.put('/:id', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var admin = req.session.isAdmin();
   var cnn = req.cnn;

   if (body.hasOwnProperty("id"))
      delete body.id;

   res.header("Content-Length", 0);
   async.waterfall([
   function(cb) {
      if (vld.checkPrsOK(req.params.id, cb) &&
       vld.hasOnlyFields(body, ['firstName', 'lastName', 'password',
        'oldPassword', 'role'], cb) &&
       vld.chain(!body.role || admin, Tags.badValue, ["role"])
       .chain(!body.hasOwnProperty("termsAccepted"), Tags.forbiddenField,
       ["termsAccepted"])
       .chain(!body.hasOwnProperty("whenRegistered"), Tags.forbiddenField,
       ["whenRegistered"])
       .check(!body.hasOwnProperty("password") || body.oldPassword || admin,
       Tags.noOldPwd, null, cb)) {
         cnn.chkQry("select * from Person where id = ? ", [req.params.id], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(admin || !body.password ||
       qRes[0].password === body.oldPassword, Tags.oldPwdMismatch, null, cb)) {
         delete req.body.oldPassword;
         cnn.chkQry("update Person set ? where id = ?",
          [req.body, req.params.id], cb);
      }
   },
   function(updRes, field, cb) {
      res.status(200).end();
      cb();
   }],
   function(err) {
      cnn.release();
   });
});

router.delete('/:id', function(req, res) {
   var vld = req.validator;

   async.waterfall([
   function(cb) {
      if (vld.checkAdmin(cb)) {
         req.cnn.query('DELETE from Person where id = ?', [req.params.id], cb);
      }
   },
   function(qRes, fields, cb) {
      if (vld.check(qRes.affectedRows, Tags.notFound, null, cb)) {
         res.header("Content-Length", 0);
         res.status(200).end();
         cb();
      }
   }],
   function(err) {
      req.cnn.release();
   });
});

router.delete('/', function(req, res) {
   req.cnn.release();
   res.status(404).end();
});

router.put('/', function(req, res) {
   req.cnn.release();
   res.status(404).end();
});

module.exports = router;
