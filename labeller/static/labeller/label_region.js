console.log('entering label_region.js');


//offset should be +1 or -1 *** not currently implemented ***
function nextRegion(direction) {
	// console.log('Entering Next Region')
	// if (direction != 1 && direction != -1) {
	// 	console.log ("Error in nextRegion offset");
	// 	return
	// }

	// current_region = document.getElementsByClassName('region')[0];
	// rid = current_region.id.substr(1, current_region.length)
	// console.log(rid);
	// console.log(current_region)
	// $.post("/next_region/", {'rid':rid, 'direction':direction}, function(json){
	// 	console.log("Was successful?: " + json['success']);
	// 	console.log('next region:: ' + json['rid']);

	// 	//Reload page with new region
	// 	if (json['success']) {
	// 		current_url = window.location.href;
	// 		current_url=current_url.substr(0, current_url.length-1)
	// 		current_url=current_url.substr(0, current_url.lastIndexOf('/')+1)+json['rid']+'/'
	// 		console.log(current_url);
	// 		window.location.assign(current_url)

	// 	}
	// });
}


function addKeyboardEventListeners() {
	console.log('adding keyboard event listeners');
	window.addEventListener('keyup', (e) => {
		code = e.code;
		document.getElementById('test_keyboard').innerHTML = 'code = ' + code;

		console.log(typeof code, code)
		switch(code) {
			case "Digit1": Cell.labelCurrentCell('M1'); break;
			case "Digit2": Cell.labelCurrentCell('M2'); break;
			case "Digit3": Cell.labelCurrentCell('M3'); break;
			case "Digit4": Cell.labelCurrentCell('M4'); break;
			case "Digit5": Cell.labelCurrentCell('M5'); break;
			case "Digit6": Cell.labelCurrentCell('M6'); break;

			case "KeyQ": Cell.labelCurrentCell('E1'); break;
			case "KeyW": Cell.labelCurrentCell('E2'); break;
			case "KeyE": Cell.labelCurrentCell('B1'); break;
			case "KeyR": Cell.labelCurrentCell('B2'); break;
			case "KeyT": Cell.labelCurrentCell('MO1'); break;
			case "KeyY": Cell.labelCurrentCell('MO2'); break;

			case "KeyA": Cell.labelCurrentCell('L0'); break;
			case "KeyS": Cell.labelCurrentCell('L1'); break;
			case "KeyD": Cell.labelCurrentCell('L2'); break;
			case "KeyF": Cell.labelCurrentCell('L3'); break;
			case "KeyG": Cell.labelCurrentCell('L4'); break;

			case "KeyZ": Cell.labelCurrentCell('ER1'); break;
			case "KeyX": Cell.labelCurrentCell('ER2'); break;
			case "KeyC": Cell.labelCurrentCell('ER3'); break;
			case "KeyV": Cell.labelCurrentCell('ER4'); break;
			case "KeyB": Cell.labelCurrentCell('ER5'); break;
			case "KeyN": Cell.labelCurrentCell('ER6'); break;

			case "Digit7": Cell.labelCurrentCell('U1'); break;
			case "Digit8": Cell.labelCurrentCell('U2'); break;
			case "Digit9": Cell.labelCurrentCell('U3'); break;
			case "Digit0": Cell.labelCurrentCell('U4'); break;

			case "KeyU": Cell.labelCurrentCell('UL'); break;

			case "ArrowLeft": nextCell(-1);  break;
			case "ArrowRight": nextCell(1); break;
			case "Enter": nextRegion(); break;
			case "Backspace": Cell.deleteCurrentCell();break;
			case "Backslash": Cell.deleteCurrentCell();break;

			case "KeyH": helpDisplay(); break;
		}
	});
}

function helpDisplay() {
	console.log("help display", $("#helpscreen"), $("#helpscreen").is(":visible"))
	if ($("#helpscreen").is(":visible")){
		// $("#helpscreen").removeClass("hide");
		$("#helpscreen").fadeOut(500);
	}
	else{
//		$("helpscreen").addClass("hide");
		$("#helpscreen").fadeIn(500);
	}
}

function addCellCentroids(cells) {
	console.log("Entering addCellCentroids")
	// console.log(cells_json);
	// console.log(cells_json.replace(/&quot;/ig,'"'));

	// var cells = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
	for (i=0; i<cells.length; i++) {
	//	console.log(cells[i], cells[i].fields.center_x);
		addNewCircle(cells[i].fields.center_x, cells[i].fields.center_y, cells[i].fields.cid, cells[i].fields.cell_type);
	}
}


function addNewCircle(x, y, cid, cell_type) {
	var newDiv1 = '<span class="dot no_highlight_dot '+cell_type+'" id="centroid'+cid+ '" style=" display: inline-block; ';
	newDiv1 = newDiv1 + 'position: absolute; top: ' + (y-10) +'px; left: ' + (x-10) + 'px; z-index: 100">';				
	newDiv1 = newDiv1 + '</span>';
	//console.log("NewDiv1=", newDiv1, $(newDiv1));
	$( ".region_surface" ).append ($(newDiv1));
	$("#centroid"+cid).on('click', function() {
	//	console.log("this dot was clicked on", $(this))
		updateCurrentCellFromDot($(this))
	});
//	console.log("AddNewCircle", x, y, newDiv1, $(newDiv1))
}


function createNewCell(canvas, e) {
	ctx = canvas.getContext('2d');
	var BB=canvas.getBoundingClientRect();

	var X=e.clientX-BB.left;
	var Y=e.clientY-BB.top;


	$.post("/add_new_cell/", {'rid':region_rid, 'center_x':X, 'center_y':Y}, function(json){
		console.log("Was successful?: " + json['success']);	
 		if (json['success'] == false) {
 			console.log("Error description: " + json['error']);	
 			alert('Warning: Cell too close to boundary')
 		}
 		else if(json['success'] == true) {
		 // 	ctx.beginPath();
	 	// 	var R = 5;
			// ctx.arc(X, Y, R, 0, 2 * Math.PI, false);
			// ctx.lineWidth = 3;
			// ctx.strokeStyle = '#FF0000';
			// ctx.stroke();
			var cell = JSON.parse(json['new_cell_json'])[0];	
			cell = new Cell(cell);
			var new_cell_div = cell.getDivForCellList();
			$('#unlabelled_cells_inline').prepend(new_cell_div);

			current_cell = $('.cell_list_item#celllistCID_'+ cell.cid);
			current_cell.on('click', function() { updateCurrentCell($(this)) });

			addNewCircle(X, Y, cell.cid);
			updateCurrentCell(current_cell);
			cell_counter.addCell(cell.cell_type);

 		}
	});
}


//Refactored to take all_cells hash array of javascript cell objects instead of JSON list
// function populateCellLists(cells) {
// 	console.log("Entering populateCellLists: ", cells);

// 	for (key in cells) {
// 		cell = cells[key];
// 		//console.log("key, value:", key, cell);
// 		//cell_div = getDivFromCellObject(cell);
// 		cell_div = cell.getDivForCellList();
// 		//$("#all_cells_inline").append(cell_div);
// 		$("#"+cell.getLineage()+"_cells_inline").append(cell_div);
// 	}

// }




function addMouseEventListeners(){
	console.log("adding mouse event listeners");
	$('.cell_list_item').on('click', function() {
		console.log("this item was clicked on", $(this))
		updateCurrentCell($(this))
	});

	$('.dot').on('click', function() {
		console.log("this dot was clicked on", $(this))
		updateCurrentCellFromDot($(this))
	});
	$('#regionCanvas').on('click', function(e) {
		console.log("canvas was clicked", $(this))
		createNewCell(this, e)
	});
	$('#helpscreen').click(function() { 
        $(this).fadeOut(500);
    });
}

var cell_counter = {};
var all_cells = {};
// current_cell = 

$ (document).ready(function() {

 	console.log("ready");
 	//$('#helpscreen').hide();

	console.log("cells_json:", cells_json);

	all_cells = Cell.LoadCellsFromJson(cells_json);
	console.log("all cells:", all_cells);
	//Cell.populateCellLists(all_cells);
	cell_counter = new CellCounter(all_cells);

	if (all_cells.length != []){
//		Cell.populateCellLists(all_cells);
		// var cells = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
		// addCellCentroids(cells);
		//Set the initial current cell
		updateCurrentCell($('#currentCell_'+Cell.currentCellCID()+'.current_cell'));
	}

	addKeyboardEventListeners();
	addMouseEventListeners();
	
	

});

