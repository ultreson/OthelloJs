var tour;
var adverse;
var mouvementValide;
var rangeeCourante;
var colonneCourante;
var countBlanc;
var countNoir;
var cptMouvementsPossibles;
var grille;
$(function() {
	grille = $('.ljq-grid');
    initialiserJeu();
	$('.ljq-cell').on('click', jouer);
	$('.bouton').on('click', initialiserJeu);
});
function initialiserJeu(){
	tour = 1;
	adverse = 2;
    grille.grid("cells").cell('clear');
	grille.grid('cellAt', {row:3, column:3}).cell("option", "value", adverse);
	grille.grid('cellAt', {row:4, column:4}).cell("option", "value", adverse);
    grille.grid('cellAt', {row:3, column:4}).cell("option", "value", tour);
    grille.grid('cellAt', {row:4, column:3}).cell("option", "value", tour);
	verifierCoupsPossibles();
	refreshInterface();
}
function refreshInterface(){
	$('.tour').text("C'est le tour des " + nomTour());
	$('.countBlanc').text('blancs: ' + countBlanc);
	$('.countNoir').text('noirs: ' + countNoir);
}
function ajusterScore(joueur) {
	if (joueur == 1) {
		countNoir++;
	}
	else {
		countBlanc++;
	}
}
function nomTour(){
	if (tour == 1)
		return 'noirs';
	else
		return 'blancs';
}
function jouer() {
	if ($(this).cell('option').value == tour + 2) {
		$(this).cell('option', 'value', tour);
		rangeeCourante = $(this).cell('option', 'address').row;
		colonneCourante = $(this).cell('option', 'address').column;
		toutesDirections(true);
		changerTour();
	}
}
function changerTour() {
	var tourPrecedent = tour;
	tour = adverse;
	adverse = tourPrecedent;
	verifierCoupsPossibles();
	refreshInterface();
	if (cptMouvementsPossibles == 0 || countBlanc + countNoir == 64 || countBlanc == 0 || countNoir == 0)
		finPartie();
}

function verifierCoupsPossibles() {
	countBlanc = 0;
	countNoir = 0;
	cptMouvementsPossibles = 0;
	grille.grid('cellsByValue',tour+2).cell('option','value','');
	grille.grid('cellsByValue',adverse+2).cell('option','value','');
	for (rangeeCourante = 0; rangeeCourante < grille.grid('option').rowCount; rangeeCourante++) {
		for (colonneCourante = 0; colonneCourante < grille.grid('option').columnCount; colonneCourante++) {
			if (grille.grid('cellAt', {row:rangeeCourante, column:colonneCourante}).cell('option').value == tour) {
				ajusterScore(tour);
				toutesDirections(false);
			}
			else if (grille.grid('cellAt', {row:rangeeCourante, column:colonneCourante}).cell('option').value == adverse) {
				ajusterScore(adverse);
			}
		}
	}
}

function toutesDirections(changer) {
	//droite
	verifierCoupsValides(0,1, changer);
	// gauche
	verifierCoupsValides(0,-1, changer);
	//bas
	verifierCoupsValides(1,0, changer);
	//haut
	verifierCoupsValides(-1,0, changer);
	//diagonale bas droite
	verifierCoupsValides(1,1, changer);
	//diagonale bas gauche
	verifierCoupsValides(1,-1, changer);
	//diagonale haut droite
	verifierCoupsValides(-1,1, changer);
	//diagonale haut gauche
	verifierCoupsValides(-1,-1, changer);
}

function visualiser(r,c) {
	if (mouvementValide && grille.grid('cellAt', {row: r, column: c}).cell('option', 'value') == '') {
		grille.grid('cellAt', {row: r, column: c}).cell('option', 'value', tour + 2);
		cptMouvementsPossibles++;
	}
}
function verifierCoupsValides(diffrow, diffcol, changer) {
	var rangeeCible = rangeeCourante + diffrow;
	var colonneCible = colonneCourante + diffcol;
	mouvementValide = false;
	while (grille.grid('cellAt', {row: rangeeCible, column: colonneCible}).cell('option').value == adverse) {
		rangeeCible+=diffrow;
		colonneCible+=diffcol;
		mouvementValide = true;
	}
	if (changer) {
		if (grille.grid('cellAt', {row:rangeeCible, column:colonneCible}).cell('option').value == tour) {
			var colonneAChanger = colonneCourante;
			var rangeeAChanger = rangeeCourante;
			while (!(rangeeAChanger == rangeeCible && colonneAChanger == colonneCible)) {
				grille.grid('cellAt', {row:rangeeAChanger, column:colonneAChanger}).cell('option','value',tour);
				rangeeAChanger += diffrow;
				colonneAChanger += diffcol;
			}
		}
	}
	else {
		visualiser(rangeeCible, colonneCible);
	}
}
function finPartie() {
	if (countNoir > countBlanc) {
		$('.tour').text('Les noirs ont gagné!');
		alert('Les noirs ont gagné!');
	} else if (countBlanc > countNoir) {
		$('.tour').text('Les blancs ont gagné!');
		alert('Les blancs ont gagné');
	}
}