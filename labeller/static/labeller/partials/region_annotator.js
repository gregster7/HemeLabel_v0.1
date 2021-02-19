$ (document).ready(function() {
	console.log('entering region_annotator.js');
	var all_cells = Cell.LoadCellsFromJson(cells_json);

	if (all_cells.length != []){
		var cells = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
		addCellCentroids(cells);
	}
});