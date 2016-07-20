starter
    .factory('ProductService', function ($http, $q, $rootScope) {


        return {

            getProducts: function (supermarketId) {
                return $q(function (resolve, reject) {
                    $http.get("http://simplyfind.bokeh.com.ua/api/product/" + supermarketId)//http://simplyfind.bokeh.com.ua/api/product/ // http://simplyfind.gear.host/api/product/
                    .success(function (data) {
                        resolve(JSON.parse(data));
                    });
                });
            },

            getProductLists: function(userId) {
                if (userId)
                    return $q(function (resolve, reject) {
                        $http.get("http://localhost:52097/productlists/" + userId)
                            .success(function (data) {
                                $rootScope.$broadcast('productlist:updated', JSON.parse(data));
                            });
                    });
                else
                    $rootScope.$broadcast('productlist:updated', []);
            },

            saveProductList: function (model) {
                return $q(function(resolve, reject) {
                    $http.post("http://localhost:52097/savelist/" + model.userId, model)
                        .success(function(data) {
                            resolve(JSON.parse(data));
                        })
                        .error(function(err) {
                            var d = err;
                        });
                });
            }
        };
    });
