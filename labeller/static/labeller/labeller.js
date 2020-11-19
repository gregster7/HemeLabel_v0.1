let playerSpriteX = 0;

window.addEventListener('keyup', (e) => {
	if (e.code === "ArrowUp")        playerSpriteX += 10;
	else if (e.code === "ArrowDown") playerSpriteX -= 10;
	else if (e.code == "Digit1") {
  	// code = "1";
  	$("id_BLAST").checked = true;
  }
  code = e.code;

// document.addEventListener('keyup', (e) => {
// 	if (e.code === "ArrowUp")        playerSpriteX += 10;
// 	else if (e.code === "ArrowDown") playerSpriteX -= 10;
// 	else if (e.code == "Digit1") {
//   	// code = "1";
//   	$("id_BLAST").checked = true;
//   }
//   code = e.code;

  document.getElementById('test_keyboard').innerHTML = 'code = ' + code;
  console.log(event.code);
  blast = document.getElementById('id_BLAST');
  console.log(blast);
  console.log(blast.value);
});