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
            $scope.slides = [
                {
                    products: [{ id: 111, name: "111" }, { id: 222, name: "222" }, { id: 333, name: "333" }]
                },
                {
                    products: [{ id: 444, name: "444" }, { id: 555, name: "555" }]
                },
                {
                    products: [{ id: 666, name: "666" }]
                }
            ];

            vm.listCbxClick = listCbxClick;
            vm.listLabelClick = listLabelClick;

            vm.initMap = function () {

                ProductService.getProducts(1).then(function(data) {
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
                            changeMarkerState(productId);
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

                function addToList(product) {
                    var unfilled = $scope.slides.filter(function (s) { return s.products.length < 3 });
                    var slide;
                    if (unfilled.length) {
                        slide = unfilled[0];
                        slide.products.push({ id: product.id, name: product.name });
                        if (slide.products.length === 3)
                            $scope.slides.push({ products: [] });
                    } else {
                        slide = { products: [{ id: product.id, name: product.name }] };
                        $scope.slides.push(slide);
                    }

                    $ionicSlideBoxDelegate.update();

                    var $div = $("[product-id='" + product.id + "']");

                    //onHold($div, product.id, product.name);
                }

                function onHold(elem, productId, productName) {
                    $ionicGesture.on('hold', function () {
                        vm.bla = true;
                        $timeout(function () { showConfirm(productId, productName) }, 10);
                    }, angular.element(elem));
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

                        //add back to typeahead
                        allProducts = allProducts.concat(selectedProducts.filter(function (p) { return p.ProductId == productId }));
                        $('.typeahead').typeahead('val', '').typeahead('destroy');
                        createTypeAhead();
                    }
                };

                function filterTypeahed(product) {
                    selectedProducts = selectedProducts.concat(allProducts.filter(function (p) { return p.ProductId == product.id }));
                    allProducts = allProducts.filter(function (p) { return p.ProductId != product.id });
                    $('.typeahead').typeahead('val', '').typeahead('destroy');
                    createTypeAhead();
                }

                function createTypeAhead() {
                    var productNames = new Bloodhound({
                        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        local: allProducts.map(function (p) {
                            return {
                                name: p.ProductName,
                                lat: p.Latitude,
                                lng: p.Longitude,
                                id: p.ProductId
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

                function setMapHeight() {
                    $('#map').css('height', $('ion-content').outerHeight(true) - $('.typeahead-container').outerHeight(true) - $('.selected-list').outerHeight(true));
                }
            }

            function listCbxClick(productId) {
                var marker = getMarker(productId);
                centerMap(marker.getPosition());
                changeMarkerState(productId);
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

            function changeMarkerState(productId) {
                var $listEl = $('.list-marker').filter(function () { return $(this).data("product-id") == productId });
                var $mapEl = $('#map').find('.map-marker').filter(function () { return $(this).data("product-id") == productId });
                var isChecked = $listEl.hasClass('checked');
                if (!isChecked) {
                    //check on list and map
                    $listEl.addClass('checked');
                    $mapEl.addClass('checked');
                } else {
                    //uncheck on list and map 
                    $listEl.removeClass('checked');
                    $mapEl.removeClass('checked');
                }
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
