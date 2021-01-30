console.log('entering label_region.js');


function currentCellCID(){
	return $('.current_cell')[0].id
}


//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
function updateCellListsAfterLabelChange(new_label) {
	var new_lineage = Cell.getLineage(new_label);
	var cell = $('.highlight');
	var old_lineage = Cell.findLineageFromClass(cell);
	var old_label = Cell.findLabelFromClass(cell);


	if (old_label!=new_label) {
		console.log("label change: ", old_label, new_label);
		cell.removeClass(old_label).addClass(new_label);
		cell_counter.updateCounts(old_label, new_label);
	}

	if (new_lineage!=old_lineage) {
		console.log("linage change: ", old_lineage, new_lineage);
		clonedCell = cell.clone();
		clonedCell.removeClass(old_lineage).addClass(new_lineage);
		cell.remove();
		$("#"+new_lineage+"_cells_inline").prepend(clonedCell);
		cell_counter.updateCounts(old_lineage, new_lineage);
		//console.log("cloned cell: ", clonedCell);
	}
}

function labelCurrentCell(label) {
	console.log('current cell id: ', currentCellCID())
	//Update record
	$.post("/update_cell_class/", {'cid':currentCellCID(), 'cell_label':label}, function(json){
			console.log("Was successful?: " + json['success'], label);
	});

	//Update current cell classification in column2
	$('#currentCellClassification').html("Classification: "+Cell.getClassLabelName(label));
	
	//Update current cell on cell list
	$('#cellClassification_'+currentCellCID()).html("Classification: "+Cell.getClassLabelName(label));
	console.log("New cell classifciation: ", Cell.getClassLabelName(label))

	//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
	updateCellListsAfterLabelChange(label);
	
}


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


function deleteCurrentCell() {
	console.log("entering deleteCurrentCell")
	cell_cid = currentCellCID();
	console.log(cell_cid)
	$.post("/delete_cell/", {'cid':cell_cid}, function(json){
		console.log("Was successful?: " + json['success']);
	});

	
	// // This should return a single cell
	cell = $('.highlight');
	cell_counter.deleteCell(Cell.findLabelFromClass(cell));

	highlight_dot = $('.highlight_dot');

	if (nextCell(1) || nextCell(-1)) {
		cell.remove();
		highlight_dot.remove();
	} else {
		//Reload page now that all cells are gone
		console.log("no cells left");
		$('.highlight').remove();	
		$('.current_cell').remove();	
		$('.highlight_dot').remove();
	}

}


function updateCurrentCellFromDot(dot){
	//console.log("dot", dot);
	cid = dot.attr('id').substr(8)
	//console.log("cid", cid, $("#celllistCID_"+cid))
	updateCurrentCell($("#celllistCID_"+cid))
}


function updateCurrentCell(current_cell){
	console.log("Entering updateCurrentCell");
	console.log("current cell", current_cell, typeof current_cell);
	// Unhighlight all cells in cell list
	$('.highlight').removeClass('highlight');
	$('.highlight_dot').removeClass('highlight_dot').addClass('no_highlight_dot');


	// Clone unhighlighted current cell to put in column2 box
	clonedCell = current_cell.clone();
	
	current_cell_cid = current_cell.attr('id').substr(current_cell.attr('id').lastIndexOf('_')+1);	
	// console.log(current_cell.attr('id'))
	clonedCell.attr('id', 'currentCell_'+current_cell_cid)
	//clonedCell.attr('class', 'current_cell')
	$('.current_cell').remove()
	clonedCell.attr('class', 'current_cell')
	clonedCell.appendTo('#current_cell_column2');


	// Re-highlight current cell
	$("#celllistCID_"+current_cell_cid).addClass('highlight');


	id = '#centroid'+current_cell_cid;
	console.log("centroid: ", id);
	$(id).removeClass('no_highlight_dot').addClass('highlight_dot');
	console.log($(id));
	cell_counter.updateCountsOnPage();
}


// Returns true of successful, otherwise returns false
function getNextCell(cell, offset) {


	console.log("entering getNextCell");
	console.log("offset", offset);
	console.log("cell", cell);
	if (offset !=1 && offset != -1){
		console.log("Error in getNextCell(offset)");
		return false;
	}
	if (cell.length  != 1) {
		console.log("error in nextCell - number of highlighted cells returned not 1", cell.length, cell);
		return false;
	} 

	if (cell.siblings.length == 0) {
		console.log("cell has no siblings")
		return false;
	}

	if (offset == 1 && cell.next().length ==1) {
			current_cell = cell.next();
			updateCurrentCell(current_cell);
			return true;
	}

	if (offset == -1 && cell.prev().length ==1) {
			current_cell = cell.prev();
			updateCurrentCell(current_cell);
			return true;
	}

	// if (offset == 1 && cell.next().length == 0) {
	// 	return false;
	// //	nextRegion(1);
	// }

	// if (offset == -1 && cell.prev().length == 0) {
	// 	return false;
	// //	nextRegion(-1);
	// }




	// 	// console.log('getNextCell offset==1');
	// 	// console.log($(cell).next())
	// 	if (cell.next().length ==1) {
	// 		// console.log('getNextCell');
	// 		current_cell = cell.next();
	// 		return current_cell;
	// 	} else if (cell.next().length == 0) {
	// 		console.log("getNextCell->nextRegion")
	// 		nextRegion(1);
	// 	} else { 
	// 		console.log("error in getNextCell offset==1"); 
	// 	}
	// } else if (offset == -1) {
	// 	if (cell.prev().length ==1) {
	// 		current_cell = cell.prev();
	// 		return current_cell;
	// 	} else if (cell.next.length = 0) {
	// 		nextRegion(-1);
	// 	}
	// } else{
	// 	console.log("Error - offset is not appropriate number %s" %offset);
	// 	return null;
	// }
	console.log("Unknown error in getNextCell");
	return false;
}


// Offset for now should be +1 or -1
function nextCell(offset) {
	if (offset !=1 && offset != -1){
		console.log("Error in nextCell(offset)")
	}
	cell = $('.highlight');
	success = getNextCell(cell, offset);
	return success;
}


function addKeyboardEventListeners() {
	console.log('adding keyboard event listeners');
	window.addEventListener('keyup', (e) => {
		code = e.code;
		document.getElementById('test_keyboard').innerHTML = 'code = ' + code;

		console.log(typeof code, code)
		switch(code) {
			case "Digit1": labelCurrentCell('M1'); break;
			case "Digit2": labelCurrentCell('M2'); break;
			case "Digit3": labelCurrentCell('M3'); break;
			case "Digit4": labelCurrentCell('M4'); break;
			case "Digit5": labelCurrentCell('M5'); break;
			case "Digit6": labelCurrentCell('M6'); break;

			case "KeyQ": labelCurrentCell('E1'); break;
			case "KeyW": labelCurrentCell('E2'); break;
			case "KeyE": labelCurrentCell('B1'); break;
			case "KeyR": labelCurrentCell('B2'); break;
			case "KeyT": labelCurrentCell('MO1'); break;
			case "KeyY": labelCurrentCell('MO2'); break;

			case "KeyA": labelCurrentCell('L0'); break;
			case "KeyS": labelCurrentCell('L1'); break;
			case "KeyD": labelCurrentCell('L2'); break;
			case "KeyF": labelCurrentCell('L3'); break;
			case "KeyG": labelCurrentCell('L4'); break;

			case "KeyZ": labelCurrentCell('ER1'); break;
			case "KeyX": labelCurrentCell('ER2'); break;
			case "KeyC": labelCurrentCell('ER3'); break;
			case "KeyV": labelCurrentCell('ER4'); break;
			case "KeyB": labelCurrentCell('ER5'); break;
			case "KeyN": labelCurrentCell('ER6'); break;

			case "Digit7": labelCurrentCell('U1'); break;
			case "Digit8": labelCurrentCell('U2'); break;
			case "Digit9": labelCurrentCell('U3'); break;
			case "Digit0": labelCurrentCell('U4'); break;

			case "ArrowLeft": nextCell(-1);  break;
			case "ArrowRight": nextCell(1); break;
			case "Enter": nextRegion(); break;
			case "Backspace": deleteCurrentCell();break;
			case "Backslash": deleteCurrentCell();break;

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
	// console.log("Entering addCellCentroids")
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
	$( ".column1" ).append ($(newDiv1));
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
function populateCellLists(cells) {
	console.log("Entering populateCellLists: ", cells);

	for (key in cells) {
		cell = cells[key];
		//console.log("key, value:", key, cell);
		//cell_div = getDivFromCellObject(cell);
		cell_div = cell.getDivForCellList();
		//$("#all_cells_inline").append(cell_div);
		$("#"+cell.getLineage()+"_cells_inline").append(cell_div);
	}

}

function LoadCellsFromJson(cells_json){
//	var cells_json_reformat = $.parseJSON(cells_json);
	var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));

	var all_cells = {};
	for (c of cells_json_reformat){
//		console.log('c=', c);
		cell = new Cell(c);
		all_cells[cell.cid] = cell;
//		console.log("new cell class", cell);
	}
//	console.log(all_cells);
	return all_cells;
}


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

$ (document).ready(function() {

 	console.log("ready");
 	//$('#helpscreen').hide();

	elements = document.getElementsByClassName('cell_type');

	for (e of elements) {
		e.textContent = Cell.getClassLabelName(e.textContent);
	}
	console.log("cells_json:", cells_json);

	all_cells = LoadCellsFromJson(cells_json);
//	console.log("all cells:", all_cells);
	populateCellLists(all_cells);
	cell_counter = new CellCounter(all_cells);

	var cells = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
	addCellCentroids(cells);

	addKeyboardEventListeners();
	addMouseEventListeners();
	//Select a cell to annotate by clicking
	
	//Set the initial current cell
	updateCurrentCell($('#'+currentCellCID()+'.current_cell'));

});

