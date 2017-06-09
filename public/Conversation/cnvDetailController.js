
app.controller('cnvDetailController', ['$scope', '$state', '$http',
 'notifyDlg', '$stateParams',
 function($scope, $state, $http, notifyDlg, $stateParams) {
   var id = $stateParams.cnvId;

   $http.get('/Cnvs/' + id)
   .then(function(response) {
      $scope.cnvTitle = response.data.title;
   });

   $http.get('/Cnvs/' + id + '/Msgs')
   .then(function(response) {
      $scope.msgs = response.data;
   })
   .catch(function(err) {
      $scope.msgs = null;
   });

   $scope.newMsg = function() {
      if ($scope.newMessage === "" || $scope.newMessage === undefined) {
         notifyDlg.show($scope, "Error: No Message!", "Error");
      }
      else {
         $http.post('/Cnvs/' + id + '/Msgs', {content: $scope.newMessage})
         .then(function() {
            return $http.get('/Cnvs/' + id + '/Msgs')
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