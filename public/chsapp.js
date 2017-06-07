
var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap'
]);

app.constant("errMap", {
   "[EN]" : {
      missingField: '[EN] Field missing from request: ',
      badValue: '[EN] Field has bad value: ',
      notFound: '[EN] Entity not present in DB',
      badLogin: '[EN] Email/password combination invalid',
      dupEmail: '[EN] Email duplicates an existing email',
      noTerms: '[EN] Acceptance of terms is required',
      forbiddenRole: '[EN] Role specified is not permitted.',
      noOldPwd: '[EN] Change of password requires an old password',
      oldPwdMismatch: '[EN] Old password that was provided is incorrect.',
      dupTitle: '[EN] Conversation title duplicates an existing one',
      dupEnrollment: '[EN] Duplicate enrollment',
      forbiddenField: '[EN] Field in body not allowed.',
      queryFailed: '[EN] Query failed (server problem).'
   },
   "[ES]" : {
      missingField: '[ES] Field missing from request: ',
      badValue: '[ES] Field has bad value: ',
      notFound: '[ES] Entity not present in DB',
      badLogin: '[ES] Email/password combination invalid',
      dupEmail: '[ES] Email duplicates an existing email',
      noTerms: '[ES] Acceptance of terms is required',
      forbiddenRole: '[ES] Role specified is not permitted.',
      noOldPwd: '[ES] Change of password requires an old password',
      oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
      dupTitle: '[ES] Conversation title duplicates an existing one',
      dupEnrollment: '[ES] Duplicate enrollment',
      forbiddenField: '[ES] Field in body not allowed.',
      queryFailed: '[ES] Query failed (server problem).'
   }
});

app.service('errLanguage', [function() {
   this.chosenLang = '[EN]';
}]);

app.filter('tagError', ['errMap', 'errLanguage',
   function(errMap, errLanguage) {
      return function(err) {
         return errMap[errLanguage.chosenLang][err.tag] +
          (err.params ? err.params[0] : "");
      };
   }]);

app.directive('cnvSummary', [function() {
   return {
      restrict: 'E',
      scope: {
         cnv: "=toSummarize",
         show: '=',
         edit: '&',
         del: '&',
         detail: '&'
      },
      template: '<a  href="#" ui-sref="cnvDetail({cnvId:{{cnv.id}}})">' +
       '{{cnv.title}} {{cnv.lastMessage | date : "medium"}}</a>' +
       '<button type="button" class="btn btn-default btn-sm pull-right"' +
       'ng-show="show" ng-click="del()">' +
       '<span class="glyphicon glyphicon-trash"></span></button>' +
       '<button type="button" class="btn btn-default btn-sm pull-right"' +
       'ng-show="show" ng-click="edit()">' +
       '<span class="glyphicon glyphicon-edit"></span></button>'
   };
}]);

app.directive('cnvDetail', [function() {
   return {
      restrict: 'E',
      scope: {
         msg: '='
      },
      template: '<div>{{msg.whenMade | date: "short"}} <b>|</b> ' +
      '{{msg.email}} <b>|</b> {{msg.content}}</div>'
   }
}]);