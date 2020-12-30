console.log('entering label_slide.js');




document.getElementById('button').addEventListener('click', function() {
  selectionMode = true;
  console.log('button pressed');
  viewer.setMouseNavEnabled(false);
});

function addNewRegion(sid, x, y, width, height){
	$.post("/add_new_region/", {'sid':sid, 'x':x, 'y':y, 'width': width, 'height':height}, function(json){
			console.log("Was successful?: " + json['success']);
	});
 }


console.log(dzi_path)


// https://codepen.io/iangilman/pen/qBdabGM
// https://stackoverflow.com/questions/36006823/openseadragon-selection information on how to return info from selection

var viewer = OpenSeadragon({
    id: "openseadragon1",
    showNavigator:  true,
    debugMode: false,
    visibilityRatio: 1.0,
    prefixUrl: prefix_url,
    tileSources: dzi_path,
});


var drag;
var selectionMode = false;


new OpenSeadragon.MouseTracker({
    element: viewer.element,
    
    pressHandler: function(event) {
    	console.log('Presss handler')
      if (!selectionMode) {
        return;
      }
      
      var overlayElement = document.createElement('div');
      overlayElement.id = "box1"
      overlayElement.class = "box_selection"
      overlayElement.style.border = "4px solid red"
      var viewportPos = viewer.viewport.pointFromPixel(event.position);
      viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
      
      imagePointPos = viewer.viewport.viewportToImageCoordinates(viewportPos);
  
      drag = {
        overlayElement: overlayElement, 
        startPos: viewportPos,
        startPosImagePoint: imagePointPos,
        endPosImagePoint: imagePointPos,
      };
    },

    dragHandler: function(event) {
      if (!drag) {
        return;
      }
  
      var viewportPos = viewer.viewport.pointFromPixel(event.position);
      var diffX = viewportPos.x - drag.startPos.x;
      var diffY = viewportPos.y - drag.startPos.y;
  
      var location = new OpenSeadragon.Rect(
        Math.min(drag.startPos.x, drag.startPos.x + diffX), 
        Math.min(drag.startPos.y, drag.startPos.y + diffY), 
        Math.abs(diffX), 
        Math.abs(diffY)
      );
  
      viewer.updateOverlay(drag.overlayElement, location);
      drag.endPosImagePoint = viewer.viewport.viewportToImageCoordinates(viewportPos);
    },

	releaseHandler: function(event) {


		var x1 = drag.startPosImagePoint.x;
		var y1 = drag.startPosImagePoint.y;
		var x2 = drag.endPosImagePoint.x;
		var y2 = drag.endPosImagePoint.y;
		$.post("/add_new_region/", {'sid':slide_id, 'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2}, function(json){
			console.log("Was successful?: " + json['success']);
		});
		
		// var y = drag.overlayElement.y;
		// var width = drag.overlayElement.width;
  //     	var height = drag.overlayElement.height;
  //     	console.log('release ', x, y, width, height);
      	console.log(drag, x1)
      	// console.log(drag.overlayElement.getBoundingClientRect())

		// Description of coordinate system
		// https://openseadragon.github.io/examples/viewport-coordinates/


		// var viewportPos = viewer.viewport.pointFromPixel(event.position);

		// // The canvas-click event gives us a position in web coordinates.
	 //    var webPoint = event.position;
	 //    console.log(webPoint)

	 //    webPoint.x = x;
	 //    webPoint.y = y;
	 //    console.log(webPoint)

	 //    // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
	 //    var viewportPoint = viewer.viewport.pointFromPixel(webPoint);

	 //    // Convert from viewport coordinates to image coordinates.
	 //    var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);

	 //    // Show the results.
	 //    console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());

		// console.log(viewer.getOverlayById("box1"))

	    drag = null;
	    selectionMode = false;
	    viewer.setMouseNavEnabled(true);
	}

});

console.log('exiting label_slide.js');
