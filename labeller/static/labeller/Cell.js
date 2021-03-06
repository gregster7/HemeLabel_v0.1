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
	}

	getLeft(){
		return (this.x - this.width/2);
	}

	getTop(){
		return (this.y - this.height/2);
	}

	getCID(){
		return this.cid;
	}

	getWidth(){
		return this.width;
	}

	getHeight(){
		return this.height;
	}

	getLineage (){
		return Cell.getLineage(this.cell_type);
	}

	getHTMLClasses () {
		return 'cell ' + this.cid + ' ' + this.cell_type + ' ' + this.pk + ' ' +Cell.getLineage(this.cell_type);
	}

	getCellTypeName (){
		return Cell.getClassLabelName(this.cell_type);
	}

	getDivForCellList(){
//		console.log("Entering getDivForCellList", this);
		var div = '<div class="cell_list_item '+this.getHTMLClasses()+'" id="celllistCID_' + this.cid+'">';
		div = div +	'<p><img class="center cellImage '+this.cid+'" src="'+this.image_url+'"></p>';
		div = div + '<p class="center" id="cellId_'+ this.cid+'">Cell ID: '+ this.cid +'</p>';
		div = div + '<p class="center cell_type cellClass_'+this.cid;
		div = div + '">'+this.getCellTypeName()+'</p></div>';

		return div;
	}


	static createCellInDatabase(rid, left, top, width, height){
		var created_cell = null;
		$.post("/add_new_cell_box/", {'rid':rid, 'top':top, 'left':left, 'height':height, 'width':width}, function(json){
			console.log("Was successful?: " + json['success']);	
	 		if (json['success'] == false) {
	 			console.log("Error description: " + json['error']);	
	 			alert("Error description: " + json['error']);
	 			return null;
	 		}

	 		else if(json['success'] == true) {
				var cell = JSON.parse(json['new_cell_json'])[0];
				var all_cells = Cell.LoadCellsFromJson(json['all_cells_json']);
				cell = new Cell(cell);
				var new_cell_div = cell.getDivForCellList();
				$('#unlabelled_cells_inline').prepend(new_cell_div);

				current_cell = $('.cell_list_item#celllistCID_'+ cell.cid);
				current_cell.on('click', function() { 
					Cell.updateCurrentCell($(this), all_cells)
				});

				addNewCircle(left+width/2, top+height/2, cell.cid);
				Cell.updateCurrentCell(current_cell, all_cells);
				//cell_counter.addCell(cell.cell_type);
				return cell; 		
	 		}
		});
	}


	static LoadCellsFromJson (cells_json){
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

	static findLineageFromClass (jquery_cell){
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
			};

	static findLabelFromClass (jquery_cell){
		for (var key in Cell.classLabelDict) {
			if ($(jquery_cell).hasClass(key)) {
				return key;
			}
		}
		console.log("Error in findLabelFromClass: no class found", jquery_cell);
	}


	static getLineage (cell_type) {
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
	
	static getClassLabelName (cell_type) {
		if (cell_type.length > 3) {
			return cell_type;
		}
		else {
//			console.log("getClassLabelName", cell_type, Cell.classLabelDict[cell_type] )
			return Cell.classLabelDict[cell_type];
		}
	}


	static getCIDfromDivID(jq_obj){
		console.log("getCIDfromDivID",jq_obj);
		var id = jq_obj.id;
		var index = id.lastIndexOf('_');
		if (index != '-1' ){
			var cid = id.substr(index+1, id.length-index+1);
			return cid;
		}
		else return $('.current_cell')[0].id;
	}

	static currentCellCID  () {
		console.log($('.current_cell'), $('.current_cell').length)
		if ($('.current_cell').length <1){
			return -1;
		}

		return Cell.getCIDfromDivID($('.current_cell')[0])
	}

	//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
	static updateCellListsAfterLabelChange (new_label) {
		var new_lineage = Cell.getLineage(new_label);
		var cell = $('.highlight');
		var old_lineage = Cell.findLineageFromClass(cell);
		var old_label = Cell.findLabelFromClass(cell);


		if (old_label!=new_label) {
			console.log("label change: ", old_label, new_label);
			cell.removeClass(old_label).addClass(new_label);
			$('#cellClass_'+Cell.currentCellCID()).html(Cell.getClassLabelName(new_label));
			$('.cellClass_'+Cell.currentCellCID()).html(Cell.getClassLabelName(new_label));
		}

		if (new_lineage!=old_lineage) {
			console.log("lineage change: ", old_lineage, new_lineage);
			var clonedCell = cell.clone();
			clonedCell.removeClass(old_lineage).addClass(new_lineage);
			cell.remove();
			$("#"+new_lineage+"_cells_inline").prepend(clonedCell);
			//console.log("cloned cell: ", clonedCell);
		}
		CellCounter.updateCountsOnPageAJAX_noRID();
	}


	static labelCurrentCell (label) {
		console.log('current cell id: ', Cell.currentCellCID())
		//Update record
		$.post("/update_cell_class/", {'cid':Cell.currentCellCID(), 'cell_label':label}, function(json){
				
				console.log("Was successful?: " + json['success'], label);
		
		 		if(json['success'] == true) {
		 			//Update current cell classification in column2
					$('#currentCellClassification').html("Classification: "+Cell.getClassLabelName(label));
		
					//Update current cell on cell list
					$('#cellClass_'+Cell.currentCellCID()).html(Cell.getClassLabelName(label));
					console.log("New cell classification: ", Cell.getClassLabelName(label))

					//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
					Cell.updateCellListsAfterLabelChange(label);
					//CellCounter.updateCountsOnPage(json['all_cells_json']);
					CellCounter.updateCountsOnPageAJAX_noRID();		
		 		} 		
		 		else {
		 			console.log("Error description: " + json['error']);	
		 			alert("Error description: " + json['error']);
		 		}

		});
	}

	static deleteCellFromDatabase(cell_cid) {
		$.post("/delete_cell/", {'cid':cell_cid}, function(json){
			if (json['success'] == true) {
				console.log('deleteCellByCID success')
				return true;
			}
			else {
				console.log("Error in deleteCellByCID: ", json);	
	 			return false;
			}	
		});
	}


	static selectCellByCID(cid){
		console.log("Entering selectCellByCID", cid);
		$('.highlight').removeClass('highlight');
		var current_cell = $('.cell_list_item.cell.'+cid).clone();
		$('.cell.'+cid).addClass('highlight');
		$('.current_cell').remove();
//		console.log('current cell', current_cell)
		current_cell.addClass('current_cell')
		current_cell.removeClass('cell_list_item')
		current_cell.attr('id', cid);
		$('#current_cell_column2').append(current_cell);
		Cell.highlightCircle(cid);
		RegionLabellerFabric.selectBoxAsActiveFromCID(cid)
	}

	static deleteCellByCID(cell_cid){
		Cell.deleteCellFromDatabase(cell_cid);
		Cell.deleteCellFromPage(cell_cid);
	}
	static deleteCurrentCell () {
		var cid = Cell.currentCellCID();
		Cell.deleteCellByCID(cid);
	}

	static deleteCellFromPage(cid){
		console.log('removing all objects with class', cid);
		$('.cell.'+cid).remove();
		$('#centroid'+cid).remove()
	}


	static extractCIDFromJQueryObjectID (jq_obj) {
		var cid = $(jq_obj).attr('id').substr(jq_obj.attr('id').lastIndexOf('_')+1);
		return 	cid;
	} 		

	static refreshImage(jq_obj){    
	    var timestamp = new Date().getTime();
		var queryString = "?t=" + timestamp;   
		console.log(jq_obj);
		jq_obj.src = jq_obj.src + queryString;
	}    


	static updateCellAfterLocationChange(cell) {

		console.log('entering updateCellAfterLocationChange', cell);
		//Cell.refreshImage(cell)
		$('.cellImage.'+cell.getCID()).each(function(){
			console.log('in updateCellAfterLocationChange', this);
			Cell.refreshImage(this);
		})
	}


	static highlightCircle(cid){
		$('.highlight_dot').addClass('no_highlight_dot').removeClass('highlight_dot');
		$('#centroid'+cid).removeClass('no_highlight_dot');
		$('#centroid'+cid).addClass('highlight_dot');
	}



}


	// static labelCurrentCell (label, region_id) {
	// 	console.log('current cell id: ', Cell.currentCellCID());
	// 	//Update record
	// 	$.post("/update_cell_class/", {'cid':Cell.currentCellCID(), 'cell_label':label}, function(json){
				
	// 		if (json['success'] == true) {
	// 			cells_json = json['all_cells_json'];
	// 			// This should return a single cell

	// 			//Update current cell classification in column2
	// 			$('#currentCellClassification').html("Classification: "+Cell.getClassLabelName(label));
				
	// 			//Update current cell on cell list
	// 			$('#cellClass_'+Cell.currentCellCID()).html(Cell.getClassLabelName(label));
	// 			console.log("New cell classification: ", Cell.getClassLabelName(label))

	// 			//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
	// 			Cell.updateCellListsAfterLabelChange(label, cells_json);

	// 		}	
	// 		else {
	// 			console.log("Error in delete cell: ", json);	
	//  			alert("Error in delete cell");
	// 		}		
			
	// 	});

	// 	// 		console.log("Was successful?: " + json['success'], label);
	// 	// });

	// 	// console.log("all cells", all_cells);
	// 	// console.log("label", label);
	// 	// console.log("label2", Cell.getClassLabelName(label))

	// //	#Need to update 

	// }

	// static addCellCentroids(cells) {
	// 	for (i=0; i<cells.length; i++) {
	// 		addNewCircle(cells[i].fields.center_x, cells[i].fields.center_y, cells[i].fields.cid, cells[i].fields.cell_type);
	// 	}
	// }


	// static addNewCircle(cell) {
	
	// 	var newDiv1 = '<span class="dot no_highlight_dot '+cell.cell_type+'" id="centroid'+cell.getCID()+ '" style=" display: inline-block; ';
	// 	newDiv1 = newDiv1 + 'position: absolute; top: ' + (cell.y-10) +'px; left: ' + (cell.x-10) + 'px; z-index: 100">';				
	// 	newDiv1 = newDiv1 + '</span>';
	// 	//console.log("NewDiv1=", newDiv1, $(newDiv1));
	// 	$( ".canvas-container" ).append ($(newDiv1));
	// 	$("#centroid"+cid).on('click', function() {
	// 	//	console.log("this dot was clicked on", $(this))
	// 		//Cell.updateCurrentCellFromDot($(this))
	// 	});
	// //	console.log("AddNewCircle", x, y, newDiv1, $(newDiv1))
	// }

	// static addCircleToCanvasFromCID(cid){
	// 	$.get("/get_cell_json/", {'cid':cid}, function(json){
	// 		console.log("Was successful?: " + json['success']);	
	//  		if (json['success'] == false) {
	//  			console.log("error in addCircleToCanvasFromCID");	
	//  		}

	//  		else if(json['success'] == true) {
	// 			var cell = JSON.parse(json['cell_json'])[0];
	// 			cell = new Cell(cell);
	// 			Cell.addCircleToCanvas(cell);
	//  		}
	// 	});
	// }

	
	// static addCircleToCanvas(cell){
	// 	console.log('in new cirlce!')
	// 	var newDiv1 = '<span class="dot highlight_dot temp_dot '+cell.cell_type+'" id="centroid'+cell.cid+ '" style=" display: inline-block; ';
	// 	newDiv1 = newDiv1 + 'position: absolute; top: ' + (cell.y-5) +'px; left: ' + (cell.x-5) + 'px; z-index: 100">';				
	// 	newDiv1 = newDiv1 + '</span>';
	// 	console.log(newDiv1, $(newDiv1), $( ".canvas-container" ))
	// 	$(newDiv1).appendTo(".canvas-container")
	// 	$(".temp_dot").fadeOut(3000);
	// 	// $("#centroid"+cid).on('click', function() {
	// 	// 	//	console.log("this dot was clicked on", $(this))
	// 	// 		Cell.updateCurrentCellFromDot($(this))
	// 	// 	});
	// 	// //	console.log("AddNewCircle", x, y, newDiv1, $(newDiv1))
	// 	// }
	// }

	// getDivForCurrentCellView(){
	// 	var div = '<div class="cell_list_item '+this.getHTMLClasses()+'" id="celllistCID_' + this.cid+'">';
	// 	div = div +	'<p><img class="center" id="currentCellImage" src="'+this.image_url+'"></p>';
	// 	div = div + '<p class="center" id="currentCellId_'+ this.cid+'">Cell ID: '+ this.cid +'</p>';
	// 	div = div + '<p class="center cell_type" id="currentCellClass_'+ this.cid+'">'+this.getCellTypeName()+'</p></div>';
	// 	return div;		
	// }


	// addAsNewCell (){
	// 	var div = getDivForCellList();
	// 	$('#unlabelled_cells_inline').prepend(new_cell_div);
	// 	$('.highlight').removeClass('highlight');
	// 	$('.highlight_dot').removeClass('highlight_dot').addClass('no_highlight_dot');
	// 	var current_cell = $('#celllistCID_'+this.cid)
	// 	// Clone unhighlighted current cell to put in column2 box
	// 	var clonedCell = current_cell.clone();
	
	// 	// Rehighlight current cell
	// 	current_cell.addClass('highlight');
	// }



	// static deleteCurrentCell () {
	// 	console.log("entering deleteCurrentCell")
	// 	var cell_cid = currentCellCID();
	// 	console.log(cell_cid)
	// 	var delete_result = Cell.deleteCellByCID(cell_cid);
	// 	if (delete_result==true) {
	// 		cells_json = json['all_cells_json'];
	// 				// // This should return a single cell
	// 		var cell = $('.highlight');
	// 		//cell_counter.deleteCell(Cell.findLabelFromClass(cell));

	// 		CellCounter.updateCountsOnPageJson(cells_json)
	// 		var highlight_dot = $('.highlight_dot');

	// 		if (Cell.nextCell(1, all_cells) || Cell.nextCell(-1, all_cells)) {
	// 			cell.remove();
	// 			highlight_dot.remove();
	// 		} else {
	// 			//Reload page now that all cells are gone
	// 			console.log("no cells left");
	// 			$('.highlight').remove();	
	// 			$('.current_cell').remove();	
	// 			$('.highlight_dot').remove();
	// 		}
	// 	}
	// }


// 	static cellListItemClickHandler(jq_obj){
// 		console.log("this item was clicked on", jq_obj)
// 		// Cell.updateCurrentCell($(this), cells)
// 		var cid = Cell.extractCIDFromJQueryObjectID(jq_obj)
// 		Cell.selectCellByCID(cid);
// //		Cell.highlightCircle(cid);
// 	}

	//Refactored to take all_cells hash array of javascript cell objects instead of JSON list
	// static populateCellLists (cells){
	// 	console.log("Entering populateCellLists: ", cells);

	// 	for (var key in cells) {
	// 		var cell = cells[key];
	// 		var cid = cell.getCID();
	// 		var cell_div = cell.getDivForCellList();
	// 		var jq_obj = $("#"+cell.getLineage()+"_cells_inline").append(cell_div);
			
	// 	}

	// 	$('.cell_list_item').on('click', function (){
	// 		Cell.cellListItemClickHandler($(this))
	// 	});
	// 		// elements = document.getElementsByClassName('cell_type');

	// 	// for (e of elements) {
	// 	// 	e.textContent = Cell.getClassLabelName(e.textContent);
	// 	// }
	// }

// 	static addKeyboardEventListeners(region_id) {
// 		console.log('adding Cell keyboard event listeners');
// 		window.addEventListener('keyup', (e) => {
// 			var code = e.code;
// 			document.getElementById('test_keyboard').innerHTML = 'code = ' + code;

// //			console.log(typeof code, code)
// 			switch(code) {
// 				case "Digit1": Cell.labelCurrentCell('M1', region_id); break;
// 				case "Digit2": Cell.labelCurrentCell('M2', region_id); break;
// 				case "Digit3": Cell.labelCurrentCell('M3', region_id); break;
// 				case "Digit4": Cell.labelCurrentCell('M4', region_id); break;
// 				case "Digit5": Cell.labelCurrentCell('M5', region_id); break;
// 				case "Digit6": Cell.labelCurrentCell('M6', region_id); break;

// 				case "KeyQ": Cell.labelCurrentCell('E1', region_id); break;
// 				case "KeyW": Cell.labelCurrentCell('E2', region_id); break;
// 				case "KeyE": Cell.labelCurrentCell('B1', region_id); break;
// 				case "KeyR": Cell.labelCurrentCell('B2', region_id); break;
// 				case "KeyT": Cell.labelCurrentCell('MO1', region_id); break;
// 				case "KeyY": Cell.labelCurrentCell('MO2', region_id); break;

// 				case "KeyA": Cell.labelCurrentCell('L0', region_id); break;
// 				case "KeyS": Cell.labelCurrentCell('L1', region_id); break;
// 				case "KeyD": Cell.labelCurrentCell('L2', region_id); break;
// 				case "KeyF": Cell.labelCurrentCell('L3', region_id); break;
// 				case "KeyG": Cell.labelCurrentCell('L4', region_id); break;

// 				case "KeyZ": Cell.labelCurrentCell('ER1', region_id); break;
// 				case "KeyX": Cell.labelCurrentCell('ER2', region_id); break;
// 				case "KeyC": Cell.labelCurrentCell('ER3', region_id); break;
// 				case "KeyV": Cell.labelCurrentCell('ER4', region_id); break;
// 				case "KeyB": Cell.labelCurrentCell('ER5', region_id); break;
// 				case "KeyN": Cell.labelCurrentCell('ER6', region_id); break;

// 				case "Digit7": Cell.labelCurrentCell('U1', region_id); break;
// 				case "Digit8": Cell.labelCurrentCell('U2', region_id); break;
// 				case "Digit9": Cell.labelCurrentCell('U3', region_id); break;
// 				case "Digit0": Cell.labelCurrentCell('U4', region_id); break;

// 				case "KeyU": Cell.labelCurrentCell('UL', region_id); break;

// 				case "ArrowLeft": Cell.nextCell(-1, region_id);  break;
// 				case "ArrowRight": Cell.nextCell(1, region_id); break;
// 				case "Enter": nextRegion(); break;
// 				case "Backspace": Cell.deleteCurrentCell();break;
// 				case "Backslash": Cell.deleteCurrentCell();break;

// 				//case "KeyH": HelpDisplay.toggle();  break;
// 			}
// 		});
// 	}

	// static updateCurrentCellFromDot (dot, all_cells){
	// 	//console.log("dot", dot);
	// 	var cid = dot.attr('id').substr(8)
	// 	//console.log("cid", cid, $("#celllistCID_"+cid))
	// 	Cell.updateCurrentCell($("#celllistCID_"+cid), all_cells)
	// }


	// static updateCurrentCell (current_cell, all_cells){

	// 	console.log("Entering Cell.updateCurrentCell");
	// 	console.log("current cell", current_cell, typeof current_cell);
	// 	// Unhighlight all cells in cell list
	// 	$('.highlight').removeClass('highlight');
	// 	$('.highlight_dot').removeClass('highlight_dot').addClass('no_highlight_dot');


	// 	// Clone unhighlighted current cell to put in column2 box
	// 	var clonedCell = current_cell.clone();
		
	// 	var current_cell_cid = current_cell.attr('id').substr(current_cell.attr('id').lastIndexOf('_')+1);	
	// 	var currentCellObejct = all_cells[current_cell_cid];
	// 	console.log(currentCellObejct);
	// 	// console.log(current_cell.attr('id'))
	// 	clonedCell.attr('id', 'currentCell_'+current_cell_cid)
	// 	console.log("cloned cell", clonedCell);
	// 	//console.log(clonedCell.children().each().attr('id'));
	// 	//console.log("cloned cell2", clonedCell);
	// 	for (var child of clonedCell.children()){
	// 	 	console.log("child", child);
	// 	// 	id = child.attr('id');
	// 	// 	child.attr('id') = "currentCellClass_"+id;
	// 	// 	console.log("changed child", child);
	// 	}
	// 	//clonedCell.attr('class', 'current_cell')
	// 	$('#current_cell').remove()
	// 	clonedCell.attr('class', 'current_cell')
	// 	clonedCell.appendTo('#current_cell_column2');


	// 	// Re-highlight current cell
	// 	$("#celllistCID_"+current_cell_cid).addClass('highlight');


	// 	var id = '#centroid'+current_cell_cid;
	// 	console.log("centroid: ", id);
	// 	$(id).removeClass('no_highlight_dot').addClass('highlight_dot');
	// 	console.log($(id));

	// }



	// // Returns true of successful, otherwise returns false
	// static getNextCell (cell, offset, all_cells) {


	// 	console.log("entering getNextCell");
	// 	console.log("offset", offset);
	// 	console.log("cell", cell);
	// 	if (offset !=1 && offset != -1){
	// 		console.log("Error in getNextCell(offset)");
	// 		return false;
	// 	}
	// 	if (cell.length  != 1) {
	// 		console.log("error in nextCell - number of highlighted cells returned not 1", cell.length, cell);
	// 		return false;
	// 	} 

	// 	if (cell.siblings.length == 0) {
	// 		console.log("cell has no siblings")
	// 		return false;
	// 	}

	// 	if (offset == 1 && cell.next().length ==1) {
	// 			var current_cell = cell.next();
	// 			Cell.updateCurrentCell(current_cell, all_cells);
	// 			return true;
	// 	}

	// 	if (offset == -1 && cell.prev().length ==1) {
	// 			var current_cell = cell.prev();
	// 			Cell.updateCurrentCell(current_cell, all_cells);
	// 			return true;
	// 	}

	// 	// if (offset == 1 && cell.next().length == 0) {
	// 	// 	return false;
	// 	// //	nextRegion(1);
	// 	// }

	// 	// if (offset == -1 && cell.prev().length == 0) {
	// 	// 	return false;
	// 	// //	nextRegion(-1);
	// 	// }




	// 	// 	// console.log('getNextCell offset==1');
	// 	// 	// console.log($(cell).next())
	// 	// 	if (cell.next().length ==1) {
	// 	// 		// console.log('getNextCell');
	// 	// 		current_cell = cell.next();
	// 	// 		return current_cell;
	// 	// 	} else if (cell.next().length == 0) {
	// 	// 		console.log("getNextCell->nextRegion")
	// 	// 		nextRegion(1);
	// 	// 	} else { 
	// 	// 		console.log("error in getNextCell offset==1"); 
	// 	// 	}
	// 	// } else if (offset == -1) {
	// 	// 	if (cell.prev().length ==1) {
	// 	// 		current_cell = cell.prev();
	// 	// 		return current_cell;
	// 	// 	} else if (cell.next.length = 0) {
	// 	// 		nextRegion(-1);
	// 	// 	}
	// 	// } else{
	// 	// 	console.log("Error - offset is not appropriate number %s" %offset);
	// 	// 	return null;
	// 	// }
	// 	console.log("Unknown error in getNextCell");
	// 	return false;
	// }



	// static getAllCellsFromRegionIdJson (region_id){
	// 	$.post("/update_all_cells_from_region_id/", {'rid':region_id}, function(json){
				
	// 		if (json['success'] == true) {
	// 			cells_json = json['all_cells_json'];
	// 			return cells_json;
	// 		}	
	// 		else {
	// 			console.log("Error in getAllCellsFromRegionIdJson: ", json);	
	//  			alert("Error in getAllCellsFromRegionIdJson");
	//  			return "error";
	// 		}		
			
	// 	});
	// }

	// // Offset for now should be +1 or -1
	// static nextCell (offset, region_id) {
	// 	cells_json = Cell.getAllCellsFromRegionIdNotJson(region_id);

	// 	if (offset !=1 && offset != -1){
	// 		console.log("Error in nextCell(offset)")
	// 		return false;
	// 	}else if (cells_json == "error") {
	// 		console.log("Error in nextCell")
	// 		return false;
	// 	} else {
	// 		var cell = $('.highlight');
	// 		all_cells = Cell.LoadCellsFromJson(cells_json);
	// 		var success = Cell.getNextCell(cell, offset, all_cells);
	// 		return success;
	// 	}
	// }


	// function getKeyByValue(object, value) {
 // 		return Object.keys(object).find(key => object[key] === value);
	// }

// function cellClassCodeFromName(cell_name) {
// 	return getKeyByValue(Cell.classLabelDict, cell_name)
// }



