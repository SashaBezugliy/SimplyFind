// Ionic Starter App

var starter = angular.module('starter', ['ionic']);

starter.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
        .state('home', {
            url: '/:userId',
            templateUrl: "js/home/home.html",
            controller: 'HomeCtrl',
            controllerAs: 'ctrl',
            onEnter: function (ProductService, $stateParams) {
                if ($stateParams.userId)
                    ProductService.getProductLists($stateParams.userId);
            }
        })
        .state('signup', {
            url: '/signup',
            templateUrl: "js/signup/signup.html",
            controller: 'SignUpCtrl',
            controllerAs: 'ctrl'
        })
        .state('login', {
            url: '/login',
            templateUrl: "js/login/login.html",
            controller: 'LoginCtrl',
            controllerAs: 'ctrl'
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/');

    $httpProvider.interceptors.push('authInterceptorService');
});

starter.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });
});