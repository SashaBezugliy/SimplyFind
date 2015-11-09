angular.module('starter.controllers', [])
    .controller('HomeCtrl', function ($scope,$ionicGesture,$ionicPopup, $timeout, ProductService) {
        //todo
        //1. Fix onhold on marker on mobile
        //2. Style drop down
        //3. Animate "ckecked/unchecked" 
        //4. Max height for bottom area.
        //4. Create server, connect it to database, deploy to SAMI
            var map;
            var allProducts = [];
            var selectedProducts = [];
            var index = 0;
            var markers = [];
            var centerLatLng = new google.maps.LatLng(49.773709, 24.009805);
        
            $.each(ProductService.all(), function (i, product) { allProducts.push(product); });
            createTypeAhead();
            
            $('.typeahead').bind('typeahead:select', function (ev, product) {
                index++;

                addToMap(product);
                addToList(product);

                filterTypeahed(product);
            });

            $scope.initMap = function () {
                setMapHeight();

                var myOptions = {
                    center: centerLatLng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true
                };
                map = new google.maps.Map($("#map")[0], myOptions);
                map.setOptions({ styles: [{ featureType: "poi", stylers: [{ "visibility": "off" }] }] });

                var ctrlBottom = $('<div/>', { "class": "selected-list" });
                map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(ctrlBottom[0]);

                $(window).resize(function() {
                    setMapHeight();
                    google.maps.event.trigger(map, "resize");
                    centerMap(centerLatLng);
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
                    onHold(el, product.Id, product.ProductName);

                    centerMap(marker.getPosition());

                });

                markers.push(marker);
            }

            function addToList(product) {
                var $dt = $('<div/>', { 'class': "list-marker-container"});
                var $cbx = $('<div/>', { 'class': "list-marker left", click: onCbxClick, data: { 'product-id': product.id } });
                var $label = $('<div/>', { 'class': "left", text: product.name, click: onLabelClick, data: { 'product-id': product.id } });
                $('.selected-list').append($dt.append($cbx).append($label).fadeIn(1000));

                onHold($dt, product.id, product.name);

                function onLabelClick() {
                    var marker = getMarker($(this).data('product-id'));
                    centerMap(marker.getPosition());
                }

                function onCbxClick() {
                    changeMarkerState($(this).data('product-id'));
                }
            }

            function onHold(elem, productId, productName) {
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
                        removeMarker(productId);
                });

                function removeMarker(productId) {
                    //remove from map
                    var selected = getMarker(productId);
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

            function setMapHeight() {
                $('#map').css('height', $('body').height() - $('.typeahead-container').height());
            }

            function getMarker(productId) {
                return markers.filter(function (marker) { return $(marker.args.element).data("product-id") == productId })[0];
            }

            function centerMap(latLng) {
                $timeout(function () { map.panTo(latLng); }, 100);
            }
        }
    );
