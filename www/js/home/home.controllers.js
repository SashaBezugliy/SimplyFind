starter
    .controller('HomeCtrl', function($scope, $ionicGesture, $ionicPopup, $timeout, ProductService, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, $state) {
            //todo

            //2. Style drop down
            //3. Animate "ckecked/unchecked" 
            var map;
            var allProducts = [];
            var markers = [];
            var centerLatLng = new google.maps.LatLng(49.773709, 24.009805);

            var vm = this;
            vm.selectedProducts = [];
            vm.eventHandlers = {
                listCbxClick: listCbxClick,
                listLabelClick: listLabelClick,
                onHold: onHoldList,
                onProductsChange: setMapHeight
            };
            vm.loginClick = function() {
                $state.go('login');
            }
            vm.openMenu = function() {
                $ionicSideMenuDelegate.toggleLeft();
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

                    allProducts = data;

                    createTypeAhead();
                    $('.typeahead').bind('typeahead:select', function(ev, product) {

                        addToMap(product);
                        vm.selectedProducts.push(allProducts.filter(function(p) { return p.ProductId == product.id })[0]);
                        $ionicSlideBoxDelegate.update();

                        filterTypeahed(product);
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

                $(window).resize(function() {
                    setMapHeight();
                    google.maps.event.trigger(map, "resize");
                    centerMap(centerLatLng);
                });

                var layer = new google.maps.KmlLayer("http://semenov.org.ua/Ashan.kmz");
                layer.setMap(map);
                
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
                    google.maps.event.addListener(marker, 'click', function(el) {
                        if (!vm.bla) {
                            var productId = $(el).data('product-id');
                            changeProductState(productId);
                        }
                    });

                    google.maps.event.addListener(marker, 'created', function(el) {
                        var product = vm.selectedProducts.filter(function(p) { return p.ProductId == $(el).data('product-id') })[0];
                        onHold(el, product.ProductId, product.ProductName);

                        centerMap(marker.getPosition());

                        $(marker.div).addClass('animated bounce');
                        $(marker.div).find('.pin').addClass('animated bounce');


                    });

                    markers.push(marker);
                }

                function onHold(elem, productId, productName) {
                    $ionicGesture.on('hold', function() {
                        vm.bla = true;
                        $timeout(function() { showConfirm(productId, productName) }, 10);
                    }, angular.element(elem));
                }

                function filterTypeahed(product) {
                    allProducts = allProducts.filter(function(p) { return p.ProductId != product.id });
                    $('.typeahead').typeahead('val', '').typeahead('destroy');
                    createTypeAhead();
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
                    allProducts.push(toRemove);
                    $('.typeahead').typeahead('val', '').typeahead('destroy');
                    createTypeAhead();
                }
            };

            function createTypeAhead() {
                var productNames = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    local: allProducts.map(function(p) {
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
