
app.controller('usersDetailController', ['$scope', '$state', '$http',
   '$stateParams', function($scope, $state, $http, $stateParams) {
      var user = $stateParams.user;
      $scope.title = user.firstName + " " + user.lastName + "'s Movie Lists";

      $http.get('/Lists?owner=' + user.id)
      .then(function(response) {
         $scope.movLists = response.data;
      });

}]);