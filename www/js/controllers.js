angular.module('starter.controllers', [])
    .controller('HomeCtrl', function ($scope,$ionicGesture,$ionicPopup, $timeout, ProductService) {

            var map;
            var allProducts = [];
            var selectedProducts = [];
            var index = 0;
            var markers = [];
        
            $.each(ProductService.all(), function (i, product) { allProducts.push(product); });
            createTypeAhead();
            
            $('.typeahead').bind('typeahead:select', function (ev, product) {
                index++;

                addToMap(product);
                addToList(product);

                filterTypeahed(product);
            });

            $scope.initMap = function () {
                $('#map').css('height', $('body').height() - $('.typeahead-container').outerHeight(true));

                var myOptions = {
                    center: new google.maps.LatLng(49.773709, 24.009805),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true
                };
                map = new google.maps.Map(document.getElementById("map"), myOptions);
                map.setOptions({ styles: [{ featureType: "poi", stylers: [{ "visibility": "off" }] }] });

                var ctrlBottom = $('<div/>', { "class": "selected-list" });
                map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(ctrlBottom[0]);

                $(window).resize(function() {
                    //google.maps.event.trigger(map, "resize");
                    //map.setCenter(new google.maps.LatLng(49.773709, 24.009805));
                });

                var layer = new google.maps.KmlLayer("http://semenov.org.ua/Ashan.kmz");
                layer.setMap(map);
            }

            function addToMap(product) {
                var element = $("<div/>")
                    .addClass('map-marker animated bounce')
                    .data("product-id", product.id)
                    .text(product.name)
                    .append($("<div/>").addClass('pin animated bounce'))[0];

                var marker = new CustomMarker(
                    new google.maps.LatLng(product.lat, product.lng),
                    map,
                    { element: element }
                );
                //click on MAP
                google.maps.event.addListener(marker, 'click', function(el) {
                    var productId = $(el).data('product-id');
                    changeMarkerState(productId);
                });

                google.maps.event.addListener(marker, 'created', function(el) {
                    var product = selectedProducts.filter(function (p) { return p.Id == $(el).data('product-id') })[0];
                    onHold(el, showConfirm, product.Id, product.ProductName);

                    $timeout(function() {
                        map.setCenter(marker.getPosition());
                        //map.panBy(0, (map.getDiv().offsetHeight / 2) /*+ that.anchorPoint.y*/);
                    }, 100);

                });

                markers.push(marker);
            }

            function addToList(product) {
                var $dt = $('<div/>').addClass("list-marker-container");
                var $div = $('<div/>').addClass("list-marker ").data('product-id', product.id);
                var $span = $('<span/>').text(product.name);
                $('.selected-list').append($dt.append($div).append($span).fadeIn(1000));

                //click on LIST
                $dt.click(function () {
                    var productId = $(this).find('div').data('product-id');
                    changeMarkerState(productId);
                });
                onHold($dt, showConfirm, product.id, product.name);
            }

            function onHold(elem, showConfirm, productId, productName) {
                $ionicGesture.on('hold', function () {
                    $timeout(function () { showConfirm(productId, productName) }, 200);
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
                    $("span." + productId + "").removeClass('checked');
                    $mapEl.removeClass('checked');
                }
            }

            function showConfirm(productId, productName) {
                $ionicPopup.confirm({
                    title: 'Видалити ' + productName + ' ?',
                    //template: 'Видалити ' + '<b>' + productName + '</b>' + ' ?'
                    buttons: [
                        {
                            text: 'Ні',
                            type: 'button-positive'
                        }, {
                            text: 'Так',
                            type: 'button-default',
                            onTap: function() {return true;}
                        }
                    ]
                }).then(function (res) {
                    if (res)
                        removeMarkerFunc(productId);
                });

                function removeMarkerFunc(productId) {
                    //remove from map
                    var selected = markers.filter(function (marker) { return $(marker.args.element).data("product-id") == productId })[0];
                    selected.remove();
                    markers.splice(markers.indexOf(selected), 1);
                    //remove from list
                    $('.selected-list').find('.list-marker').filter(function () { return $(this).data("product-id") == productId })
                        .parent().remove();

                    //add back to typeahead
                    allProducts = allProducts.concat(selectedProducts.filter(function (p) { return p.Id == productId }));
                    $('.typeahead').typeahead('val', '').typeahead('destroy');
                    createTypeAhead();
                }
            };
        
            function filterTypeahed(product) {
                selectedProducts = selectedProducts.concat(allProducts.filter(function(p) { return p.Id == product.id }));
                allProducts = allProducts.filter(function(p) { return p.Id != product.id });
                $('.typeahead').typeahead('val', '').typeahead('destroy');
                createTypeAhead();
            }

            function createTypeAhead() {
                var productNames = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    local: allProducts.map(function(p) {
                        return {
                            name: p.ProductName,
                            lat: p.Lat,
                            lng: p.Lng,
                            id: p.Id
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

        }
    );
