starter
    .controller('HomeCtrl', function ($scope, $ionicGesture, $ionicPopup, $timeout, ProductService, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, $state, localstorageService, AuthService) {
            //todo

            //2. Style drop down
            //3. Animate "ckecked/unchecked" 
            var map;
            var allProducts;
            var typeaheadProducts = [];
            var markers = [];
            var centerLatLng = new google.maps.LatLng(49.773709, 24.009805);

            var vm = this;
            vm.selectedProducts = [];
            vm.lists = [];
            vm.eventHandlers = {
                listCbxClick: listCbxClick,
                listLabelClick: listLabelClick,
                onHold: onHoldList,
                onProductsChange: setMapHeight
            };
            vm.loginClick = function() {
                $state.go('login');
            }
            vm.signupClick = function () {
                $state.go('signup');
            }
            vm.logoutClick = function () {
                AuthService.logOut();
                $state.go($state.current, {}, { reload: true });
                resetData();
            }
            vm.onListClick = function(listName) {
                var list = vm.lists.find(function (l) { return l.ListName == listName });

                resetData();

                angular.forEach(list.Products, function (p) {
                    var mapped = {
                        id: p.ProductId,
                        name: p.ProductName,
                        lat: p.Latitude,
                        lng: p.Longitude,
                        IsChecked: p.IsChecked
                    };

                    addToMap(mapped);

                    vm.selectedProducts.push(p);
                });
            }
            vm.listNameId = 1;
            vm.openMenu = function() {
                $ionicSideMenuDelegate.toggleLeft();
            };

            vm.saveProductList = function () {
                var productList = {
                    userId: localstorageService.getObject('authorizationData').userId,
                    listName: "Product List " + vm.listNameId++,
                    productIds: vm.selectedProducts.map(function (p) { return p.ProductId })
                }
                ProductService.saveProductList(productList);
            };

            vm.getSliderHeight = function() {
                return $('.selected-list').outerHeight(true) + $('.typeahead-container').outerHeight(true) + 10;
            }

            vm.setSliderHeight = function() {
                return vm.selectedProducts.length ? vm.selectedProducts.length * 3 : 0;
            }

            vm.initMap = function() {
                
                ProductService.getProducts(1).then(function(data) {
                    data.forEach(function(item, i, arr) {
                        item.IsChecked = false;
                    });

                    typeaheadProducts = allProducts = data;

                    resetData();
                    $('.typeahead').bind('typeahead:select', function(ev, product) {

                        addToMap(product);
                        vm.selectedProducts.push(typeaheadProducts.find(function(p) { return p.ProductId == product.id }));
                        $ionicSlideBoxDelegate.update();

                        refreshTypeahed(typeaheadProducts.filter(function (p) { return p.ProductId != product.id }));
                    });
                });

                setMapHeight();

                var myOptions = {
                    center: centerLatLng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true
                };

                map = new google.maps.Map($("#map")[0], myOptions);
                map.setOptions({ styles: [{ featureType: "poi", stylers: [{ "visibility": "off" }] }] });
                var layer = new google.maps.KmlLayer("http://semenov.org.ua/Ashan.kmz");
                layer.setMap(map);

                $(window).resize(function () {
                    setMapHeight();
                    google.maps.event.trigger(map, "resize");
                    centerMap(centerLatLng);
                });
                


            }

            $scope.$on('productlist:updated', function (event, data) {
                vm.lists = data;
            });

            function refreshTypeahed(products) {
                typeaheadProducts = products;
                $('.typeahead').typeahead('val', '').typeahead('destroy');
                createTypeAhead();
            }

            function resetData() {

                refreshTypeahed(allProducts);

                for (var i = 0; i < markers.length; i++) {
                    markers[i].remove();
                    markers.splice(i, 1);
                    i--;
                }
                vm.selectedProducts = [];
            }

            function addToMap(product) {
                var element = $("<div/>")
                    .addClass('map-marker')
                    .data("product-id", product.id)
                    .text(product.name)
                    .append($("<div/>").addClass('pin'))[0];

                var marker = new CustomMarker(
                    new google.maps.LatLng(product.lat, product.lng),
                    map,
                    {
                        element: element,
                        id: product.id,
                        name: product.name
                    }
                );
                //click on MAP
                google.maps.event.addListener(marker, 'click', function (el) {
                    if (!vm.bla) {
                        var productId = $(el).data('product-id');
                        changeProductState(productId);
                    }
                });

                google.maps.event.addListener(marker, 'created', function (el) {
                    var product = vm.selectedProducts.filter(function (p) { return p.ProductId == $(el).data('product-id') })[0];
                    onHold(el, product.ProductId, product.ProductName);

                    centerMap(marker.getPosition());

                    $(marker.div).addClass('animated bounce');
                    $(marker.div).find('.pin').addClass('animated bounce');


                });

                markers.push(marker);

                function onHold(elem, productId, productName) {
                    $ionicGesture.on('hold', function () {
                        vm.bla = true;
                        $timeout(function () { showConfirm(productId, productName) }, 10);
                    }, angular.element(elem));
                }
            }

            function setMapHeight() {
                //$('#map').css('height', $('ion-content').outerHeight(true) - $('.typeahead-container').outerHeight(true) - $('.selected-list').outerHeight(true) - 10);
            }

            function showConfirm(productId, productName) {
                $ionicPopup.confirm({
                    title: 'Видалити ' + productName + ' ?',
                    buttons: [
                        {
                            text: 'Ні',
                            type: 'button-positive'
                        }, {
                            text: 'Так',
                            type: 'button-default',
                            onTap: function() { return true; }
                        }
                    ]
                }).then(function(res) {
                    if (res)
                        removeProduct(productId);
                    vm.bla = false;
                });

                function removeProduct(productId) {
                    //remove from map
                    var selected = getMarker(productId);
                    selected.remove();
                    markers.splice(markers.indexOf(selected), 1);

                    var toRemove = vm.selectedProducts.filter(function(p) { return p.ProductId == productId })[0];

                    //remove from list
                    vm.selectedProducts.splice(vm.selectedProducts.indexOf(toRemove), 1);

                    //add back to typeahead
                    toRemove.IsChecked = false;
                    typeaheadProducts.push(toRemove);
                    $('.typeahead').typeahead('val', '').typeahead('destroy');
                    createTypeAhead();
                }
            };

            function createTypeAhead() {
                var productNames = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    local: typeaheadProducts.map(function (p) {
                        return {
                            id: p.ProductId,
                            name: p.ProductName,
                            lat: p.Latitude,
                            lng: p.Longitude,
                            IsChecked: p.IsChecked
                        };
                    })
                });

                $('.typeahead').typeahead(
                {
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'productNames',
                    displayKey: 'name',
                    valueKey: 'name',
                    source: productNames.ttAdapter(),
                });
            }

            function listCbxClick(productId) {
                var marker = getMarker(productId);
                centerMap(marker.getPosition());
                changeProductState(productId);
                animateBounce($(marker.div));
            }

            function listLabelClick(productId) {
                var marker = getMarker(productId);
                centerMap(marker.getPosition());
                animateBounce($(marker.div));
            }

            function onHoldList(product) {
                vm.bla = true;
                showConfirm(product.ProductId, product.ProductName);
            }

            function getMarker(productId) {
                return markers.filter(function(marker) { return $(marker.args.element).data("product-id") == productId })[0];
            }

            function centerMap(latLng) {
                //$timeout(function () { map.panTo(latLng); }, 10);
                map.panTo(latLng);
            }

            function changeProductState(productId) {
                var product = vm.selectedProducts.filter(function(p) { return p.ProductId == productId })[0];
                var $mapEl = $('#map').find('.map-marker').filter(function() { return $(this).data("product-id") == productId });

                if (!product.IsChecked) {
                    //check on list and map
                    product.IsChecked = true;
                    $mapEl.addClass('checked');
                } else {
                    //uncheck on list and map 
                    product.IsChecked = false;
                    $mapEl.removeClass('checked');
                }
                $ionicSlideBoxDelegate.update();
            }

            function animateBounce($el) {
                $el.removeClass('animated bounce');
                $el.find('.pin').removeClass('animated bounce');
                $timeout(function() {
                    $el.addClass('animated bounce');
                    $el.find('.pin').addClass('animated bounce');
                }, 10);
            }

        }
    );
