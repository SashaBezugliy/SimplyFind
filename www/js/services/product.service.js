starter
    .factory('ProductService', function ($http, $q, $rootScope) {

        function _getProductLists(userId) {
            if (userId)
                return $q(function (resolve, reject) {
                    $http.get("http://simplyfind.bokeh.com.ua/productlists/" + userId)
                        .success(function (data) {
                            $rootScope.$broadcast('productlist:updated', JSON.parse(data));
                        });
                });
            else
                $rootScope.$broadcast('productlist:updated', []);
        }


        return {
            getProducts: function (supermarketId) {
                return $q(function (resolve, reject) {
                    $http.get("http://simplyfind.bokeh.com.ua/api/product/" + supermarketId)//http://simplyfind.somee.com/api/product/ // http://simplyfind.gear.host/api/product/
                    .success(function (data) {
                        resolve(JSON.parse(data));
                    });
                });
            },

            getProductLists: _getProductLists,

            saveProductList: function (model) {
                return $q(function(resolve, reject) {
                    $http.post("http://simplyfind.bokeh.com.ua/savelist/" + model.userId, model)
                        .success(function(data) {
                            _getProductLists(model.userId);
                        })
                        .error(function(err) {
                            var d = err;
                        });
                });
            }
        };
    });
