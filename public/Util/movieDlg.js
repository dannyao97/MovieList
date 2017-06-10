// Declare a service that allows an error message.
app.factory("movieDlg", ["$uibModal", "$http", function(uibM, $http) {
   return {
      show: function(scp, movies, hdr, listId, btns, sz) {
         scp.searchMovies = movies;
         scp.hdr = hdr;
         scp.buttons = btns || ['OK'];
         scp.movieRefresh = function(search){
            console.log(search);
            $http.get('/Movies?movie=' + search)
            .then(function(response){
               scp.searchMovies = response.data;
            });
         };
         scp.addMovie = function(mov){
           console.log(mov.title);
           $http.post('/Lists/' + listId + "/Entry", {"movieId":mov.id})
         };
         return uibM.open({
            templateUrl: 'Util/movieDlg.template.html',
            scope: scp,
            size: sz || 'lg'
         }).result;
      }
   };
}]);
