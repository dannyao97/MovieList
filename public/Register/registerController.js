
app.controller('registerController',
 ['$scope', '$state', '$http', '$rootScope', 'notifyDlg', 'errLanguage',
 'login', function($scope, $state, $http, $rootScope, nDlg, errLanguage,
 login) {
   $scope.user = {role: 0};
   $scope.errors = [];

   $scope.registerUser = function() {
      $http.post("/Prss", $scope.user)
      .then(function() {
         return nDlg.show($scope, "Registration succeeded.  " +
          "Login automatically?", "Login", ["Yes", "No"]);
      })
      .then(function(btn) {
         if (btn === "Yes")
            return login.login($scope.user);
         else {
            $state.go('login');
         }
      })
      .then(function(response) {
         $rootScope.user = response;
         $state.go('home');
      })
      .catch(function(err) {
         $scope.langChoice = errLanguage.chosenLang;
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
