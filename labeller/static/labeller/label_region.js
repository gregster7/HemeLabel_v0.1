console.log('entering label_region.js');

var classLabelDict = {
			"M1": "Blast",
			"M2": "Myelocyte",
			"M3": "Promyelocyte",
			"M4": "Metamyelocyte",
			"M5": "Band neutrophil",
			"M6": "Segmented netrophil",

			"E1": "Immature Eosinophil",
			"E2": "Mature Eosinophil",
			"B1": "Immature Basophil",
			"B2": "Mature Basophil",
			"MO1": "Monoblast",
			"MO2": "Monocyte",

			"L0": "Lymphoblast",
			"L1": "Hematagone",
			"L2": "Small Mature Lymphocyte",
			"L3": "Large Grancular lymphocyte",
			"L4": "Plasma Cell",

			"ER1": "Pronormoblast",
			"ER2": "Basophilic normoblast",
			"ER3": "Polychromatophilic",
			"ER4": "Orthochromic (nuc red)",
			"ER5": "Reticulocyte",
			"ER6": "Mature RBC",

			"U1": "Artifact",
			"U2": "Unknown",
			"U3": "Other",
			"U4": "Histiocyte",
			"UL": "Unlabelled", };

// var lineage_labels = ['neutrophilic', 'granulocytic', 'unlabelled', 'lymphoid', 'misc', 'erythroid'];
var lineage_labels = [ 'unlabelled', 'myeloid','erythroid', 'lymphoid', 'misc'];

class CellCounter {

	constructor(cells) {
		this.count = {}
		this.count['total'] = 0;
		for (key in classLabelDict) { this.count[key] = 0;}
		for (var i=0; i<lineage_labels.length; i++) { this.count[lineage_labels[i]] = 0;}
		for (key in cells) {
			cell = cells[key];
			this.count[cell.cell_type] += 1;
			this.count[cell.lineage] += 1;
			this.count['total'] += 1;
		}
	//		for (key in this.count) {console.log(key, this.count[key]);}
		this.buildPageCounter();

		this.updateCountsOnPage();
	

	}

	buildPageCounter(){
		var lineage_divs = {};
		for (var i=0; i<lineage_labels.length; i++) { 
			var new_div="<H3 class='counter header' id='" + lineage_labels[i]+"'>"+ lineage_labels[i]+ ":</H3>";
			lineage_divs[lineage_labels[i]] = new_div;  
		}
		// for (key in classLabelDict) {
		// 	lineage_divs[Cell.getLineage(key)] += "<TR class='counter row' id='"+key+"'>"+ classLabelDict[key]+"</TR>";
		// }
		$('#counter').append("<H3 class='counter header' id='total'>Total:</H3>");
		for (key in lineage_divs) {
			console.log("buildpagecounter", key, lineage_divs[key]);
			$("#counter").append($(lineage_divs[key]));
		}

	}

	static replaceOldCountWithNewCount(jquery_selector, count) {
		if ($(jquery_selector).length){
			var old_count = $(jquery_selector).html();
			var new_count = old_count.substring(0, old_count.indexOf(":")+1) +" " + count;
			$(jquery_selector).html(new_count);
		}
		else {
			console.log("replaceOldCountWithNewCount query selector returned nothing", jquery_selector);
		}
	}

	updateMERatio() {
		var ME_ratio = ""
		if (this.count['erythroid']==0) {
			ME_ratio = "n/a";
		} else {
			ME_ratio = (this.count['myeloid']/this.count['erythroid']).toFixed(2);
		}
		// console.log("M/E ratio: ", ME_ratio);
		$('#ME_ratio').html("M/E Ratio: "+ME_ratio)
	}

	updateCountsOnPage(){
		var sum = 0;
		for (var key in lineage_labels){
			CellCounter.replaceOldCountWithNewCount("#"+lineage_labels[key]+".counter", this.count[lineage_labels[key]])
			sum +=this.count[lineage_labels[key]];
		}
		CellCounter.replaceOldCountWithNewCount("#total.counter", sum);
		this.updateMERatio();

		for (var key in classLabelDict) {
			CellCounter.replaceOldCountWithNewCount("#count_"+key, this.count[key]);
			// var div = $("#count_"+key);
			// console.log("key is ", key, div);	
		}
	} 


}


//Convert json cell to javascript cell
class Cell {
	constructor(cell) {
		this.cid = cell.fields.cid;
		this.x = cell.fields.center_x;
		this.y = cell.fields.center_y;
		this.image_url = cell.fields.image;
		this.cell_type = cell.fields.cell_type;
//		this.cellTypeName = Cell.getClassLabelName[this.cell_type];
		this.pk = cell.pk;
		this.height = cell.fields.height;
		this.width = cell.fields.width;
		this.region = cell.fields.region;
		this.lineage = Cell.getLineage(this.cell_type);
		this.htmlClasses = 'cell ' + this.cid + ' ' + this.cell_type + ' ' + this.pk + ' ' +this.lineage;
		//console.log("constructing cell: ", this);
	}

	getCellTypeName = function (){
		return Cell.getClassLabelName(this.cell_type);
	}

	static getLineage = function (cell_type) {
		//cell_type = this.cell_type;
		if (cell_type == 'M1' || cell_type == 'M2' || cell_type == 'M3' || cell_type == 'M4' || cell_type == 'M5' || cell_type == 'M6'){
			//return 'neutrophilic';
			return 'myeloid';
		}
		if (cell_type == 'E1' || cell_type == 'E2' || cell_type == 'B1' || cell_type == 'B2' || cell_type == 'MO1' || cell_type == 'MO2'){
			//return 'granulocytic';
			return 'myeloid';
		}
		if (cell_type == 'ER1' || cell_type == 'ER2' || cell_type == 'ER3' || cell_type == 'ER4' || cell_type == 'ER5' || cell_type == 'ER6'){
			return 'erythroid';
		}
		if (cell_type == 'L0' || cell_type == 'L1' || cell_type == 'L2' || cell_type == 'L3' || cell_type == 'L4'){
			return 'lymphoid';
		}
		if (cell_type == 'U1' || cell_type == 'U2' || cell_type == 'U3' || cell_type == 'U4'){
			return 'misc';
		}
		if (cell_type == 'UL'){
			return 'unlabelled';
		};
		console.log("error in getLineage for cell_type", cell_type);
	}
	
	static getClassLabelName = function (cell_type) {
		console.log("getClassLabelName", cell_type);
		var classLabelDict = {
			"M1": "Blast",
			"M2": "Myelocyte",
			"M3": "Promyelocyte",
			"M4": "Metamyelocyte",
			"M5": "Band neutrophil",
			"M6": "Segmented netrophil",

			"E1": "Immature Eosinophil",
			"E2": "Mature Eosinophil",
			"B1": "Immature Basophil",
			"B2": "Mature Basophil",
			"MO1": "Monoblast",
			"MO2": "Monocyte",

			"L0": "Lymphoblast",
			"L1": "Hematagone",
			"L2": "Small Mature Lymphocyte",
			"L3": "Large Grancular lymphocyte",
			"L4": "Plasma Cell",

			"ER1": "Pronormoblast",
			"ER2": "Basophilic normoblast",
			"ER3": "Polychromatophilic",
			"ER4": "Orthochromic (nuc red)",
			"ER5": "Reticulocyte",
			"ER6": "Mature RBC",

			"U1": "Artifact",
			"U2": "Unknown",
			"U3": "Other",
			"U4": "Histiocyte",
			"UL": "Unlabelled",
		};
		console.log("getClassLabelName", cell_type, classLabelDict[cell_type], classLabelDict);

		return classLabelDict[cell_type];

	}



	getDivForCellList(){
//		console.log("Entering getDivForCellList", this);
		var div = '<div class="cell_list_item '+this.htmlClasses+'" id="celllistCID_' + this.cid+'">';
		div = div +	'<p><img class="center" id="cellImage" src="'+this.image_url+'"></p>';
		div = div + '<p class="center" id="cellId_'+ this.cid+'">Cell ID: '+ this.cid +'</p>';
		div = div + '<p class="center cell_type" id="cellClass_'+ this.cid+'">'+this.getCellTypeName()+'</p></div>';
//		console.log("div is: ", div)
		return div;
	}


}

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}


function currentCellCID(){
	return $('.current_cell')[0].id
}

function labelCurrentCell(label) {
	console.log('current cell id: ', currentCellCID())
	//Update record
	$.post("/update_cell_class/", {'cid':currentCellCID(), 'cell_label':label}, function(json){
			console.log("Was successful?: " + json['success']);
	});

	//Update current cell classification in column2
	$('#currentCellClassification').html("Classification: "+cellClassNameFromCode(label));
	//Update current cell on cell list
	$('#cellClassification_'+currentCellCID()).html("Classification: "+cellClassNameFromCode(label));
	console.log("New cell classifciation: ", cellClassNameFromCode(label))

}

function getKeyByValue(object, value) {
 	return Object.keys(object).find(key => object[key] === value);
}


function cellClassNameFromCode(cell_code) {
	return Cell.getClassLabelName(cell_code);
}

// function cellClassCodeFromName(cell_name) {
// 	return getKeyByValue(Cell.classLabelDict, cell_name)
// }

//offset should be +1 or -1
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
	
	// Rehighlight current cell
	current_cell.addClass('highlight');

	current_cell_cid = current_cell.attr('id').substr(12);	
	// console.log(current_cell.attr('id'))
	clonedCell.attr('id', current_cell_cid)
	$('.current_cell').remove()
	clonedCell.attr('class', 'current_cell')
	clonedCell.appendTo('#current_cell_column2');

	id = '#centroid'+current_cell_cid;
	console.log("centroid: ", id);
//	$('#centroid01202021190611').addClass('highlight_dot');
	$(id).removeClass('no_highlight_dot').addClass('highlight_dot');
	console.log($(id));
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
	if (cell.length  == 0) {
		console.log("error in nextCell - no highlighted cell returned");
		return false;
	} 
	if (cell.length  > 1) {
		console.log("error in nextCell - too many highlighted cell returned");
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

	if (offset == 1 && cell.next().length == 0) {
		return false;
	//	nextRegion(1);
	}

	if (offset == -1 && cell.prev().length == 0) {
		return false;
	//	nextRegion(-1);
	}




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
	// console.log("nextCell", cell[0], typeof cell[0], typeof cell, typeof offset);
	// console.log(cell.next(), cell.next()[0])
	// current_cell = getNextCell(cell, offset);
	success = getNextCell(cell, offset);
	//console.log('current_cell', current_cell);
//	updateCurrentCell(current_cell);
	return success;
}



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
	}
});


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
	console.log("NewDiv1=", newDiv1, $(newDiv1));
	$( ".column1" ).append ($(newDiv1));
	$("#centroid"+cid).on('click', function() {
		console.log("this dot was clicked on", $(this))
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

			new_cell_div = '<div class="cell_list_item" id="celllistCID_' + cell.fields.cid +'">'
			new_cell_div += '<p><img class="center" id="cellImage" src="' + cell.fields.image + '"></p>'
			new_cell_div += "<p class='center' id='cellId_" + cell.fields.cid + "'>Cell ID: "+cell.fields.cid+"</p>"
			new_cell_div += "<p class='center cell_type' id='cellClassification_" + cell.fields.cid + "'>Classification: " + cellClassNameFromCode(cell.fields.cell_type)+"</p>"

			$('#inline_cells').prepend(
				new_cell_div
			);

			current_cell = $('.cell_list_item#celllistCID_'+ cell.fields.cid);

			console.log(current_cell, typeof current_cell)
			current_cell.on('click', function() {
				updateCurrentCell($(this))
			});

			addNewCircle(X, Y, cell.fields.cid);
			updateCurrentCell(current_cell);
			console.log("x: ", X, "y: ", Y)
 		}
	});
}


// function getDivFromCellObject(cell){
// 	console.log("Entering getDivFromCellObject", cell);
// 	div = '<div class="cell_list_item '+cell.htmlClasses+'" id="celllistCID_' + cell.cid+'">'
// 	div = div +	'<p><img class="center" id="cellImage" src="'+cell.image+'"></p>'
// 	div = div + '<p class="center" id="cellId_'+ cell.cid+'">Cell ID: {{current_cell.cid}}</p>'
// 	div = div + '<p class="center cell_type" id="cellClass_'+ cell.cid+'">'+cell.getCellTypeName()+'</p></div>'
// 	console.log("div is: ", div)
// }


// function getCellDiv(cell, added_classes=""){
// 	div = '<div class="cell_list_item" id="celllistCID_' + cell.fields.cid+'">'
// 	div = div +	'<p><img class="center" id="cellImage" src="'+cell.fields.image+'"></p>'
// 	div = div + '<p class="center" id="cellId_'+ cell.fields.cid+'">Cell ID: {{current_cell.cid}}</p>'
// 	div = div + '<p class="center cell_type" id="cellClass_'+ cell.fields.cid+'">'+getLineage(cell)+'</p></div>'
// 	console.log("div is: ", div)
// }

//Refactored to take all_cells hash array of javascript cell objects instead of JSON list
function populateCellLists(cells) {
	console.log("Entering populateCellLists: ", cells);

	for (key in cells) {
		cell = cells[key];
		console.log("key, value:", key, cell);
		//cell_div = getDivFromCellObject(cell);
		cell_div = cell.getDivForCellList();
		$("#all_cells_inline").append(cell_div);
		$("#"+cell.lineage+"_cells_inline").append(cell_div);
	}

}

function LoadCellsFromJson(cells_json){
	var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
	var all_cells = {};
	for (c of cells_json_reformat){
		cell = new Cell(c);
		all_cells[cell.cid] = cell;
		//console.log("new cell class", cell);
	}
	console.log(all_cells);
	return all_cells;
}


$ (document).ready(function() {
 	console.log("ready");

	elements = document.getElementsByClassName('cell_type');

	for (e of elements) {
		e.textContent = cellClassNameFromCode(e.textContent);
	}

	all_cells = LoadCellsFromJson(cells_json);
	console.log(all_cells);
	populateCellLists(all_cells);
	cell_counter = new CellCounter(all_cells);

	var cells = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
	addCellCentroids(cells);

	//Select a cell to annotate by clicking
	$('.cell_list_item').on('click', function() {
		console.log("this item was clicked on", $(this))
		updateCurrentCell($(this))
	});

	$('.dot').on('click', function() {
		console.log("this dot was clicked on", $(this))
		updateCurrentCellFromDot($(this))
	});

	//Set the initial current cell
	updateCurrentCell($('#celllistCID_'+currentCellCID()));

	$('#regionCanvas').on('click', function(e) {
		console.log("canvas was clicked", $(this))
		createNewCell(this, e)
	});


});

console.log('exiting label_region.js');
