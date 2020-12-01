console.log('entering testing.js');

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

function nextCell(offset) {
	cellListItems = document.getElementsByClassName('cell_list_item');
	for (i=0; i<cellListItems.length; i++) {

		//'highlight indicates it is the current cell'
		if (cellListItems[i].classList.contains('highlight')) {

			//calculate position of next cell using modulo (since can take positive or negative)
			new_position = (i+offset+cellListItems.length)%cellListItems.length

			//make it the new current cell
			updateCurrentCell(cellListItems[new_position]);
			break;
		}
	}	
}

// function nextRegion(){
// 	$.post("")
// }

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

		case "KeyZ": labelCurrentCell('E1'); break;
		case "KeyX": labelCurrentCell('E2'); break;
		case "KeyC": labelCurrentCell('E3'); break;
		case "KeyV": labelCurrentCell('E4'); break;
		case "KeyB": labelCurrentCell('E5'); break;
		case "KeyN": labelCurrentCell('E6'); break;

		case "Digit7": labelCurrentCell('U1'); break;
		case "Digit8": labelCurrentCell('U2'); break;
		case "Digit9": labelCurrentCell('U3'); break;
		case "Digit0": labelCurrentCell('U4'); break;

		case "ArrowLeft": nextCell(-1);  break;
		case "ArrowRight": nextCell(1); break;
		case "Enter": nextRegion(); break;
	}
});

//Set the initial current cell
$('#celllistCID_'+currentCellCID()).addClass('highlight')

//Pass in cell_list_item objects
function updateCurrentCell (cell) {
	//console.log('updating current cell: ', typeof cell, cell)
	//Cells should always  have id cellListCID_{{cid}}
	current_cell_cid = cell.id.substr(12);	

	// Unhighlight all cells in cell list
	$('.highlight').removeClass('highlight');

	//Clone cell and prepare for column2 
	clonedCell = $(cell).clone();
	clonedCell.attr('id', current_cell_cid)
	clonedCell.attr('class', 'current_cell')

	// Replace current cell in column two with new cell clone
	$('.current_cell').remove()
	clonedCell.appendTo('.column2');

	//Highlight new current cell in list
	$(cell).addClass('highlight');
}

//Select a cell to annotate by clicking
$('.cell_list_item').on('click', function() {
	updateCurrentCell(this)
});

$ (document).ready(function() {
 	console.log("ready");
 });

console.log('exiting testing.js');
