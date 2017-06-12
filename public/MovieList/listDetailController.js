
app.controller('listDetailController', ['$scope', '$state', '$http',
 'movieDlg', '$stateParams', 'notifyDlg',
 function($scope, $state, $http, movieDlg, $stateParams, nDlg) {
   var id = $stateParams.listId;

   $http.get('/Lists/' + id)
   .then(function(response) {
      $scope.listTitle = response.data[0].title;
      $scope.listOwner = response.data[0].ownerId;
   });

   $http.get('/Lists/' + id + '/Entry')
   .then(function(response) {
      $scope.movies = response.data;
   })
   .catch(function(err) {
      $scope.movies = null;
   });

    $scope.newEntry = function() {
       $http.get('/Movies?num=10')
       .then(function(response) {
          return movieDlg.show($scope, response.data,"Add Movie", id);
       })
       .then(function(){
          return $http.get('/Lists/' + id + '/Entry');
       })
       .then(function(response){
          $scope.movies = response.data;
       })
       .catch(function(err){
          $http.get('/Lists/' + id  + '/Entry')
          .then(function(response) {
             $scope.movies = response.data;
          });
       });
    };

    $scope.delEntry = function($index) {
      var movie = $scope.movies[$index];
      var entryId = movie.entryId;

      nDlg.show($scope, "Are you sure you want to delete this movie?",
       "Delete Movie Entry", ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes")
            return $http.delete("/Entry/" + entryId);
      })
      .then(function() {
         return $http.get('/Lists/' + id + '/Entry');
      })
      .then(function(rsp) {
         $scope.movies = rsp.data;
      });
   };
}]);
