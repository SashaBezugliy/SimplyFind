starter
    .factory('AuthService', function ($http, $q, localstorageService) {

        var serviceBase = 'http://localhost:52097/';
            var authServiceFactory = {};

            var _authentication = {
                isAuth: false,
                authData: null
            };

            var _saveRegistration = function(registration) {

                _logOut();

                return $http.post(serviceBase + 'api/account/register', registration).then(function(response) {
                    return response;
                });

            };

            var _login = function(loginData) {

                var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

                var deferred = $q.defer();

                $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function(response) {

                    var authData = { token: response.access_token, userName: loginData.userName, userId: response.userId };

                    localstorageService.setObject('authorizationData', authData);

                    _authentication.isAuth = true;
                    _authentication.authData = authData;

                    deferred.resolve(response);

                }).error(function(err, status) {
                    _logOut();
                    deferred.reject(err);
                });

                return deferred.promise;

            };

            var _logOut = function() {

                localstorageService.remove('authorizationData');

                _authentication.isAuth = false;
                _authentication.authData = null;

            };

            var _fillAuthData = function() {

                var authData = localstorageService.get('authorizationData');
                if (authData) {
                    _authentication.isAuth = true;
                    _authentication.authData = JSON.parse(authData);
                }

            }

            authServiceFactory.saveRegistration = _saveRegistration;
            authServiceFactory.login = _login;
            authServiceFactory.logOut = _logOut;
            authServiceFactory.fillAuthData = _fillAuthData;
            authServiceFactory.authentication = _authentication;

            return authServiceFactory;
        }
    );