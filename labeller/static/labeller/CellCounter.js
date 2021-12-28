class CellCounter {

  static extractIDFromPageURL(search_term) {
    var url_path = window.location.href;
    var start_index = url_path.lastIndexOf(search_term) + search_term.length;
    var end_index = url_path.lastIndexOf('/');
    var id = url_path.slice(start_index, end_index)
    console.log('extractIDFromPageURL', id);
    return id;
  }

  // We need to determine if the page wants a count based on a project, region, slide, or other parameter
  static updateCountsOnPageWrapper() {
    console.log("Entering updateCountsOnPageWrapper");
    var url_path = window.location.href;
    if (url_path.includes('label_cells_in_project')){
      console.log('label_cells_in_project');
      var search_term = 'label_cells_in_project/';
      var id = CellCounter.extractIDFromPageURL(search_term);
      CellCounter.updateCountsOnPageAJAXProject(id);
    }
    else if (url_path.includes('label_region_fabric')) {
      console.log('label_region');
      var search_term = 'label_region_fabric/';
      var id = CellCounter.extractIDFromPageURL(search_term);
      CellCounter.updateCountsOnPageAJAXRegion(id);
    }
    else {
      console.log("Error in updateCountsOnPageWrapper")
    }
  }

  
  static updateCountsFunctionCallback (json) {
    if(json['success'] == true) {
      var cells_json = json['all_cells_json'];
      if (cells_json!='none') {		
        CellCounter.updateCountsOnPageJson(cells_json, json['celltypes_json']);
      }
    }

    else {
      console.log("updateCountsFunctionCallback not successful");	
    }
  };

  static updateCountsOnPageAJAXProject (project_id) {
    console.log("entering updateCountsOnPageAJAXProject");
    $.get("/get_all_cells_in_project/", {'project_id':project_id}, function(json){
      CellCounter.updateCountsFunctionCallback(json);
    }
    );
  }

	static updateCountsOnPageAJAXRegion (rid) {
    console.log("entering updateCountsOnPageAJAXRegion");
		$.get("/get_all_cells_in_region/", {'rid':rid}, function(json){
      CellCounter.updateCountsFunctionCallback(json);
		});
	}


	static countCells(cells) {
		// var cells = Cell.LoadCellsFromJson(cells_json);
		var counts = {};
		counts['total'] = 0;
		for (var key in Cell.classLabelDict) { counts[key] = 0;}
		for (var i=0; i<Cell.lineage_labels.length; i++) { counts[Cell.lineage_labels[i]] = 0;}
		for (var key in cells) {
			var cell = cells[key];
			counts[cell.cell_type] += 1;
			counts[cell.getLineage()] += 1;
			counts['total'] += 1;
		}
		return counts;
	}

	static buildpageCounter (){
		var lineage_divs = {};

		$('#counter').append("<H3 class='counter header' id='total'>Total:</H3>");

		for (var i=0; i<Cell.lineage_labels.length; i++) { 
			var new_div="<H3 class='counter header' id='" + Cell.lineage_labels[i]+"'>"+ Cell.lineage_labels[i]+ ":</H3>";
			$("#counter").append(new_div);
		}

	}

	static updateMERatio(counts) {
		var ME_ratio = ""
		if (counts['erythroid']==0) {
			ME_ratio = "n/a";
		} else {
			ME_ratio = (counts['myeloid']/counts['erythroid']).toFixed(2);
		}
		// console.log("M/E ratio: ", ME_ratio);
		$('#ME_ratio').html("M/E Ratio: "+ME_ratio)
	}


	static updateCountsOnPageJson(cells_json, celltypes_json) {
		console.log("updateCountsOnPageJson",cells_json, celltypes_json )
		var cells = Cell.LoadCellsFromJson(cells_json, celltypes_json);
		CellCounter.updateCountsOnPageNotJson(cells);
	}

	static updateCountsOnPageNotJson(cells){
		var counts = CellCounter.countCells(cells);
		var sum = 0;

		// Update Minicounter
		for (var i=0; i<Cell.lineage_labels.length; i++){
			//console.log(Cell.lineage_labels[i], counts[Cell.lineage_labels[i]])
			CellCounter.replaceOldCountWithNewCount("#"+Cell.lineage_labels[i]+".counter", counts[Cell.lineage_labels[i]])
			sum +=counts[Cell.lineage_labels[i]];
		}
		CellCounter.replaceOldCountWithNewCount("#total.counter", sum);
		CellCounter.updateMERatio(counts);

		// Update Counts on Big Table
		for (var key in Cell.classLabelDict) {
			// if (key != 'UL') {
			// 	CellCounter.replaceOldCountWithNewCount("#count_"+key, counts[key]);
			// }
			CellCounter.replaceOldCountWithNewCount("#count_"+key, counts[key]);
		}

	} 

	static replaceOldCountWithNewCount(jquery_selector, count) {
		if ($(jquery_selector).length){
			var old_count = $(jquery_selector).html();
			var new_count = old_count.substring(0, old_count.indexOf(":")+1) +" " + count;
			$(jquery_selector).html(new_count);
		}
		else {
			console.log("replaceOldCountWithNewCount query selector returned nothing", jquery_selector);
		}
	}

}
