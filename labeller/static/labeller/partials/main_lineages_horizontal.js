console.log('entering horizontal_cells.js');

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
	console.log('current cell id: ', Cell.currentCellCID())
	//Update record
	$.post("/update_cell_class/", {'cid':Cell.currentCellCID(), 'cell_label':label}, function(json){
			console.log("Was successful?: " + json['success'], label);
	});

	console.log("all cells", all_cells);
	console.log("label", label);
	console.log("label2", Cell.getClassLabelName(label))

//	#Need to update 

	//Update current cell classification in column2
	$('#currentCellClassification').html("Classification: "+Cell.getClassLabelName(label));
	
	//Update current cell on cell list
	$('#cellClass_'+Cell.currentCellCID()).html(Cell.getClassLabelName(label));
	console.log("New cell classification: ", Cell.getClassLabelName(label))

	//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
	updateCellListsAfterLabelChange(label);
	
}


$ (document).ready(function() {

 	console.log("ready");
	all_cells = Cell.LoadCellsFromJson(cells_json);
	if (all_cells != []){
		Cell.populateCellLists(all_cells);
	}

	elements = document.getElementsByClassName('cell_type');

	for (e of elements) {
		console.log(e, e.textContent, Cell.getClassLabelName(e.textContent));
		e.textContent = Cell.getClassLabelName(e.textContent);
	}

//	add_main_lineages_horizontal_keyboard_listeners();
});