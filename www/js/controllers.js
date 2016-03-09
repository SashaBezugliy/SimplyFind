angular.module('starter.controllers', [])
    .controller('HomeCtrl', function ($scope, $ionicGesture, $ionicPopup, $timeout, ProductService, $ionicSlideBoxDelegate) {
        //todo
        
        //2. Style drop down
        //3. Animate "ckecked/unchecked" 
            var map;
            var allProducts = [];
            var selectedProducts = [];
            var index = 0;
            var markers = [];
            var centerLatLng = new google.maps.LatLng(49.773709, 24.009805);
            var vm = this;

            vm.options = {
                slidesPerView: 1
            };
            vm.slides = [
                {
                    products: []
                }
            ];

            vm.listCbxClick = listCbxClick;
            vm.listLabelClick = listLabelClick;
            vm.onHold = onHoldList;

            vm.initMap = function () {

                ProductService.getProducts(1).then(function(data) {
                    data.forEach(function (item, i, arr) {
                        item.isChecked = false;
                    });

                    allProducts = data;

                        createTypeAhead();
                        $('.typeahead').bind('typeahead:select', function(ev, product) {
                            index++;

                            addToMap(product);
                            addToList(product);
                            setMapHeight();

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
                    google.maps.event.addListener(marker, 'click', function (el) {
                        if (!vm.bla) {
                            var productId = $(el).data('product-id');
                            changeProductState(productId);
                        }
                    });

                    google.maps.event.addListener(marker, 'created', function (el) {
                        var product = selectedProducts.filter(function (p) { return p.ProductId == $(el).data('product-id') })[0];
                        onHold(el, product.ProductId, product.ProductName);

                        centerMap(marker.getPosition());

                        $(marker.div).addClass('animated bounce');
                        $(marker.div).find('.pin').addClass('animated bounce');


                    });

                    markers.push(marker);
                }

                function onHold(elem, productId, productName) {
                    $ionicGesture.on('hold', function () {
                        vm.bla = true;
                        $timeout(function () { showConfirm(productId, productName) }, 10);
                    }, angular.element(elem));
                }

                function filterTypeahed(product) {
                    selectedProducts = selectedProducts.concat(allProducts.filter(function (p) { return p.ProductId == product.id }));
                    allProducts = allProducts.filter(function (p) { return p.ProductId != product.id });
                    $('.typeahead').typeahead('val', '').typeahead('destroy');
                    createTypeAhead();
                }

                function setMapHeight() {
                    $('#map').css('height', $('ion-content').outerHeight(true) - $('.typeahead-container').outerHeight(true) - $('.selected-list').outerHeight(true));
                }
            }

            function onHoldList(product) {
                vm.bla = true;
                showConfirm(product.id, product.name);
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
                            onTap: function () { return true; }
                        }
                    ]
                }).then(function (res) {
                    if (res)
                        removeMarker(productId);
                    vm.bla = false;
                });

                function removeMarker(productId) {
                    //remove from map
                    var selected = getMarker(productId);
                    selected.remove();
                    markers.splice(markers.indexOf(selected), 1);

                    var toRemove = selectedProducts.filter(function (p) { return p.ProductId == productId })[0];
                    
                    //remove from list
                    selectedProducts.splice(selectedProducts.indexOf(toRemove), 1);
                    vm.slides = [];
                    for (var i = 0; i < selectedProducts.length; i++) {
                        var product = {
                            id: selectedProducts[i].ProductId,
                            name: selectedProducts[i].ProductName,
                            isChecked: selectedProducts[i].isChecked
                        };
                        addToList(product);
                    }

                    //add back to typeahead
                    toRemove.isChecked = false;
                    allProducts = allProducts.concat([toRemove]);
                    $('.typeahead').typeahead('val', '').typeahead('destroy');
                    createTypeAhead();
                }
            };

            function addToList(product) {
                var unfilled = vm.slides.filter(function (s) { return s.products.length < 3 });
                var slide;
                if (unfilled.length) {
                    slide = unfilled[0];
                    slide.products.push({ id: product.id, name: product.name, isChecked: product.isChecked });
                } else {
                    slide = { products: [{ id: product.id, name: product.name, isChecked: product.isChecked }] };
                    vm.slides.push(slide);
                }

                $ionicSlideBoxDelegate.update();
            }

            function createTypeAhead() {
                var productNames = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    local: allProducts.map(function (p) {
                        return {
                            id: p.ProductId,
                            name: p.ProductName,
                            lat: p.Latitude,
                            lng: p.Longitude,
                            isChecked: p.isChecked
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

            function getMarker(productId) {
                return markers.filter(function (marker) { return $(marker.args.element).data("product-id") == productId })[0];
            }

            function centerMap(latLng) {
                //$timeout(function () { map.panTo(latLng); }, 10);
                map.panTo(latLng);
            }

            function changeProductState(productId) {
                var product = selectedProducts.filter(function (p) { return p.ProductId == productId })[0];
                var $mapEl = $('#map').find('.map-marker').filter(function () { return $(this).data("product-id") == productId });
                
                var slideProduct;
                for (var i = 0; i < vm.slides.length; i++) {
                    var temp = vm.slides[i].products.filter(function (p) { return p.id === productId })[0];
                    if (temp) { slideProduct = temp }
                }

                if (!product.isChecked) {
                    //check on list and map
                    product.isChecked = slideProduct.isChecked = true;
                    $mapEl.addClass('checked');
                } else {
                    //uncheck on list and map 
                    product.isChecked = slideProduct.isChecked = false;
                    $mapEl.removeClass('checked');
                }

                $ionicSlideBoxDelegate.update();
            }

            function animateBounce($el) {
                $el.removeClass('animated bounce');
                $el.find('.pin').removeClass('animated bounce');
                $timeout(function () {
                    $el.addClass('animated bounce');
                    $el.find('.pin').addClass('animated bounce');
                }, 10);
            }
        }
    );
