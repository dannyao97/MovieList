app.controller('cnvOverviewController', ['$scope', '$state', '$http',
 '$uibModal', 'notifyDlg', 'cnvs',
 function($scope, $state, $http, $uibM, nDlg, cnvs) {
   $scope.cnvs = cnvs;

   $scope.newCnv = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Conversation";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
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
         $scope.cnvs = rsp.data;
      })
      .catch(function(err) {
         // console.log("Error: " + JSON.stringify(err));
         if (err && err.data && err.data[0].tag === "dupTitle")
            nDlg.show($scope, "Another conversation already has title "
             + selectedTitle, "Error");
      });
   };

   $scope.delCnv = function($index) {
      var id = $scope.cnvs[$index].id;
      var delTitle = $scope.cnvs[$index].title;

      nDlg.show($scope, "Delete this Conversation?",
         "Delete Conversation", ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes")
            return $http.delete("/Lists/" + id, {title: delTitle});
      })
      .then(function() {
         return $http.get('/Lists');
      })
      .then(function(rsp) {
         $scope.cnvs = rsp.data;
      });
   };

   $scope.editCnv = function($index) {
      var id = $scope.cnvs[$index].id;
      var selectedTitle;
      $scope.dlgTitle = "Edit Conversation Title";
      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
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
         $scope.cnvs = rsp.data;
      })
      .catch(function(err) {
         // console.log("Error: " + JSON.stringify(err));
         if (err && err.data && err.data[0].tag === "dupTitle")
            nDlg.show($scope, "Another conversation already has title "
               + selectedTitle, "Error");
      });
   };
}]);