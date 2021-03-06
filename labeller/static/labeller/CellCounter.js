class CellCounter {

	static updateCountsOnPageAJAX (rid) {
		$.get("/get_all_cells_in_region/", {'rid':rid}, function(json){
			//console.log("Was successful?: " + json['success']);	
	 		if (json['success'] == false) {
	 			console.log("updateCountsOnPageAJAX");	
	 		}

	 		else if(json['success'] == true) {
				var cells_json = json['all_cells_json'];
//				console.log('cells_json in updateCountsOnPageAJAX', cells_json, typeof(cells_json));
				if ('cells_json'!='none') {		
					CellCounter.updateCountsOnPageJson(cells_json);
				}
	 		}
		});
	}

	static getRegionIDForPage(){
		if ($('.region_container').length < 1) {
			console.log("CellCounter:getRegionIDForPage() - No region id found");
			return -1;
		}
		else {
			var rid = $('.region_container').attr('id');
			return rid;
		}
	}	

	static updateCountsOnPageAJAX_noRID () {
		var rid = CellCounter.getRegionIDForPage();
		if (rid == -1) {
			console.log("CellCounter:updateCountsOnPageAJAX() - No region id found");
		}
		else {
			CellCounter.updateCountsOnPageAJAX(rid);
		}
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
		for (var i=0; i<Cell.lineage_labels.length; i++) { 
			var new_div="<H3 class='counter header' id='" + Cell.lineage_labels[i]+"'>"+ Cell.lineage_labels[i]+ ":</H3>";
			lineage_divs[Cell.lineage_labels[i]] = new_div;  
		}
		$('#counter').append("<H3 class='counter header' id='total'>Total:</H3>");
		for (var key in lineage_divs) {
			//console.log("buildpagecounter", key, lineage_divs[key]);
			$("#counter").append($(lineage_divs[key]));
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

	// static updateCountsOnPageFromRegionID(region_id) {
	// 	var cells_json = Cell.getAllCellsFromRegionIdJson(region_id);
	// 	CellCounter.updateCountsOnPageJson(cells_json);
	// }

	static updateCountsOnPageJson(cells_json) {
		var cells = Cell.LoadCellsFromJson(cells_json);
		CellCounter.updateCountsOnPageNotJson(cells);
	}

	static updateCountsOnPageNotJson(cells){
		var counts = CellCounter.countCells(cells);
		var sum = 0;
		for (var i=0; i<Cell.lineage_labels.length; i++){
			//console.log(Cell.lineage_labels[i], counts[Cell.lineage_labels[i]])
			CellCounter.replaceOldCountWithNewCount("#"+Cell.lineage_labels[i]+".counter", counts[Cell.lineage_labels[i]])
			sum +=counts[Cell.lineage_labels[i]];
		}
		CellCounter.replaceOldCountWithNewCount("#total.counter", sum);
		CellCounter.updateMERatio(counts);

		for (var key in Cell.classLabelDict) {
			if (key != 'UL') {
				CellCounter.replaceOldCountWithNewCount("#count_"+key, counts[key]);
			}
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

//constructor(cells) {
	// 	this.count = {}
	// 	this.count['total'] = 0;
	// 	for (var key in Cell.classLabelDict) { this.count[key] = 0;}
	// 	for (var i=0; i<Cell.lineage_labels.length; i++) { this.count[Cell.lineage_labels[i]] = 0;}
	// 	for (var key in cells) {
	// 		var cell = cells[key];
	// 		this.count[cell.cell_type] += 1;
	// 		this.count[cell.getLineage()] += 1;
	// 		this.count['total'] += 1;
	// 	}
	// //		for (key in this.count) {console.log(key, this.count[key]);}
	// 	this.buildPageCounter();

	// 	this.updateCountsOnPage();
//	}

// 	updateCounts(old_label, new_label) {
// 			this.count[old_label]-=1;
// 			this.count[new_label]+=1;
// 			this.updateCountsOnPage();
// 	}


// 	buildPageCounter(){
// 		var lineage_divs = {};
// 		for (var i=0; i<Cell.lineage_labels.length; i++) { 
// 			var new_div="<H3 class='counter header' id='" + Cell.lineage_labels[i]+"'>"+ Cell.lineage_labels[i]+ ":</H3>";
// 			lineage_divs[Cell.lineage_labels[i]] = new_div;  
// 		}
// 		// for (key in classLabelDict) {
// 		// 	lineage_divs[Cell.getLineage(key)] += "<TR class='counter row' id='"+key+"'>"+ classLabelDict[key]+"</TR>";
// 		// }
// 		$('#counter').append("<H3 class='counter header' id='total'>Total:</H3>");
// 		for (var key in lineage_divs) {
// 			//console.log("buildpagecounter", key, lineage_divs[key]);
// 			$("#counter").append($(lineage_divs[key]));
// 		}

// 	}

// 	deleteCell(label) {
// 		console.log("Deleting cell from counter");
// 		this.count['total']-=1;
// 		this.count[label]-=1;
// 		this.count[Cell.getLineage(label)]-=1;
// 		this.updateCountsOnPage();
// 	}

// 	addCell() {
// 		console.log("Adding cell to counter");
// 		this.count['total']+=1;
// 		this.count['unlabelled']+=1;
// 		this.count['UL']+=1;
// 		console.log('counter', this)
// 		this.updateCountsOnPage();

// 	}


// 	// static changeLineageJQueryCell(jquery_cell, old_lineage, new_lineage) {
// 	// 	$(jquery_cell).removeClass(old_lineage).addClass(new_lineage);
// 	// }

// 	updateMERatio() {
// 		var ME_ratio = ""
// 		if (this.count['erythroid']==0) {
// 			ME_ratio = "n/a";
// 		} else {
// 			ME_ratio = (this.count['myeloid']/this.count['erythroid']).toFixed(2);
// 		}
// 		// console.log("M/E ratio: ", ME_ratio);
// 		$('#ME_ratio').html("M/E Ratio: "+ME_ratio)
// 	}

// 	updateCountsOnPage(){
// 		var sum = 0;
// 		for (var i=0; i<Cell.lineage_labels.length; i++){
// 			console.log(Cell.lineage_labels[i], this.count[Cell.lineage_labels[i]])
// 			CellCounter.replaceOldCountWithNewCount("#"+Cell.lineage_labels[i]+".counter", this.count[Cell.lineage_labels[i]])
// 			sum +=this.count[Cell.lineage_labels[i]];
// 		}
// 		CellCounter.replaceOldCountWithNewCount("#total.counter", sum);
// //		console.log("sum", sum, "total", this.count['total']);
// 		if (sum != this.count['total']) {console.log("error in updateCountsOnPage");}
		
// 		this.updateMERatio();

// 		for (var key in Cell.classLabelDict) {
// 			if (key != 'UL') {
// 				CellCounter.replaceOldCountWithNewCount("#count_"+key, this.count[key]);
// 			}
// 			// var div = $("#count_"+key);
// 			// console.log("key is ", key, div);	
// 		}
// 		console.log("updating counts", this);
// 	} 

// 	updateCounts(old_label, new_label) {
// 			this.count[old_label]-=1;
// 			this.count[new_label]+=1;
// 			this.updateCountsOnPage();
// 	}

