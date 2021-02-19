$ (document).ready(function() {
	all_regions = Region.LoadRegionFromJson(regions_json);
	Region.UpdateRegionCounter(all_regions);
});