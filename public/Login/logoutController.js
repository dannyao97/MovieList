app.controller('logoutController',
 ['$scope', '$state', '$rootScope', 'login',
 function($scope, $state, $rootScope, login) {
   login.logout()
   .then(function() {
      $rootScope.user = null;
      $rootScope.cookie = null;
   });
}]);
