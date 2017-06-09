
app.controller('listDetailController', ['$scope', '$state', '$http',
 'notifyDlg', '$stateParams',
 function($scope, $state, $http, notifyDlg, $stateParams) {
   var id = $stateParams.listId;

   $http.get('/Lists/' + id)
   .then(function(response) {
      $scope.listTitle = response.data[0].title;
   });

   $http.get('/Lists/' + id + '/Entry')
   .then(function(response) {
      console.log(response);
      $scope.movies = response.data;
   })
   .catch(function(err) {
      $scope.movies = null;
   });

   $scope.newMsg = function() {
      if ($scope.newMessage === "" || $scope.newMessage === undefined) {
         notifyDlg.show($scope, "Error: No Message!", "Error");
      }
      else {
         $http.post('/Lists/' + id + '/Entry', {content: $scope.newMessage})
         .then(function() {
            return $http.get('/Lists/' + id + '/Entry')
         })
         .then(function(response) {
            $scope.movies = response.data;
            $scope.newMessage = "";
         })
         .catch(function(err) {
            if (err && err.data)
               notifyDlg.show($scope, "Error: "+ err.data[0].tag, "Error");
         })
      }
   };
}]);