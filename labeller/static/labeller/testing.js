console.log('entering testing.js');



// document.getElementById('welcome').innerHTML = {{current_cell.image.url}};
greg_counter = 0

window.addEventListener('keyup', (e) => {
	code = e.code;

    if (code === "Digit1") {       
		currentCell = document.getElementById('id_BLAST');
		if (currentCell.checked) {
			currentCell.checked = false;
		} else { currentCell.checked = true;}
	} 
	else if (code === "Digit2") {       
		currentCell = document.getElementById('id_MYELOCYTE');
		if (currentCell.checked) {
			currentCell.checked = false;
		} else { currentCell.checked = true;}
	}
	else if (code === "Digit3") {       
		currentCell = document.getElementById('id_PROMYELOCYTE');
		if (currentCell.checked) {
			currentCell.checked = false;
		} else { currentCell.checked = true;}
	}
	else if (code === "Digit4") {       
		currentCell = document.getElementById('id_METAMYELOCYTE');
		if (currentCell.checked) {
			currentCell.checked = false;
		} else { currentCell.checked = true;}
	}
	else if (code === "Digit5") {       
		currentCell = document.getElementById('id_BAND');
		if (currentCell.checked) {
			currentCell.checked = false;
		} else { currentCell.checked = true;}
	}
	else if (code === "Digit6") {       
		currentCell = document.getElementById('id_SEG');
		if (currentCell.checked) {
			currentCell.checked = false;
		} else { currentCell.checked = true;}
	}

	document.getElementById('test_keyboard').innerHTML = 'code = ' + code;
	greg_counter = greg_counter + 1;
	document.getElementById('greg_counter').innerHTML = 'counter = ' + greg_counter;
});

document.getElementById('greg_counter').innerHTML = 'counter = ' + greg_counter;

console.log('exiting testing.js');
