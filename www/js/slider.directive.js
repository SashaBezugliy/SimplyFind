angular.module('starter.directives', [])
.directive('slider', function () {

    var directive = {
        restrict: 'E',
        templateUrl: '../slider.html',
        controller: Сontroller,
        controllerAs: 'ctrl',
        replace: true,
        scope: {
            products: '=',
            eventHandlers: '='
        }
    };
    return directive;

    function Сontroller($scope, $ionicSlideBoxDelegate) {
        var vm = this;
        vm.options = {
            slidesPerView: 1
        };
        vm.slides = [{ products: [] }];
        vm.listCbxClick = $scope.eventHandlers.listCbxClick;
        vm.listLabelClick = $scope.eventHandlers.listLabelClick;
        vm.onHold = $scope.eventHandlers.onHold;

        $scope.$watch('products', function (newVal, oldVal) {
            if (newVal.length > oldVal.length) {
                var product = newVal[newVal.length - 1];
                addToList(product);
            }
            else if (newVal.length < oldVal.length) {
                vm.slides = [{ products: [] }];
                for (var i = 0; i < newVal.length; i++)
                    addToList(newVal[i]);
            }
            $ionicSlideBoxDelegate.update();
        }, true);



        function addToList(product) {
            var unfilledSlide = vm.slides.filter(function (s) { return s.products.length < 3 });
            var slide;
            if (unfilledSlide.length) {
                slide = unfilledSlide[0];
                slide.products.push(product);
            } else {
                slide = { products: [product] };
                vm.slides.push(slide);
            }
        }
    }
    
});