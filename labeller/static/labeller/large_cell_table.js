$ (document).ready(function() {
	console.log('entering large_cell_table.js');
 	console.log("ready");
	all_cells = Cell.LoadCellsFromJson(cells_json);
	cell_counter = new CellCounter(all_cells);
});