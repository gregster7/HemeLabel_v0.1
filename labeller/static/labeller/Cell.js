//Convert json cell to javascript cell
class Cell {

	// Convert JSON representation of cells sent from database into easier to use javascript object
	constructor(cell) {
		this.cid = cell.fields.cid;
		this.x = cell.fields.center_x;
		this.y = cell.fields.center_y;
    if (cell.fields.image [0] != '/') {
      this.image_url = '/'+cell.fields.image;
    }
    else { this.image_url = cell.fields.image; }
		this.cell_type = cell.fields.cell_type;
		this.pk = cell.pk;
		this.height = cell.fields.height;
		this.width = cell.fields.width;
		this.region = cell.fields.region;
		this.x_slide = cell.fields.center_x_slide;
		this.y_slide = cell.fields.center_y_slide;
//		this.cell_type = 'erz';
//		this.sandwich = 'sandw'
		// Uncomment this line if you ever have to manually popualte the center_x_slide 
		// 	         or center_y_slide fields (this should not be needed in the future)
		//this.getCellCentersRelativeToSlideAJAX (cell.fields.cid);
		
		//console.log(this);
//		console.log("in cell constructor", this)

		

//		Cell.getCellTypeHelper(cell.pk);

	}

	// static getCellTypeHelper(id) {
	// 	console.log("entering getCellTypeHelper", id);

	// 	$.ajax({
	// 		url : "/get_cellType/",
	// 		type : "get",
	// 		async: false,
	// 		success : function(json) {
	// 			console.log(json)
	// 			console.log("Was successful?: " + json['success']);	
	// 			if(json['success'] == true) {
	// 				console.log("Success: cell_type is " + json['cell_type']);	
	// 				return json['cell_type'];
	// 			}
	// 			else {
	// 				console.log("Error in CellConstructor get_getCellType");
	// 				return 'err'	
	// 			}
	// 		},

	// 	  error: function() {
	// 	     console.log("Error2 in CellConstructor get_getCellType");
	// 	  }

	// 	});
	// }

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

	//Cells have cell_types. They also have lineages (which are determined by a cell type). 
	// Multiple cell types share lineages. For example, segmented neutrophils and myelocytes are both
	// part of the myeloid lineage
	getLineage (){
		return Cell.getLineage(this.cell_type);
	}

	getHTMLClasses () {
		return 'cell ' + this.cid + ' ' + this.cell_type + ' ' + this.pk + ' ' +Cell.getLineage(this.cell_type);
	}

	// Cell types are represented either as a two letter code or a full name
	getCellTypeName (){
		return Cell.getClassLabelName(this.cell_type);
	}

	// Used for horizontal cell list and current cell view 
	//   returns HTML representing a single cell. This can be added to page using JQUERY
	// Currently problematic because we have multiple instances of div with same id
	getDivForCellList(){
//		console.log("Entering getDivForCellList", this);
		var div = '<div class="cell_list_item '+this.getHTMLClasses()+'" id="celllistCID_' + this.cid+'">';
		div = div +	'<p><img class="center cellImage '+this.cid+'" src="'+this.image_url+'"></p>';
		div = div + '<p class="center" id="cellId_'+ this.cid+'">Cell ID: '+ this.cid +'</p>';
		div = div + '<p class="center cell_type cellClass_'+this.cid;
		div = div + '">'+this.getCellTypeName()+'</p></div>';

		return div;
	}

	//*** Under construction ***
	// This function is used in label_slide_overlay.html and label_slide_overlay2.html 
	// which are under production
// 	getCellCentersRelativeToSlideAJAX (cid) {
// 		console.log('getCellCentersRelativeToSlideAJAX');
// 		$.get("/get_cell_center_relative_to_slide/", {'cid':cid}, function(json){
// 			//console.log("Was successful?: " + json['success']);	
// 	 		if (json['success'] == false) {
// 	 			console.log("error getCellCentersRelativeToSlideAJAX");	
// 	 		}

// 	 		else if(json['success'] == true) {
// 				var x = json['x'];
// 				var y = json['y'];
// 				console.log("getCellCentersRelativeToSlideAJAX x,y", x, y);
// 				this.x_slide = x;
// 				this.y_slide = y;
// //				console.log('cells_json in updateCountsOnPageAJAX', cells_json, typeof(cells_json));
// //				if ('cells_json'!='none') {		
// //					CellCounter.updateCountsOnPageJson(cells_json);
// 			}
//  		});
// 	}

	// static createCellInDatabase(rid, left, top, width, height){
	// 	var created_cell = null;
	// 	$.post("/add_new_cell_box/", {'rid':rid, 'top':top, 'left':left, 'height':height, 'width':width}, function(json){
	// 		console.log("Was successful?: " + json['success']);	
	//  		if (json['success'] == false) {
	//  			console.log("Error description: " + json['error']);	
	//  			alert("Error description: " + json['error']);
	//  			return null;
	//  		}

	//  		else if(json['success'] == true) {
	// 			var cell = JSON.parse(json['new_cell_json'])[0];
	// 			var cell_type = JSON.parse(json['new_cell_type_json'])[0];
	// 			cell = new Cell(cell);
	// 			cell.cell_type = cell_type.fields.cell_type;
	// 			var new_cell_div = cell.getDivForCellList();
	// 			$('#unlabelled_cells_inline').prepend(new_cell_div);

	// 			current_cell = $('.cell_list_item#celllistCID_'+ cell.cid);

		
	// 			var all_cells = Cell.LoadCellsFromJson(json['all_cells_json'], json['celltypes']);
	// 			current_cell.on('click', function() { 
	// 				Cell.updateCurrentCell($(this), all_cells)
	// 			});

	// 			addNewCircle(left+width/2, top+height/2, cell.cid);
	// 			Cell.updateCurrentCell(current_cell, all_cells);
	// 			//cell_counter.addCell(cell.cell_type);
	// 			return cell; 		
	//  		}
	// 	});
	// }

	static UpdateHorizontalCellCounts(){
		for (var key in Cell.classLabelDict) { 
			var cell_type_length = $('#'+key+'_cells_inline').children().length;

      // console.log('hello there from updateHorizontalCellCounts.')
			// console.log($('#h2_'+key).text())

			var temp_div = '<h2 id="h2_'+key+'">'+Cell.classLabelDict[key]+' ('+cell_type_length+')</h2>';

			$('#h2_'+key).replaceWith(temp_div)
//		  console.log(key, $('#'+key+'_cells_inline').children().length);
		}

	 	var lineages = ['unlabelled','myeloid', 'lymphoid', 'erythroid', 'misc'];

		for (var key in lineages) {
			// console.log('meow', key, lineages[key])
			var lineage_name = lineages[key]

			var cell_type_length = $('#'+lineage_name+'_cells_inline').children().length;
			// console.log($('#h2_'+lineage_name).text())

			var temp_div = '<h2 id="h2_'+lineage_name+'">'+lineage_name+' ('+cell_type_length+')</h2>';


			$('#h2_'+lineage_name).replaceWith(temp_div);
		}
	}

	static LoadCellsFromJson (cells_json, cell_types){
		console.log("Entering LoadCellsFromJson", cell_types)
		if (cells_json == "" ) {
			return [];
		}
	//	var cells_json_reformat = $.parseJSON(cells_json);
		var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));
		var cell_types_reformat = $.parseJSON(cell_types.replace(/&quot;/ig,'"'));
		console.log("A");
		console.log('cell_types_reformat', cell_types_reformat, typeof(cell_types_reformat), cell_types_reformat.length);
		console.log('cells_json_reformat', cells_json_reformat, typeof(cells_json_reformat), cells_json_reformat.length);

		var type_dict = {}
		for (var i=0; i<cell_types_reformat.length; i++){
			console.log (cell_types_reformat[i], cell_types_reformat[i].fields.cell)
			type_dict [cell_types_reformat[i].fields.cell] = cell_types_reformat[i].fields.cell_type
		}
		console.log('type_dict', type_dict)


		var all_cells = {};
		var counter = 0;
		for (var c of cells_json_reformat){
			var cell = new Cell(c);
			if (cell.pk in type_dict){
				console.log('cell in typedict', cell)
				cell.cell_type = type_dict[cell.pk]
				console.log('\tchanged to', cell)
				counter = counter + 1
			}
		
			all_cells[cell.cid] = cell;
		}
		console.log('counter', counter, cells_json_reformat.length);

		return all_cells;
	}


// 	static LoadCellsFromJson (cells_json){
// 		console.log("Entering LoadCellsFromJson3")
// 		if (cells_json == "") {
// 			return [];
// 		}
// 	//	var cells_json_reformat = $.parseJSON(cells_json);
// 		var cells_json_reformat = $.parseJSON(cells_json.replace(/&quot;/ig,'"'));

// 		var all_cells = {};
// 		for (var c of cells_json_reformat){
// 			var cell = new Cell(c);
// //			cell.cell_type = Cell.getCellTypeHelper(cell.pk)
// //			var type = Cell.getCellTypeHelper(cell.pk)
// //			console.log('cell_type', type)
// //			console.log(cell)
// 			all_cells[cell.cid] = cell;
// 		}

// 		return all_cells;
// 	}

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
		//console.log("getLineage ", cell_type)
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
		if (cell_type == 'err'){
			return 'error'
		}
		if (cell_type == 'erz'){
			return 'errorz'
		}

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
		//console.log($('.current_cell'), $('.current_cell').length)
		if ($('.current_cell').length <1){
			return -1;
		}

		return Cell.getCIDfromDivID($('.current_cell')[0])
	}

	//If the lineage has changed, we need to remove the cell from the current cell list and move to the correct one.
	static updateCellListsAfterLabelChange (new_label) {
    console.log("entering updateCellListsAfterLabelChange", new_label);
		
		var old_cell = $('.highlight').first();
    console.log(old_cell);
    var old_lineage = Cell.findLineageFromClass(old_cell);
    var old_label = Cell.findLabelFromClass(old_cell);

		if (old_label!=new_label) {
      console.log("label change: ", old_label, new_label);
      
      // Get Old Lineage
      var new_lineage = Cell.getLineage(new_label);
      
      // Replace old label with new label in class
      $('.highlight').removeClass(old_label).addClass(new_label);

      // If lineage has changed, then div class needs to be updated and a clone
      //   needs to be prepended in the lineage horizontal cell list

      if (new_lineage!=old_lineage) {
        console.log("lineage change: ", old_lineage, new_lineage);
        
        $('.highlight').removeClass(old_lineage).addClass(new_lineage);
        var lineage_cell_div = $("#"+old_lineage+"_cells_inline").children('.highlight')
        lineage_cell_div.remove();
        
        $("#"+new_lineage+"_cells_inline").prepend(lineage_cell_div);
      }
     
      var label_cell_div = $("#"+old_label+"_cells_inline").children('.highlight')
      label_cell_div.remove();
      

      // Prepend cell div in appropriate label-based horizontal cell list
      $("#"+new_label+"_cells_inline").prepend(label_cell_div);
			
      // Change the written (viewed) cell label for all cell instances including current cell at the top
			$('.cellClass_'+Cell.currentCellCID()).html(Cell.getClassLabelName(new_label));

      // Update cell counts on Cell Counter partial
//      CellCounter.updateCountsOnPageWrapper();

      // Update cell counts for each horizontal cell list
      Cell.UpdateHorizontalCellCounts();
		}

    $('.highlight').on('click', function (){
			HorizontalCellList.cellListItemClickHandler($(this))
		});




	}


	static labelCurrentCell (label) {
		console.log('current cell id: ', Cell.currentCellCID())
		//Update record in database
		$.post("/update_cell_class/", {'cid':Cell.currentCellCID(), 'cell_label':label}, function(json){
				console.log("update_cell_class was successful?: " + json['success'], label);
		 		if(json['success'] == true) {
					Cell.updateCellListsAfterLabelChange(label);
          CellCounter.updateCountsOnPageWrapper();
		 		} 		
		 		else {
		 			console.log('update_cell_class failed');	
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
		// console.log("Entering selectCellByCID", cid);

		$('.highlight').removeClass('highlight');
		var current_cell = $('.cell_list_item.cell.'+cid).first().clone();
		$('.cell.'+cid).addClass('highlight');
		$('.current_cell').remove();

		current_cell.addClass('current_cell')
		current_cell.removeClass('cell_list_item')
		current_cell.attr('id', cid);
//		console.log(current_cell);
		$('#current_cell_column2').append(current_cell);

//		console.log($('#current_cell_column2').children().length)
		Cell.highlightCircle(cid);
		//RegionLabellerFabric.selectBoxAsActiveFromCID(cid);
	}

	static deleteCellByCID(cell_cid){
		Cell.deleteCellFromDatabase(cell_cid);
		Cell.deleteCellFromPage(cell_cid);
    CellCounter.updateCountsOnPageWrapper();
    Cell.UpdateHorizontalCellCounts();
	}
	static deleteCurrentCell () {
		var cid = Cell.currentCellCID();
		Cell.deleteCellByCID(cid);
	}

	static deleteCellFromPage(cid){
		console.log('removing all objects with class', cid);
		var success = HorizontalCellList.nextCell(1);
    if (!success) {
      HorizontalCellList.nextCell(-1);
    }
		$('.cell.'+cid).remove();
		$('#centroid'+cid).remove();
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

