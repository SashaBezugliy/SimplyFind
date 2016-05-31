starter
    .factory('ProductService', function ($http, $q, $rootScope) {

        var DUMMY_products = [
           {
               Id: 2,
               ProductName: "A",
               Lat: 49.77376771881596,
               Lng: 24.010657962417603,
               SupermarketName: "A"
           }, {
               Id: 3,
               ProductName: "AA",
               Lat: 49.77366771881596,
               Lng: 24.009757962417603,
               SupermarketName: "A"
           }
                , {
                    Id: 4,
                    ProductName: "AAA",
                    Lat: 49.77356771881596,
                    Lng: 24.010506962417603,
                    SupermarketName: "A"
                }
                , {
                    Id: 5,
                    ProductName: "AAAAAA",
                    Lat: 49.77346771881596,
                    Lng: 24.009558962417603,
                    SupermarketName: "A"
                }
                , {
                    Id: 6,
                    ProductName: "AAAAAAAAA",
                    Lat: 49.773709,
                    Lng: 24.009805,
                    SupermarketName: "A"
                }
        ];


        function _getProductLists(userId) {
            if (userId)
                return $q(function (resolve, reject) {
                    $http.get("http://localhost:52097/productlists/" + userId)
                        .success(function (data) {
                            $rootScope.$broadcast('productlist:updated', JSON.parse(data));
                        })
                        .error(function (err) {
                            $rootScope.$broadcast('productlist:updated', DUMMY_products);
                        });
                });
            else
                $rootScope.$broadcast('productlist:updated', []);
        }


        return {
            getAllProducts: function (supermarketId) {
                return $q(function (resolve, reject) {

                    resolve(DUMMY_products);

                    //$http.get("http://localhost:52097/api/product/" + supermarketId)//http://simplyfind.somee.com/api/product/ // http://simplyfind.gear.host/api/product/
                    //.success(function (data) {
                    //    resolve(JSON.parse(data));
                    //})
                    //.error(function (err) {
                    //    resolve(DUMMY_products);
                    //});
                });
            },

            getProductLists: _getProductLists,

            saveProductList: function (model) {
                return $q(function(resolve, reject) {
                    $http.post("http://localhost:52097/savelist/" + model.userId, model)
                        .success(function(data) {
                            _getProductLists(model.userId);
                        })
                        .error(function(err) {
                            console.log(err);
                        });
                });
            }
        };
    });
