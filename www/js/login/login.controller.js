starter
    .controller('LoginCtrl',  function($scope, $location) {

            $scope.loginData = {
                userName: "",
                password: ""
            };

            $scope.message = "";

            $scope.login = function() {

                authService.login($scope.loginData).then(function(response) {

                        $location.path('/');

                    },
                    function(err) {
                        $scope.message = err.error_description;
                    });
            };

        }
    );