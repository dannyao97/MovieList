app.controller('langController', ['$scope', 'errLanguage',
 function($scope, errLanguage) {
   $scope.selectedLang = "English";
   errLanguage.chosenLang = '[EN]';
   $scope.languages = ["English", "Spanish"];

   $scope.changeLang = function(selected) {
      if (selected === "English" || selected === "Inglés") {
         $scope.selectedLang = "English";
         errLanguage.chosenLang = '[EN]';
         $scope.languages = ["English", "Spanish"];
      }
      else if (selected === "Spanish" || selected === "Español") {
         $scope.selectedLang = "Español";
         errLanguage.chosenLang = '[ES]';
         $scope.languages = ["Inglés", "Español"];
      }
   }
}]);