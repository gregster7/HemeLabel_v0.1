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
		if (cells_json == "") {
			return [];
		}
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
			"UL": "Unlabelled", 
			"Unlabelled": "Unlabelled"};

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

	static updateCurrentCellFromDot = function (dot){
		//console.log("dot", dot);
		cid = dot.attr('id').substr(8)
		//console.log("cid", cid, $("#celllistCID_"+cid))
		Cell.updateCurrentCell($("#celllistCID_"+cid))
	}


	static updateCurrentCell = function (current_cell){
		console.log("Entering updateCurrentCell");
		console.log("current cell", current_cell, typeof current_cell);
		// Unhighlight all cells in cell list
		$('.highlight').removeClass('highlight');
		$('.highlight_dot').removeClass('highlight_dot').addClass('no_highlight_dot');


		// Clone unhighlighted current cell to put in column2 box
		clonedCell = current_cell.clone();
		
		current_cell_cid = current_cell.attr('id').substr(current_cell.attr('id').lastIndexOf('_')+1);	
		currentCellObejct = all_cells[current_cell_cid];
		console.log(currentCellObejct);
		// console.log(current_cell.attr('id'))
		clonedCell.attr('id', 'currentCell_'+current_cell_cid)
		console.log("cloned cell", clonedCell);
		//console.log(clonedCell.children().each().attr('id'));
		//console.log("cloned cell2", clonedCell);
		for (child of clonedCell.children()){
		 	console.log("child", child);
		// 	id = child.attr('id');
		// 	child.attr('id') = "currentCellClass_"+id;
		// 	console.log("changed child", child);
		}
		//clonedCell.attr('class', 'current_cell')
		$('.current_cell').remove()
		clonedCell.attr('class', 'current_cell')
		clonedCell.appendTo('#current_cell_column2');


		// Re-highlight current cell
		$("#celllistCID_"+current_cell_cid).addClass('highlight');


		id = '#centroid'+current_cell_cid;
		console.log("centroid: ", id);
		$(id).removeClass('no_highlight_dot').addClass('highlight_dot');
		console.log($(id));

	}



	// Returns true of successful, otherwise returns false
	static getNextCell = function (cell, offset) {


		console.log("entering getNextCell");
		console.log("offset", offset);
		console.log("cell", cell);
		if (offset !=1 && offset != -1){
			console.log("Error in getNextCell(offset)");
			return false;
		}
		if (cell.length  != 1) {
			console.log("error in nextCell - number of highlighted cells returned not 1", cell.length, cell);
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

		// if (offset == 1 && cell.next().length == 0) {
		// 	return false;
		// //	nextRegion(1);
		// }

		// if (offset == -1 && cell.prev().length == 0) {
		// 	return false;
		// //	nextRegion(-1);
		// }




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
	static nextCell = function (offset) {
		if (offset !=1 && offset != -1){
			console.log("Error in nextCell(offset)")
		}
		cell = $('.highlight');
		success = getNextCell(cell, offset);
		return success;
	}


	static currentCellCID = function () {
		var id = $('.current_cell')[0].id;
		var index = id.lastIndexOf('_');
		if (index != '-1' ){
			var cid = id.substr(index+1, id.length-index+1);
			return cid;
		}
		else return $('.current_cell')[0].id;
	}

	//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
	static updateCellListsAfterLabelChange = function (new_label, cell_counter) {
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

	static labelCurrentCell = function(label, cell_counter) {
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
		Cell.updateCellListsAfterLabelChange(label, cell_counter);		
	}


	static deleteCurrentCell = function (cell_counter) {
		console.log("entering deleteCurrentCell")
		var cell_cid = currentCellCID();
		console.log(cell_cid)
		$.post("/delete_cell/", {'cid':cell_cid}, function(json){
			console.log("Was successful?: " + json['success']);
		});

		
		// // This should return a single cell
		var cell = $('.highlight');
		cell_counter.deleteCell(Cell.findLabelFromClass(cell));

		var highlight_dot = $('.highlight_dot');

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



