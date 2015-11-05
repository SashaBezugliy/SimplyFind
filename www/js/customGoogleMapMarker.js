function CustomMarker(latlng, map, args) {
	this.latlng = latlng;	
	this.args = args;	
	this.setMap(map);
    this.div;
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function() {
	
	var self = this;
	
	var div = this.div;
	
	if (!div) {

	    div = this.div = self.args.element;

		google.maps.event.addDomListener(div, "click", function(event) {		
			google.maps.event.trigger(self, "click", div);
		});
		
		var panes = this.getPanes();
		panes.overlayImage.appendChild(div);

		google.maps.event.trigger(self, "created", div);
	}
	
	var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
	
	if (point) {
		div.style.left = (point.x ) + 'px';
		div.style.top = (point.y ) + 'px';
	}
};

CustomMarker.prototype.remove = function() {
    if (this.div) {
        this.div.parentNode.removeChild(this.div);
	}	
};

CustomMarker.prototype.getPosition = function() {
	return this.latlng;	
};
