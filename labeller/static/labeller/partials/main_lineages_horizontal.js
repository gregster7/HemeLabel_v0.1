console.log('entering horizontal_cells.js');



$ (document).ready(function() {

 	console.log("ready");
	all_cells = Cell.LoadCellsFromJson(cells_json);
	Cell.populateCellLists(all_cells);

});