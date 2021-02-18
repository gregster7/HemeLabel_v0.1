//Convert json cell to javascript cell
class Cell {
	constructor(cell) {
		this.cid = cell.fields.cid;
		this.x = cell.fields.center_x;
		this.y = cell.fields.center_y;
		this.image_url = cell.fields.image;
		this.cell_type = cell.fields.cell_type;
		this.pk = cell.pk;
		this.height = cell.fields.height;
		this.width = cell.fields.width;
		this.region = cell.fields.region;
		//console.log("constructing cell: ", this);
	}

	getLineage = function(){
		return Cell.getLineage(this.cell_type);
	}

	getHTMLClasses = function() {
		return 'cell ' + this.cid + ' ' + this.cell_type + ' ' + this.pk + ' ' +Cell.getLineage(this.cell_type);
	}

	getCellTypeName = function (){
		return Cell.getClassLabelName(this.cell_type);
	}

	addAsNewCell = function (){
		div = getDivForCellList();
		$('#unlabelled_cells_inline').prepend(new_cell_div);
		$('.highlight').removeClass('highlight');
		$('.highlight_dot').removeClass('highlight_dot').addClass('no_highlight_dot');
		current_cell = $('#celllistCID_'+this.cid)
		// Clone unhighlighted current cell to put in column2 box
		clonedCell = current_cell.clone();
	
		// Rehighlight current cell
		current_cell.addClass('highlight');


		current_cell.addClass("highlight");

	}



	static LoadCellsFromJson(cells_json){
	//	var cells_json_reformat = $.parseJSON(cells_json);
		var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));

		var all_cells = {};
		for (var c of cells_json_reformat){
	//		console.log('c=', c);
			var cell = new Cell(c);
			all_cells[cell.cid] = cell;
	//		console.log("new cell class", cell);
		}
	//	console.log(all_cells);
		return all_cells;
	}

	static findLineageFromClass = function (jquery_cell){
		console.log(jquery_cell);
		for (var i=0; i<Cell.lineage_labels.length; i++) {
			if ($(jquery_cell).hasClass(Cell.lineage_labels[i])) {
				return Cell.lineage_labels[i];
			}
		}
		console.log("Error in findLineageFromClass: no lineage found", jquery_cell);
	}

	static lineage_labels = [ 'unlabelled', 'myeloid','erythroid', 'lymphoid', 'misc'];


	static help_image_paths = ['erythro_reference.jpg','neutrophilic_reference.png', 'Reference_maturation.png'];


	static classLabelDict = {
			"M1": "Blast",
			"M2": "Promyelocyte",
			"M3": "Myelocyte",
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

	static findLabelFromClass(jquery_cell){
		for (var key in Cell.classLabelDict) {
			if ($(jquery_cell).hasClass(key)) {
				return key;
			}
		}
		console.log("Error in findLabelFromClass: no class found", jquery_cell);
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
		if (cell_type == 'ER1' || cell_type == 'ER2' || cell_type == 'ER3' || cell_type == 'ER4' || cell_type == 'ER5' ){
			return 'erythroid';
		}
		if( cell_type == 'ER6' ){
			return 'misc';
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
		//console.log("getClassLabelName", cell_type, Cell.classLabelDict[cell_type], Cell.classLabelDict);
		return Cell.classLabelDict[cell_type];
	}


	getDivForCellList(){
//		console.log("Entering getDivForCellList", this);
		var div = '<div class="cell_list_item '+this.getHTMLClasses()+'" id="celllistCID_' + this.cid+'">';
		div = div +	'<p><img class="center" id="cellImage" src="'+this.image_url+'"></p>';
		div = div + '<p class="center" id="cellId_'+ this.cid+'">Cell ID: '+ this.cid +'</p>';
		div = div + '<p class="center cell_type" id="cellClass_'+ this.cid+'">'+this.getCellTypeName()+'</p></div>';
//		console.log("div is: ", div)
		return div;
	}

	getDivForCurrentCellView(){
		var div = '<div class="cell_list_item '+this.getHTMLClasses()+'" id="celllistCID_' + this.cid+'">';
		div = div +	'<p><img class="center" id="currentCellImage" src="'+this.image_url+'"></p>';
		div = div + '<p class="center" id="currentCellId_'+ this.cid+'">Cell ID: '+ this.cid +'</p>';
		div = div + '<p class="center cell_type" id="currentCellClass_'+ this.cid+'">'+this.getCellTypeName()+'</p></div>';
		return div;		
	}

	makeCurrentCell(){

	}

	//Refactored to take all_cells hash array of javascript cell objects instead of JSON list
	static populateCellLists(cells){
			console.log("Entering populateCellLists: ", cells);

		for (var key in cells) {
			var cell = cells[key];
			//console.log("key, value:", key, cell);
			//cell_div = getDivFromCellObject(cell);
			var cell_div = cell.getDivForCellList();
			//$("#all_cells_inline").append(cell_div);
			$("#"+cell.getLineage()+"_cells_inline").append(cell_div);
		}
	}

}


	// function getKeyByValue(object, value) {
 // 		return Object.keys(object).find(key => object[key] === value);
	// }

// function cellClassCodeFromName(cell_name) {
// 	return getKeyByValue(Cell.classLabelDict, cell_name)
// }



