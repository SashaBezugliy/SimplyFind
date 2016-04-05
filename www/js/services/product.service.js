starter
    .factory('ProductService', function ($http, $q, $rootScope) {
        var products = [
                {
                    Id: 2,
                    ProductName: "Чай",
                    Lat: 49.77376771881596,
                    Lng: 24.010657962417603,
                    SupermarketName: "A"
                }, {
                    Id: 3,
                    ProductName: "Чіпси",
                    Lat: 49.77366771881596,
                    Lng: 24.009757962417603,
                    SupermarketName: "A"
                }
                , {
                    Id: 4,
                    ProductName: "Чанахи",
                    Lat: 49.77356771881596,
                    Lng: 24.010506962417603,
                    SupermarketName: "A"
                }
                , {
                    Id: 5,
                    ProductName: "Фісташки",
                    Lat: 49.77346771881596,
                    Lng: 24.009558962417603,
                    SupermarketName: "A"
                }
                , {
                    Id: 6,
                    ProductName: "Центр",
                    Lat: 49.773709,
                    Lng: 24.009805,
                    SupermarketName: "A"
                }
        ];
        
        return {
            getProducts: function (supermarketId) {
                return $q(function (resolve, reject) {
                    $http.get("http://localhost:52097/api/product/" + supermarketId)//http://simplyfind.somee.com/api/product/ // http://simplyfind.gear.host/api/product/
                    .success(function (data) {
                        resolve(JSON.parse(data));
                    });
                });
            },

            getProductLists: function (userId) {
                return $q(function (resolve, reject) {
                    $http.get("http://localhost:52097/productlists/" + userId)
                        .success(function (data) {
                            $rootScope.$broadcast('productlist:updated', JSON.parse(data));
                        });
                });
            }
        };
    });
