
app.controller('listDetailController', ['$scope', '$state', '$http',
 'movieDlg', '$stateParams',
 function($scope, $state, $http, movieDlg, $stateParams) {
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
       $http.get('/Movies?num=10')
       .then(function(response) {
          movieDlg.show($scope, response.data,"Add Movie", id);
       })
       .then(function(){
          $http.get('/Lists/' + id + '/Entry');
       })
       .then(function(response){
          $scope.movies = response.data;
       });
    };
}]);