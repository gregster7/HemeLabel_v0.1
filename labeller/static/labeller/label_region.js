console.log('entering label_region.js');

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
	$('#currentCellClassification').html("Classification: "+label);
	//Update current cell on cell list
	$('#cellClassification_'+currentCellCID()).html("Classification: "+label);

}

function getKeyByValue(object, value) {
 	return Object.keys(object).find(key => object[key] === value);
}

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
	"M1": "Monoblast",
	"M2": "Monocyte",

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

function cellClassNameFromCode(cell_code) {
	return classLabelDict[cell_code]
}

function cellClassCodeFromName(cell_name) {
	return getKeyByValue(classLabelDict, cell_name)
}


//offset should be +1 or -1
function nextRegion(direction) {
	console.log('Entering Next Region')
	if (direction != 1 && direction != -1) {
		console.log ("Error in nextRegion offset");
		return
	}

	current_region = document.getElementsByClassName('region')[0];
	rid = current_region.id.substr(1, current_region.length)
	console.log(rid);
	console.log(current_region)
	$.post("/next_region/", {'rid':rid, 'direction':direction}, function(json){
		console.log("Was successful?: " + json['success']);
		console.log('next region:: ' + json['rid']);

		//Reload page with new region
		if (json['success']) {
			current_url = window.location.href;
			current_url=current_url.substr(0, current_url.length-1)
			current_url=current_url.substr(0, current_url.lastIndexOf('/')+1)+json['rid']+'/'
			console.log(current_url);
			window.location.assign(current_url)

		}
	});
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
	if (cell.length  != 1) {
		console.log("error in deleteCurrentCell - more than one highlighted cell returned");
		return;
	}

	if (nextCell(1) || nextCell(-1)) {
		cell.remove();
		return;
	} else {
		//Reload page now that all cells are gone
		console.log("no cells left");
		noCellsLeft();
	}

}

function noCellsLeft(){
	cell = $('.highlight');	
	cell.remove();
	cell = $('.current_cell');	
	cell.remove();	
}

function updateCurrentCell(current_cell){
	console.log("Entering updateCurrentCell");
	console.log("current cell", current_cell, typeof current_cell);
	// Unhighlight all cells in cell list
	$('.highlight').removeClass('highlight');

	// Clone unhighlighted current cell to put in column2 box
	clonedCell = current_cell.clone();
	
	// Rehighlight current cell
	current_cell.addClass('highlight');

	current_cell_cid = current_cell.attr('id').substr(12);	
	// console.log(current_cell.attr('id'))
	clonedCell.attr('id', current_cell_cid)
	$('.current_cell').remove()
	clonedCell.attr('class', 'current_cell')
	clonedCell.appendTo('.column2');
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
		case "KeyT": labelCurrentCell('M1'); break;
		case "KeyY": labelCurrentCell('M2'); break;

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

//Set the initial current cell
$('#celllistCID_'+currentCellCID()).addClass('highlight')


$('#regionCanvas').on('click', function(e) {
	// console.log('clicked');
	// console.log(e)
	// console.log(e.clientX)
	// console.log($(this).offset().left)
//	console.log("x: ", e.clientX-$(this).offset().left, "y: ", e.clientY-$(this).offset().top)
	ctx = this.getContext('2d');

	var BB=this.getBoundingClientRect();

	var X=e.clientX-BB.left;
	var Y=e.clientY-BB.top;
	console.log("x: ", X, "y: ", Y)
	var R = 5;


	$.post("/add_new_cell/", {'rid':region_rid, 'center_x':X, 'center_y':Y}, function(json){
		console.log("Was successful?: " + json['success']);	
 		if (json['success'] == false) {
 			console.log("Error description: " + json['error']);	
 			alert('Warning: Cell too close to boundary')
 		}
 		else if(json['success'] == true) {
		 	ctx.beginPath();
			ctx.arc(X, Y, R, 0, 2 * Math.PI, false);
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#FF0000';
			ctx.stroke();
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

			updateCurrentCell(current_cell);
 		}

	});


});


//Select a cell to annotate by clicking
$('.cell_list_item').on('click', function() {
	console.log("this item was clicked on", $(this))
	updateCurrentCell($(this))
});

$ (document).ready(function() {
 	console.log("ready");
 	// window.addEventListener('mousemove', function(e) {
 	// 	//console.log(e);
 	// });
 	var c = $("#regionCanvas"), 
	 	ctx = c[0].getContext('2d');

	img= document.getElementById("region_image")
	console.log('canvas drawing', img, img.height, img.width)
	ctx.drawImage(img, 0, 0)

	$('p.region').remove()

//	cell_classifications = $('.cell_type').text(this);

	elements = document.getElementsByClassName('cell_type');
	for (e of elements) {
		e.textContent = cellClassNameFromCode(e.textContent);
	}

 });

console.log('exiting label_region.js');
