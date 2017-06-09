
app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {

      //redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('home',  {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController'
      })
      .state('login', {
         url: '/login',
         templateUrl: 'Login/login.template.html',
         controller: 'loginController'
      })
      .state('logout', {
         url: '/login',
         controller: 'logoutController'
      })
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController'
      })
      .state('myCnvOverview', {
         url: '/myCnvs?owner',
         templateUrl: 'MovieList/myCnvOverview.template.html',
         controller: 'myCnvOverviewController',
         resolve: {
            cnvs: ['$q', '$http', '$stateParams',
               function($q, $http, $stateParams) {
                  return $http.get('/Lists?owner=' + $stateParams.owner)
                     .then(function(response) {
                        return response.data;
                     });
               }]
         }
      })
      .state('listDetail', {
         url: '/Lists/:listId',
         templateUrl: 'MovieList/listDetail.template.html',
         controller: 'listDetailController'
      })
      .state('listOverview', {
         url: '/Lists',
         templateUrl: 'MovieList/listOverview.template.html',
         controller: 'listOverviewController',
         resolve: {
            movLists: ['$q', '$http', function($q, $http) {
               return $http.get('/Lists')
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      });
   }]);
