class Region { 
	constructor(rid, imgURL) {
		this.rid = String(rid);
		this.imgURL = imgURL;
	}

	prependRegionDivToJQuerySelector(jquery_selector) {
		$(jquery_selector).prepend(this.createRegionDiv());
		this.addRegionDeleteButtonEventListener();
	}

	createRegionDiv() {
		var new_div = '<div class="region_summary_div" id="'+this.getRegionDivID()+'">'
		
		new_div += '<ul class="region_summary_ul"><li class="region_summary_li">RID: '
		new_div += '<a href="' +this.getRegionPageURL()+ '">' +this.rid+ '</a>';
		new_div += '<li><button id="delete_region_button_'+this.rid+'" class="delete_region_button rid=' +this.rid+' ">Delete</button></li>'
		new_div += '</ul>';
		
		new_div += '<img class="region_thumb" src="' + this.imgURL + '" id="'+this.getImageTagID()+'"></div>';
		
		return new_div;
	}

	addRegionDeleteButtonEventListener(){
		$('#delete_region_button_'+this.rid).click(function(){ 
			var rid = this.id.substring(this.id.lastIndexOf('_')+1)
			
			$.post("/delete_region/", {'rid':rid}, function(json){
				if (json['success'] == true) {
				  $(`#${Region.getRegionDivID_static(rid)}`).remove();
				}
			});

		});
	}

	fadeRegionInAndOut(){
		$('.floating_region').remove()
		var clone = $('#'+this.getImageTagID()).clone()
		clone.addClass('floating_region')

		clone.click(function() { 
		  $(this).remove()
		});

		$('#regions').prepend(clone) // Is this the right place for this considering its position is controlled by CSS?
		$('.floating_region').fadeIn(300);
	}

	getRegionPageURL (){
		return `/label_region_fabric/${this.rid}/`
	}

	getImageTagID(){
		return `region_img_${this.rid}`;
	}

	getRegionDivID(){
		return Region.getRegionDivID_static(this.rid)
	}

	// Used for event listeners
	static	getRegionDivID_static(rid) {
		return `regionSummary_${rid}`;
	}

	static createNewRegionWithAJAXandAddItToRegionsElement(sid, x1, y1, x2, y2) {
		$.post("/add_new_region/", {'sid':sid, 'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2}, function(json){

			console.log("Was successful?: " + json['success'] +' '+ json['rid']+' '+ json['region_path']);	  
			//Add new region to top of regions div
			region = new Region(json['rid'],json['region_path']);
			region.prependRegionDivToJQuerySelector('#regions');
			region.fadeRegionInAndOut();
		});
	}

}	