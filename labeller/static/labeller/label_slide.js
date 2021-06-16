console.log('entering label_slide.js');



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

// function addNewCircle(cell) {
//   // var newDiv1 = '<span class="dot no_highlight_dot '+cell.cell_type+'" id="centroid'+cell.getCID()+ '" style=" display: inline-block; ';
//   if ($('.hidden_dot').length >0){
//     var newDiv1 = '<span class="hidden_dot no_highlight_dot '+cell.cell_type+'" id="centroid'+cell.getCID()+ '" style="';     
//   }
//   else {
//     var newDiv1 = '<span class="dot no_highlight_dot '+cell.cell_type+'" id="centroid'+cell.getCID()+ '" style="';
//   }

//   newDiv1 = newDiv1 + 'position: absolute; top: ' + (cell.y-7) +'px; left: ' + (cell.x-7) + 'px; z-index: 100">';   
//   newDiv1 = newDiv1 + '</span>';
//   //console.log("NewDiv1=", newDiv1, $(newDiv1));
//   //$( ".canvas-container" ).append ($(newDiv1));
//   //$( "#region_canvas_container" ).append ($(newDiv1));
//   //region_container_fabric

//   var overlayElement = document.createElement('div');
//   overlayElement.style.border = "100px solid red"

//   //var viewportPos = viewer.viewport.pointFromPixel(event.position);
//   // var viewportPos = viewer.viewport.pointFromPixel((cell.x_slide, cell.x_slide));
//   // console.log(viewportPos)
//   // //viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
//   // viewer.addOverlay(overlayElement, new OpenSeadragon.Point(viewportPos.x, viewportPos.y));
//   // viewer.addOverlay($(newDiv1)[0], new OpenSeadragon.Point(viewportPos.x, viewportPos.y));
//   // point = new OpenSeadragon.Point(cell.x_slide, cell.x_slide)
//   // console.log(point)
//   // console.log(overlayElement)
//   // console.log($(newDiv1)[0])
//   // viewer.addOverlay(overlayElement, new OpenSeadragon.Point(cell.x_slide, cell.x_slide));
//   // viewer.addOverlay($(newDiv1)[0], new OpenSeadragon.Point(cell.x_slide, cell.x_slide));
// //  viewer.addOverlay(overlayElement, new OpenSeadragon.Point(cell.x_slide, cell.x_slide), checkResize=True);

  
//   $("#centroid"+cell.getCID()).on('click', function() {
//     Cell.selectCellByCID(cell.getCID());
//     RegionLabellerFabric.selectBoxAsActiveFromCID(cell.getCID());

//   });
//   Cell.highlightCircle(cell.getCID());
//   // dragElement(document.getElementById("centroid"+cell.getCID()));
//   //RegionLabellerFabric.dragCell(document.getElementById("centroid"+cell.getCID()), cell);

//   var cid = cell.getCID();
//   $("#centroid"+cell.getCID()).mousedown(function(e) {
//     /* Act on the event */
//     e = e || window.event;
//     Cell.selectCellByCID(cid);
//     RegionLabellerFabric.selectBoxAsActiveFromCID(cid)
//     console.log('celldrag', this, event, cell, canvas);
//     e.preventDefault();
//     var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     var jq_obj = this;
//     var elmnt = this;
//     document.onmouseup = closeDragElement;
//     document.onmousemove = elementDrag;

//     $(document).mousemove(function(e){
//      e = e || window.event;
//      e.preventDefault()
//      pos1 = pos3 - e.clientX;
//      pos2 = pos4 - e.clientY;
//      pos3 = e.clientX;
//      pos4 = e.clientY;
//      // set the element's new position:
//      jq_obj.style.top = (jq_obj.offsetTop - pos2) + "px";
//      jq_obj.style.left = (jq_obj.offsetLeft - pos1) + "px";
//     });

//     function elementDrag(e) {
//         e = e || window.event;
//         e.preventDefault();
//         // calculate the new cursor position:
//         pos1 = pos3 - e.clientX;
//         pos2 = pos4 - e.clientY;
//         pos3 = e.clientX;
//         pos4 = e.clientY;
//         // set the element's new position:
//         elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
//         elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
//     }

//     function closeDragElement(e) {
//       var BB = document.getElementById('region_canvas_original').getBoundingClientRect();
//       var X_center=e.clientX-BB.left;
//       var Y_center=e.clientY-BB.top;
//       var box_left = X_center - cell.width/2
//       var box_top = Y_center - cell.height/2;
//       console.log('closedragelement', X_center,Y_center, cell)
//       RegionLabellerFabric.updateCellLocation(cid, box_top, box_left, cell.height, cell.width, canvas);
//       //RegionLabellerFabric.addBoundingBoxFromCell(canvas, cell);

//       /* stop moving when mouse button is released:*/
//       document.onmouseup = null;
//       document.onmousemove = null;

//     }
//     $(document).mouseup(function(e){
//      e = e || window.event;
//      RegionLabellerFabric.selectBoxAsActiveFromCID (cid)
//      //canvas.remove(canvas.getActiveObject());
//      //RegionLabellerFabric.addBoundingBoxFromCell(canvas, cell);

//      /* stop moving when mouse button is released:*/
//      $(document).mouseup = null;
//      $(document).mousemove = null;
//     });
//   });
// }

//var all_cells = Cell.LoadCellsFromJson ('{{cells_json}}');
    //console.log('{{cells_json}}')
// for (var key in all_cells) {
//   var cell = all_cells[key];
//   console.log('temp', cell)
//   //addNewCircle(cell);
// }

// Add fabric rectangle
// var rect = new fabric.Rect({
//     left: 0,
//     top: 0,
//     fill: 'red',
//     width: 200,
//     height: 200
// });
// overlay.fabricCanvas().add(rect);



// new OpenSeadragon.MouseTracker({
//     element: viewer.element,
//     pressHandler: function(event) {
//       if (!selectionMode) {
//         return;
//       }
      
//       // var overlayElement = document.createElement('div');
//       // overlayElement.style.background = 'rgba(255, 0, 0, 0.3)'; 
//       // var viewportPos = viewer.viewport.pointFromPixel(event.position);
//       // viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
      
//       // drag = {
//       //   overlayElement: overlayElement, 
//       //   startPos: viewportPos
//       // };

//       var overlayElement = document.createElement('div');
//       overlayElement.id = "box1"
//       overlayElement.class = "box_selection"
//       overlayElement.style.border = "4px solid red"
//       var viewportPos = viewer.viewport.pointFromPixel(event.position);
//       viewer.addOverlay(overlayElement, new OpenSeadragon.Rect(viewportPos.x, viewportPos.y, 0, 0));
      
//       imagePointPos = viewer.viewport.viewportToImageCoordinates(viewportPos);
  
//       drag = {
//         overlayElement: overlayElement, 
//         startPos: viewportPos,
//         startPosImagePoint: imagePointPos,
//         endPosImagePoint: imagePointPos,
//       };
    
//       console.log('press handler', viewportPos);
//     },



//     dragHandler: function(event) {
//       if (!drag) {
//         return;
//       }
      
//       var viewportPos = viewer.viewport.pointFromPixel(event.position);
//       console.log('drag handler', viewportPos)
//       var diffX = viewportPos.x - drag.startPos.x;
//       var diffY = viewportPos.y - drag.startPos.y;
      
//       var location = new OpenSeadragon.Rect(
//         Math.min(drag.startPos.x, drag.startPos.x + diffX), 
//         Math.min(drag.startPos.y, drag.startPos.y + diffY), 
//         Math.abs(diffX), 
//         Math.abs(diffY)
//       );
      
//       viewer.updateOverlay(drag.overlayElement, location);
//     },
//     releaseHandler: function(event) {      
//       var x1 = drag.startPosImagePoint.x;
//       var y1 = drag.startPosImagePoint.y;
//       var x2 = drag.endPosImagePoint.x;
//       var y2 = drag.endPosImagePoint.y;
//       $.post("/add_new_region/", {'sid':slide_id, 'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2}, function(json){
//         console.log("Was successful?: " + json['success']);
//       });

//       drag = null;
//       selectionMode = false;
//       viewer.setMouseNavEnabled(true);

    
//     }
// });


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

      var webPoint = event.position;
      var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
      var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);

      console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());
    },



	releaseHandler: function(event) {


		var x1 = drag.startPosImagePoint.x;
		var y1 = drag.startPosImagePoint.y;
		var x2 = drag.endPosImagePoint.x;
		var y2 = drag.endPosImagePoint.y;


    console.log(x1, y1, x2, y2)
		$.post("/add_new_region/", {'sid':slide_id, 'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2}, function(json){
			console.log("Was successful?: " + json['success']);
		});
		
		// var y = drag.overlayElement.y;
		// var width = drag.overlayElement.width;
       	var height = drag.overlayElement.height;
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

		//   console.log(viewer.getOverlayById("box1"))

	    drag = null;
	    selectionMode = false;
	    viewer.setMouseNavEnabled(true);
	}

});
if (document.getElementById('button')!=null) {
  document.getElementById('button').addEventListener('click', function() {
    selectionMode = true;
    console.log('button pressed');
    viewer.setMouseNavEnabled(false);
  });
}


console.log('exiting label_slide.js');
