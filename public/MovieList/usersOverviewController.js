
app.controller('usersOverviewController', ['$scope', '$state', '$http',
   'userList', function($scope, $state, $http, userList) {
   $scope.userList = userList;

}]);