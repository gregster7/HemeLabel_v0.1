//adapted from: https://stackoverflow.com/questions/17408010/drawing-a-rectangle-using-click-mouse-move-and-click
// https://jsfiddle.net/d9BPz/546/
var off = true;


class RegionAnnotator {

	// constructor() {	
	// 	console.log("constructing Region Annotator");
	// 	RegionAnnotator.addKeyboardEventListeners();
	// }

	static toggleSelectMode () {
		if ($('#new_cell_select')[0].checked == false) {
			$('#new_cell_select')[0].checked = true;
			RegionAnnotator.drawRectangle($('.region_surface')[0]);
		}
		else {
			$('#new_cell_select')[0].checked = false;
			var clone = $('.region_surface').clone();
			$('.region_surface').replaceWith(clone);
		}
	}


	static addKeyboardEventListeners () {
		window.addEventListener('keydown', (e) => {
			var code = e.code;
			console.log('keydown',typeof code, code);
			if (code == 'KeyM') {
				RegionAnnotator.toggleSelectMode();
				console.log('toggleselectmode')
			}
		});
	}


	static drawRectangle (canvas) {

		function addMouseEventListeners (element){
			console.log("region annotator addMouseEventListeners");
			console.log(element, typeof(element));
			$(element).on('click', function() {
			 	console.log("this rectangle was clicked on", $(this));
			 	this.rectangle_clicked = true;
					// 	Cell.updateCurrentCellFromDot($(this))
			});
			console.log(element, typeof(element));
		}

		function addResizeListeners (element){
			console.log("resizing", element);
		}

	    function setMousePosition(e) {
	        var ev = e || window.event; //Moz || IE
	        if (ev.pageX) { //Moz
	            mouse.x = ev.pageX + window.pageXOffset;
	            mouse.y = ev.pageY + window.pageYOffset;
	        } else if (ev.clientX) { //IE
	            mouse.x = ev.clientX + document.body.scrollLeft;
	            mouse.y = ev.clientY + document.body.scrollTop;
	        }
	    };

	    var mouse = {
	        x: 0,
	        y: 0,
	        startX: 0,
	        startY: 0
	    };
	    var element = null;

	    canvas.onmousemove = function (e) {
	        setMousePosition(e);
	        var x = mouse.x-$('.region_surface').position().left-window.scrollX;
	        var y = mouse.y-$('.region_surface').position().top-window.scrollY;
	        // var y = mouse.y-$('.region_surface').position().top-window.scrollY-$('.region_surface').innerHeight();
	        if (element !== null) {
	            element.style.width = Math.abs(x - mouse.startX) + 'px';
	            element.style.height = Math.abs(y - mouse.startY) + 'px';
	            element.style.left = (x - mouse.startX < 0) ? x + 'px' : mouse.startX + 'px';
	            element.style.top = (y - mouse.startY < 0) ? y + 'px' : mouse.startY + 'px';
	        }
	    }

	    canvas.onclick = function (e) {
	    	console.log("onclick this", this)
	        console.log('scroll', mouse.y, $('.region_surface').position().top, window.scrollY);
	    	if (this.rectangle_clicked == true) {
	    		console.log('rectangle clicked');
	    		this.rectangle_clicked == false;
	    		return;
	    	}
	        if (element !== null) {
	            element = null;
	            canvas.style.cursor = "default";
	            console.log("finished.");
	        } else {
		        var x = mouse.x-$('.region_surface').position().left-window.scrollX;
		        var y = mouse.y-$('.region_surface').position().top-window.scrollY;
		        // var y = mouse.y-$('.region_surface').position().top-window.scrollY-$('.region_surface').innerHeight();
	            console.log("begun.");
	            console.log(mouse)
	            mouse.startX = x;
	            mouse.startY = y;
	            element = document.createElement('div');
	            element.addEventListener('click', addMouseEventListeners(element));
	            element.addEventListener("resize", addResizeListeners(element)); 
	            //element.className = 'resizable draggable rectangle'
	            element.style.left = x + 'px';
	            element.style.top = y + 'px';
	            canvas.style.cursor = "crosshair";

	            //jQuery UI functions
	            // $( element ).resizable( {
	            // 	autoHide: true,
		           //  containment: "parent",
		           //  ghost: true
	            // });
	            //$(element).addClass('draggable')
	            // $(element).draggable({
	            // 	containment: "parent"
	            // });
				// $(element).css("position", "absolute");
				// $(element).css("resize", "both");
				// $(element).css("draggable", "both");
				$(element).addClass('rectangle')
				Cell.createCellInDatabase(cell_counter, rid, left, top, width, height);

	            canvas.appendChild(element)

	        }
	    }
	}
}



function handleMouseMove(event) {
    var eventDoc, doc, body;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Use event.pageX / event.pageY here
    $('#x_cursor').html(event.pageX);
    $('#y_cursor').html(event.pageY);

}
 
document.addEventListener('mousemove', handleMouseMove);


$ (document).ready(function() {
	console.log('entering region_annotator.js');
	var all_cells = Cell.LoadCellsFromJson(cells_json);


	if (all_cells.length != []){
		var cells = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
		addCellCentroids(cells);
	}

	RegionAnnotator.addKeyboardEventListeners();

	$('#new_cell_select').prop('checked', false);
	// $('#new_cell_select').on('click',function() {
	// 	toggleSelectMode(this, region_annotator);
	// });
	$('#new_cell_select').on('click',function() {
		RegionAnnotator.toggleSelectMode();
	});

});

	// $( function() {
 //    	$( "#draggable" ).draggable();
	//   } );
//	region_annotator.initDraw($('.region_surface')[0]);
//	console.log("region_surface position:", $('.region_surface').position());

	// $('.rectangle').on('click', function() {
	// 	console.log("this rectangle was clicked on", $(this))
	// 	Cell.updateCurrentCellFromDot($(this))
	// });
