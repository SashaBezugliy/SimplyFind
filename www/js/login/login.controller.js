starter
    .controller('LoginCtrl', function ($scope, $state, AuthService) {
            var vm = this;
            vm.loginData = {
                userName: "",
                password: ""
            };

            vm.message = "";

            vm.login = function() {

                AuthService.login(vm.loginData).then(function (response) {

                        $state.go('home');

                    },
                    function(err) {
                        vm.message = err.error_description;
                    });
            };

        }
    );