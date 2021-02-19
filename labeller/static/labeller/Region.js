//Convert json cell to javascript cell
class Region {
	constructor(region) {
		this.rid = region.fields.rid;
		this.x = region.fields.center_x;
		this.y = region.fields.center_y;
		this.image_url = region.fields.image;
		this.pk = region.pk;
		this.height = region.fields.height;
		this.width = region.fields.width;
		this.slide = region.fields.slide;
		this.all_wc_located = region.fields.all_wc_located;
		this.all_wc_classified = region.fields.all_wc_classified;
	}


	static LoadRegionFromJson(region_json){
	//	var cells_json_reformat = $.parseJSON(cells_json);
		var region_json_reformat = $.parseJSON(region_json.replace(/&quot;/ig,'"'));

		var all_regions = {};
		for (var r of region_json_reformat){
			// console.log('r=', r);
			var region = new Region(r);
			all_regions[region.pk] = region;
	//		console.log("new cell class", cell);
		}
	//	console.log(all_cells);
		return all_regions;
	}

	static UpdateRegionCounter(all_regions){
		var locations_labelled = 0;
		var locations_unlabelled = 0;
		var classes_labelled = 0;
		var classes_unlabelled = 0;

		for (var key in all_regions) {
			var region = all_regions[key];
			
			if (region.all_wc_located == true) {
				locations_labelled += 1;
			} else { locations_unlabelled += 1;}

			if (region.all_wc_classified == true) {
				classes_labelled += 1;
			} else { classes_unlabelled += 1; }
		}

		$('#Complete_Regions_Segmentation').html("Complete Regions (Segmentation): "+locations_labelled);
		$('#Incomplete_Regions_Segmentation').html("Incomplete Regions (Segmentation): "+locations_unlabelled);
		$('#Complete_Regions_Classification').html("Complete Regions (Classification): "+classes_labelled);
		$('#Incomplete_Regions_Classification').html("Incomplete Regions (Segmentation): "+classes_unlabelled);
	}
}




