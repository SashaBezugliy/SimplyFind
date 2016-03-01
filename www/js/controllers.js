angular.module('starter.controllers', [])
    .controller('HomeCtrl', function ($scope, $ionicGesture,$ionicPopup, $timeout, ProductService) {
        //todo
        
        //2. Style drop down
        //3. Animate "ckecked/unchecked" 
            var map;
            var allProducts = [];
            var selectedProducts = [];
            var index = 0;
            var markers = [];
            var centerLatLng = new google.maps.LatLng(49.773709, 24.009805);
        
            $scope.initMap = function () {

                ProductService.getProducts(1).then(function(data) {
                        allProducts = data;
                        createTypeAhead();
                        $('.typeahead').bind('typeahead:select', function(ev, product) {
                            index++;

                            addToMap(product);
                            addToList(product);
                            
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

                //var ctrlBottom = $('<div/>', { "class": "selected-list" });
                //map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(ctrlBottom[0]);

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
                        if (!$scope.bla) {
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

                    var $div = $('<div/>', { 'class': "list-marker-container" });

                    var $cbx = $('<div/>', {
                        'class': "list-marker left",
                        click: function () {
                            var productId = $(this).data('product-id');
                            centerMap(getMarker(productId).getPosition());
                            changeMarkerState(productId);
                        },
                        data: { 'product-id': product.id }
                    });

                    var $label = $('<div/>', {
                        'class': "left product-text",
                        text: product.name,
                        click: function() {
                            var marker = getMarker($(this).data('product-id'));
                            centerMap(marker.getPosition());
                            $(marker.div).removeClass('animated bounce');
                            $(marker.div).find('.pin').removeClass('animated bounce');
                            $timeout(function () {
                                $(marker.div).addClass('animated bounce');
                                $(marker.div).find('.pin').addClass('animated bounce');
                            }, 10);

                        },
                        data: { 'product-id': product.id }
                    });

                    var el = $div.append($cbx).append($label).fadeIn(1000);

                    if ($('.selected-list').find('.list-marker').length) {
                        $('.selected-list').slick('unslick');
                    }

                    if ($('.slick-item:not(.three)').length) {
                        $('.slick-item:not(.three)').append(el);
                        if ($('.slick-item:not(.three)').children().length === 3)
                            $('.slick-item:not(.three)').addClass('three');
                    } else {
                        var $slickItem = $('<div/>', { 'class': "slick-item" }).append(el);
                        $('.selected-list').append($slickItem);
                    }

                    $('.selected-list').slick({
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        arrows: true,
                        infinite: false
                    });

                    onHold($div, product.id, product.name);
                }

                function onHold(elem, productId, productName) {
                    $ionicGesture.on('hold', function () {
                        $scope.bla = true;
                        $timeout(function () { showConfirm(productId, productName) }, 10);
                    }, angular.element(elem));
                }

                function changeMarkerState(productId) {
                    var $listEl = $('.selected-list').find('.list-marker').filter(function () { return $(this).data("product-id") == productId });
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
                        $scope.bla = false;
                    });

                    function removeMarker(productId) {
                        //remove from map
                        var selected = getMarker(productId);
                        selected.remove();
                        markers.splice(markers.indexOf(selected), 1);

                        //remove from list
                        removeFromList();

                        //add back to typeahead
                        allProducts = allProducts.concat(selectedProducts.filter(function (p) { return p.ProductId == productId }));
                        $('.typeahead').typeahead('val', '').typeahead('destroy');
                        createTypeAhead();

                        function removeFromList() {
                            var checkedProductIds = $('.selected-list').find('.list-marker.checked')
                                .filter(function (i) { return $(this).data("product-id") !== productId })
                                .map(function () { return $(this).data("product-id") });

                            //reorder list
                            $('.selected-list').slick('unslick').empty();
                            for (var i = 0; i < markers.length; i++) {
                                addToList({ id: markers[i].id, name: markers[i].name })
                            }
                            //keep previously checked items as checked
                            for (var i = 0; i < checkedProductIds.length; i++) {
                                $('.selected-list').find('.list-marker').filter(function (i) { return $(this).data("product-id") === checkedProductIds[i] })
                                .addClass('checked');
                            }
                        }
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
                    $('#map').css('height', $('body').height() - $('.typeahead-container').height());
                }

                function getMarker(productId) {
                    return markers.filter(function (marker) { return $(marker.args.element).data("product-id") == productId })[0];
                }

                function centerMap(latLng) {
                    //$timeout(function () { map.panTo(latLng); }, 10);
                    map.panTo(latLng);
                }
            }
        }
    );
