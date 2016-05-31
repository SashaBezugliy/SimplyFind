starter
    .controller('SignUpCtrl', function ($scope, $state, $timeout, AuthService) {

        var vm = this;

        vm.savedSuccessfully = false;
        vm.message = "";

        vm.registration = {
            userName: "",
            password: "",
            confirmPassword: ""
        };

        vm.signUp = function() {

            AuthService.saveRegistration(vm.registration).then(function (response) {

                    vm.savedSuccessfully = true;
                    vm.message = "User has been registered successfully, you will be redicted to login page in 2 seconds.";
                    startTimer();

                    function startTimer() {
                        var timer = $timeout(function() {
                            $timeout.cancel(timer);
                            $state.go('login');
                        }, 2000);
                    }
                },
                function(response) {
                    var errors = [];
                    for (var key in response.data.modelState) {
                        for (var i = 0; i < response.data.modelState[key].length; i++) {
                            errors.push(response.data.modelState[key][i]);
                        }
                    }
                    vm.message = "Failed to register user due to:" + errors.join(' ');
                });
        };
			vm.goBack = function(){
				$state.go('home');
			};

    });