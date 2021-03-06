console.log('entering horizontal_cells.js');




$ (document).ready(function() {

 	console.log("ready");
	all_cells = Cell.LoadCellsFromJson(cells_json);
	if (all_cells != []){
		Cell.populateCellLists(all_cells);
	}

	elements = document.getElementsByClassName('cell_type');

	for (e of elements) {
//		console.log(e, e.textContent, Cell.getClassLabelName(e.textContent));
		e.textContent = Cell.getClassLabelName(e.textContent);
	}

	$('.cell_list_item').on('click', function() {
		console.log("this item was clicked on", $(this))
		Cell.updateCurrentCell($(this), region_id)
	});


//	add_main_lineages_horizontal_keyboard_listeners();
});