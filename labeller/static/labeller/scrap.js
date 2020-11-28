	// console.log(code)
	// console.log (typeof code)
	// switch (code) {
	// 	case "Digit1": {       
	// 		console.log('1111')
	// 		currentCell = document.getElementById('id_BLAST');
	// 		if (currentCell.checked) {
	// 			currentCell.checked = false;
	// 		} else { currentCell.checked = true;}
	// 	} 
	// 	case "Digit2": {       
	// 		currentCell = document.getElementById('id_MYELOCYTE');
	// 		if (currentCell.checked) {
	// 			currentCell.checked = false;
	// 		} else { currentCell.checked = true;}
	// 	}
	// 	case "Digit3": {       
	// 		currentCell = document.getElementById('id_PROMYELOCYTE');
	// 		if (currentCell.checked) {
	// 			currentCell.checked = false;
	// 		} else { currentCell.checked = true;}
	// 	}
	// 	case "Digit4": {       
	// 		currentCell = document.getElementById('id_METAMYELOCYTE');
	// 		if (currentCell.checked) {
	// 			currentCell.checked = false;
	// 		} else { currentCell.checked = true;}
	// 	}
	// 	case "Digit5": {       
	// 		currentCell = document.getElementById('id_BAND');
	// 		if (currentCell.checked) {
	// 			currentCell.checked = false;
	// 		} else { currentCell.checked = true;}
	// 	}
	// 	case "Digit6": {       
	// 		currentCell = document.getElementById('id_SEG');
	// 		if (currentCell.checked) {
	// 			currentCell.checked = false;
	// 		} else { currentCell.checked = true;}
	// 	}
	// 	default: {
	// 		console.log('default')
	// 		console.log(typeof code)
	// 		console.log(code)

	// 	}
	// }


		// {% for cell in cells %}
		// <div class='current_cell' id="currentcellCID_{{current_cell.cid}}">
		// 	<img class='center' id='currentCellImage' src="{{current_cell.image.url}}">
		// 	<p class='center' id='currentCellId'>Cell ID: {{current_cell.cid}}</p>
		// 	<p class='center' id='currentCellClassification'>Classification: {{current_cell.cell_type}}</p>
		// </div>
		// {% endfor %} 


// <h2>Current Cell</h2>
// <div id='current_cell'>
// 	{% with cells.0 as current_cell %}
// 	<p> <img src="{{current_cell.image.url}}"></p>
// 	<p id='currentCellId'>Cell ID: {{current_cell.cid}}</p>
// 	<p id='currentCellClassification'>Classification: {{current_cell.cell_type}}</p>
// 	{% endwith %}
// </div>


// function cellListItemClicked( cid, cells_json ) {
// 	console.log("entering cellListItemClicked: cell");

// 	var cells = JSON.parse(cells_json);

// 	for (i=0; i<cells.length; i++) {
// 		cell = cells[i].fields
// 		console.log(cell.cid);
// 		console.log(typeof cell.cid);

// 	}

// 	// console.log("entering cellListItemClicked: dicts");
// 	// console.log(cell_dicts);
// 	// for (i=0; i<cell_dicts.length; i++) {
// 	// 	console.log(cell_dicts[i].img)
// 	// }

// };