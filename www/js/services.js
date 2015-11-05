angular.module('starter.services', [])

.factory('ProductService', function() {
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
        ];

        return {
            all: function() {
                return products;
            },
            remove: function(chat) {
                products.splice(chats.indexOf(chat), 1);
            },
            get: function(chatId) {
                for (var i = 0; i < products.length; i++) {
                    if (products[i].id === parseInt(chatId)) {
                        return products[i];
                    }
                }
                return null;
            }
        };
    });
