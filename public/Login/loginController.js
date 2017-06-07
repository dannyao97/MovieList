app.controller('loginController', ['$scope', '$state', '$rootScope',
 'login', 'notifyDlg',
 function($scope, $state, $rootScope, login, nDlg) {

   $scope.login = function() {
      login.login($scope.user)
      .then(function(user) {
         $rootScope.user = user;
         $state.go('home');
      })
      .catch(function() {
         nDlg.show($scope, "That name/password is not in our records", "Error");
      });
   };
}]);
