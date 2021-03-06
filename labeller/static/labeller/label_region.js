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


// function addKeyboardEventListeners(cell_counter) {
// 	console.log('adding keyboard event listeners');
// 	window.addEventListener('keyup', (e) => {
// 		code = e.code;
// 		document.getElementById('test_keyboard').innerHTML = 'code = ' + code;

// 		console.log(typeof code, code)
// 		switch(code) {
// 			case "Digit1": Cell.labelCurrentCell('M1', cell_counter); break;
// 			case "Digit2": Cell.labelCurrentCell('M2', cell_counter); break;
// 			case "Digit3": Cell.labelCurrentCell('M3', cell_counter); break;
// 			case "Digit4": Cell.labelCurrentCell('M4', cell_counter); break;
// 			case "Digit5": Cell.labelCurrentCell('M5', cell_counter); break;
// 			case "Digit6": Cell.labelCurrentCell('M6', cell_counter); break;

// 			case "KeyQ": Cell.labelCurrentCell('E1', cell_counter); break;
// 			case "KeyW": Cell.labelCurrentCell('E2', cell_counter); break;
// 			case "KeyE": Cell.labelCurrentCell('B1', cell_counter); break;
// 			case "KeyR": Cell.labelCurrentCell('B2', cell_counter); break;
// 			case "KeyT": Cell.labelCurrentCell('MO1', cell_counter); break;
// 			case "KeyY": Cell.labelCurrentCell('MO2', cell_counter); break;

// 			case "KeyA": Cell.labelCurrentCell('L0', cell_counter); break;
// 			case "KeyS": Cell.labelCurrentCell('L1', cell_counter); break;
// 			case "KeyD": Cell.labelCurrentCell('L2', cell_counter); break;
// 			case "KeyF": Cell.labelCurrentCell('L3', cell_counter); break;
// 			case "KeyG": Cell.labelCurrentCell('L4', cell_counter); break;

// 			case "KeyZ": Cell.labelCurrentCell('ER1', cell_counter); break;
// 			case "KeyX": Cell.labelCurrentCell('ER2', cell_counter); break;
// 			case "KeyC": Cell.labelCurrentCell('ER3', cell_counter); break;
// 			case "KeyV": Cell.labelCurrentCell('ER4', cell_counter); break;
// 			case "KeyB": Cell.labelCurrentCell('ER5', cell_counter); break;
// 			case "KeyN": Cell.labelCurrentCell('ER6', cell_counter); break;

// 			case "Digit7": Cell.labelCurrentCell('U1', cell_counter); break;
// 			case "Digit8": Cell.labelCurrentCell('U2', cell_counter); break;
// 			case "Digit9": Cell.labelCurrentCell('U3', cell_counter); break;
// 			case "Digit0": Cell.labelCurrentCell('U4', cell_counter); break;

// 			case "KeyU": Cell.labelCurrentCell('UL', cell_counter); break;

// 			case "ArrowLeft": Cell.nextCell(-1);  break;
// 			case "ArrowRight": Cell.nextCell(1); break;
// 			case "Enter": nextRegion(); break;
// 			case "Backspace": Cell.deleteCurrentCell(cell_counter);break;
// 			case "Backslash": Cell.deleteCurrentCell(cell_counter);break;

// 			//case "KeyH": HelpDisplay.toggle();  break;
// 		}
// 	});
// }






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
			current_cell.on('click', function() { Cell.updateCurrentCell($(this)) });

			addNewCircle(X, Y, cell.cid);
			Cell.updateCurrentCell(current_cell);
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




// function addMouseEventListeners(){
// 	console.log("adding mouse event listeners");
// 	$('.cell_list_item').on('click', function() {
// 		console.log("this item was clicked on", $(this))
// 		Cell.updateCurrentCell($(this))
// 	});

// 	$('.dot').on('click', function() {
// 		console.log("this dot was clicked on", $(this))
// 		Cell.updateCurrentCellFromDot($(this))
// 	});
// 	// $('.regionCanvas').on('click', function(e) {
// 	// 	console.log("canvas was clicked", $(this))
// 	// 	createNewCell(this, e)
// 	// });
// 	// $('#helpscreen').click(function() { 
//  //        $(this).fadeOut(500);
//  //    });
// }

// var cell_counter = {};
// var all_cells = {};
// current_cell = 

$ (document).ready(function() {

 	console.log("ready");
 	//$('#helpscreen').hide();

//	console.log("cells_json:", cells_json);

// 	all_cells = Cell.LoadCellsFromJson(cells_json);
// 	cell_counter = new CellCounter(all_cells);

// //	console.log("all cells:", all_cells);
// 	//Cell.populateCellLists(all_cells);

// 	if (all_cells.length != []){
// 		Cell.updateCurrentCell($('#currentCell_'+Cell.currentCellCID()+'.current_cell'));
// 	}

	
});

