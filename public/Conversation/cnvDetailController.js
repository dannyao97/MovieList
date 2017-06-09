
app.controller('cnvDetailController', ['$scope', '$state', '$http',
 'notifyDlg', '$stateParams',
 function($scope, $state, $http, notifyDlg, $stateParams) {
   var id = $stateParams.cnvId;

   $http.get('/Lists/' + id)
   .then(function(response) {
      $scope.cnvTitle = response.data.title;
   });

   $http.get('/Lists/' + id + '/Entry')
   .then(function(response) {
      $scope.msgs = response.data;
      console.log("here");
      console.log(response.data);
      console.log(response.data[0]);

   })
   .catch(function(err) {
      $scope.msgs = null;
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
            $scope.msgs = response.data;
            $scope.newMessage = "";
         })
         .catch(function(err) {
            if (err && err.data)
               notifyDlg.show($scope, "Error: "+ err.data[0].tag, "Error");
         })
      }
   };
}]);