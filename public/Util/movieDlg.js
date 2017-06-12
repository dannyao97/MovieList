// Declare a service that allows an error message.
app.factory("movieDlg", ["$uibModal", "$http", function(uibM, $http) {
   return {
      show: function(scp, movies, hdr, listId, btns, sz) {
         scp.searchMovies = movies;
         scp.hdr = hdr;
         scp.buttons = btns || ['OK'];
         scp.selectedMovies = [];
         scp.movieRefresh = function(search){
            $http.get('/Movies?movie=' + search)
            .then(function(response){
               scp.searchMovies = response.data;
            });
         };
         scp.addMovie = function(mov){
            var movIndex;
           if((movIndex = scp.selectedMovies.indexOf(mov.id)) >= 0){
              //delete movie from list
              scp.selectedMovies.splice(movIndex, 1);
           }
           else {
              //$http.post('/Lists/' + listId + "/Entry", {"movieId":mov.id});
              scp.selectedMovies.push(mov.id);
           }
         };
         return uibM.open({
            templateUrl: 'Util/movieDlg.template.html',
            scope: scp,
            size: sz || 'lg'
         }).closed.then(function(){
            //Posting movies to Entry
            scp.selectedMovies.forEach(function(mov) {
               $http.post('/Lists/' + listId + "/Entry", {movieId: mov})
               .then(function() {
                  $http.get('/Lists/' + listId  + '/Entry')
                  .then(function(response) {
                     scp.movies = response.data;
                  })
               });
            });
         }).result;
      }
   };
}]);
