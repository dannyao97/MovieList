app.controller('listOverviewController', ['$scope', '$state', '$http',
 '$uibModal', 'notifyDlg', 'movLists',
 function($scope, $state, $http, $uibM, nDlg, movLists) {
   $scope.movLists = movLists;

   $scope.newList = function() {
      $scope.title = null;
      $scope.dlgTitle = "Create a Movie List";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'MovieList/editListDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         return $http.post("/Lists", {title: newTitle});
      })
      .then(function() {
         return $http.get('/Lists');
      })
      .then(function(rsp) {
         $scope.movLists = rsp.data;
      })
      .catch(function(err) {
         // console.log("Error: " + JSON.stringify(err));
         if (err && err.data && err.data[0].tag === "dupTitle")
            nDlg.show($scope, "Another conversation already has title "
             + selectedTitle, "Error");
      });
   };

   $scope.delList = function($index) {
      var id = $scope.movLists[$index].id;
      var delTitle = $scope.movLists[$index].title;

      nDlg.show($scope, "Delete " + delTitle + "?",
         "Delete Movie List", ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes")
            return $http.delete("/Lists/" + id, {title: delTitle});
      })
      .then(function() {
         return $http.get('/Lists');
      })
      .then(function(rsp) {
         $scope.movLists = rsp.data;
      });
   };

   $scope.editList = function($index) {
      var id = $scope.movLists[$index].id;
      var selectedTitle;
      $scope.dlgTitle = "Edit: " + $scope.movLists[$index].title;
      $uibM.open({
         templateUrl: 'MovieList/editListDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         return $http.put("/Lists/" + id, {title: newTitle});
      })
      .then(function() {
         return $http.get('/Lists');
      })
      .then(function(rsp) {
         $scope.movLists = rsp.data;
      })
      .catch(function(err) {
         // console.log("Error: " + JSON.stringify(err));
         if (err && err.data && err.data[0].tag === "dupTitle")
            nDlg.show($scope, "Another conversation already has title " +
             selectedTitle, "Error");
      });
   };
}]);
