class Diagnosis { 
	constructor(name, abbreviation) {
		this.name = name;
		this.abbreviation = abbreviation;
	}




	asString() {
		return (`${this.name} (${this.abbreviation})`)	
	}

	isDiagnosisChoiseEquivalent(choice_name) {
		if (this.asString() == choice_name || 
			this.asString().replaceAll(' ', '%20') == choice_name) {
			return true;
		}
		else {
			return false;
		}
	}

	static getNameFromChosenDiagnosis(chosen_diagnosis){
		return chosen_diagnosis.substr(0, chosen_diagnosis.indexOf('(')-1)
	}

	
	// static getAbbreviationFromChosenDiagnosis(chosen_diagnosis){
	// 	return chosen_diagnosis.substr(chosen_diagnosis.indexOf('(')+1, chosen_diagnosis.indexOf(')'))
	// }

	static submitDiagnosisForSlideAJAX(chosen_diagnosis, sid) {
		var diagnosis = new Diagnosis(chosen_diagnosis)
		$.post("/add_diagnosis_to_slide/", {'sid': sid, 
			'diagnosisName': Diagnosis.getNameFromChosenDiagnosis(chosen_diagnosis)},
			function(json){
				if(json['success']==true) {
					; 				// TO DO: add new diagnosis to list

				}	  
				// TO DO Add functionality to delete a diagnosis
				
		});
	//	var rid = RegionLabellerFabric.getRegionIDForPage();
	// 	$.post("/add_new_diagnosis_to_slide/", {'sid':getSlideIDFromPageURL(), 'diagnosis': chosen_diagnosis}, function(json){
		
	// 	});
	// }

	}

}	