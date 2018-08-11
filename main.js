const CARDS = [];

class Card {
	constructor(value, sign, color, size) {
		this.val = value;
		this.sign = sign;
		this.color = color;

		this.pos = createVector(0, 0);
		this.size = size;

		this.buffer = null;
	}

	/**
	 * Créer une nouvelle "toile" pour la carte et la déssine dessus
	 */
	createBuffer() {
		const buffer = createGraphics(this.size.x + 1, this.size.y + 1);
		buffer.angleMode(DEGREES);
		buffer.colorMode(RGB);

		drawCard(this, buffer);

		this.buffer = buffer;
	}

	/**
	 * Copie/colle la "toile" de la carte sur la "toile" principale
	 */
	draw() {
		if (this.buffer === null) this.createBuffer();

		image(this.buffer, this.pos.x, this.pos.y);
	}
}

function setup() {
	function createDeck() {
		const signs = ["♥", "♦", "♣", "♠"];
		const cardSize = createVector(100, 150);
		signs.forEach(sign => {
			for (let val = 1; val < 14; val++) CARDS.push(new Card(val, sign, signColor(sign), cardSize));
		});
	}

	// Angles en degrés plutôt que radians
	angleMode(DEGREES);
	// Couleur en RGB plutôt que HSL
	colorMode(RGB);

	// Resize de la "toile" principale lors du resize du navigateur
	window.addEventListener("resize", () => {
		resizeCanvas(window.innerWidth, window.innerHeight);
	});
	// Création de la "toile" principale
	createCanvas(window.innerWidth, window.innerHeight);

	createDeck();
	etalerCartes(CARDS);
}
function draw() {
	background(color(50, 100, 50));

	CARDS.forEach(card => card.draw());
}

/**
 * Déssine la carte donnée sur la "toile" donnée
 * @param card
 * @param buffer
 */
function drawCard(card, buffer) {
	/**
	 * Traduit 1, 11, 12 et 13 en A, J, Q et K
	 *
	 * @param value Valeur numérique de la carte
	 * @returns {string}
	 */
	function displayValue(value) {
		switch (value) {
			case 1:
				return "A";
			case 11:
				return "J";
			case 12:
				return "Q";
			case 13:
				return "K";
			default:
				return value.toString();
		}
	}

	/**
	 * Dessine le fond et le contour de la carte
	 */
	function drawFace() {
		buffer.push();

		buffer.fill("white");
		buffer.stroke("black");
		buffer.strokeCap(ROUND);
		buffer.strokeJoin(ROUND);
		buffer.rect(0, 0, card.size.x, card.size.y);

		buffer.pop();
	}

	/**
	 * Dessine la valeur et le signe dans les angles superieur gauche et inferieur droit
	 */
	function drawValues() {
		buffer.push();

		// Dessine la valeur et le signe dans l'angle superieur gauche de la carte
		buffer.fill(signColor(card.sign));
		buffer.noStroke();
		buffer.textStyle(BOLD);
		buffer.textAlign(CENTER);
		buffer.textSize(16);
		buffer.text(displayValue(card.val), 10, 15);
		buffer.textSize(18);
		buffer.text(card.sign, 10, 28);

		// Transfert du point [0,0] actuel (angle superieur gauche de la carte) en [card.size.x, card.size.y] (angle inferieur
		// droit de la carte)
		buffer.translate(card.size.x, card.size.y);
		// Rotation de 180°
		buffer.rotate(180);
		// On se retrouve maintenant en [0,0] sur l'angle original inferieur droit, se trouvant être maintenant l'angle superieur
		// gauche, cela permet de créer un effet mirroir qui sert à écrire et dessiner sur la carte sur l'angle opposé sans
		// difficultés

		// Dessine la valeur et le signe, à l'envers,  dans l'angle inferieur droit de la carte
		buffer.textSize(16);
		buffer.text(displayValue(card.val), 10, 15);
		buffer.textSize(18);
		buffer.text(card.sign, 10, 28);

		buffer.pop();
	}

	/**
	 * Dessine le pattern de signes sur la carte (1 si As, 2 si 2, etc…)
	 */
	function drawSignPattern() {
		const patterns = [
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 6;
				const x = card.size.x / 2;
				const y = card.size.y / 2 + size / 3;
				buffer.textSize(size);
				buffer.strokeWeight(2);
				buffer.text(card.sign, x, y);
			}, // A
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 10;
				const x = card.size.x / 2;
				const y = card.size.y / 4;
				buffer.textSize(size);
				buffer.translate(x, y * 1.5);
				buffer.text(card.sign, 0, 0);
				buffer.translate(0, y);
				buffer.rotate(180);
				buffer.text(card.sign, 0, 0);
			}, // 2
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 12;
				const x = card.size.x / 2;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.translate(x, y * 2);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, 0, y * 2 + size / 2);
				buffer.translate(0, y * 4);
				buffer.rotate(180);
				buffer.text(card.sign, 0, 0);
			}, // 3
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 12;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.translate(x * 3, y * 2);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
				buffer.translate(x * 4, y * 6);
				buffer.rotate(180);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
			}, // 4
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 12;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 5, y * 5 + size / 3);
				buffer.translate(x * 3, y * 2);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
				buffer.translate(x * 4, y * 6);
				buffer.rotate(180);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
			}, // 5
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 12;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 3, y * 5 + size / 3);
				buffer.translate(x * 3, y * 2);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
				buffer.translate(x * 4, y * 6);
				buffer.rotate(180);
				buffer.text(card.sign, 0, y * 3 + size / 3);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
			}, // 6
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 5, y * 5 + size / 3);
				buffer.text(card.sign, x * 2, y * 5 + size / 3);
				buffer.translate(x * 3, y * 2);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
				buffer.translate(x * 4, y * 6);
				buffer.rotate(180);
				buffer.text(card.sign, -x, y * 3 + size / 3);
				buffer.text(card.sign, 0, size / 2);
				buffer.text(card.sign, x * 4, size / 2);
			}, // 7
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 2, y * 5 + size / 3);
				buffer.text(card.sign, x * 5, y * 4 + size / 3);
				buffer.translate(card.size.x, card.size.y);
				buffer.rotate(180);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 2, y * 5 + size / 3);
				buffer.text(card.sign, x * 5, y * 4 + size / 3);
			}, // 8
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 2, y * 5 + size / 3);
				buffer.text(card.sign, x * 5, y * 3 + size / 3);
				buffer.text(card.sign, x * 5, y * 5 + size / 3);
				buffer.translate(card.size.x, card.size.y);
				buffer.rotate(180);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 2, y * 5 + size / 3);
				buffer.text(card.sign, x * 5, y * 3 + size / 3);
			}, // 9
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
				buffer.translate(card.size.x, card.size.y);
				buffer.rotate(180);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
			}, // 10
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
				buffer.text(card.sign, x * 5, y * 5 + size / 3);
				buffer.translate(card.size.x, card.size.y);
				buffer.rotate(180);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
			}, // J
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
				buffer.text(card.sign, x * 5, y * 3 + size / 3);
				buffer.translate(card.size.x, card.size.y);
				buffer.rotate(180);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
				buffer.text(card.sign, x * 5, y * 3 + size / 3);
			}, // Q
			() => {
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.textSize(size);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
				buffer.text(card.sign, x * 5, y * 3 + size / 3);
				buffer.text(card.sign, x * 5, y * 5 + size / 3);
				buffer.translate(card.size.x, card.size.y);
				buffer.rotate(180);
				buffer.text(card.sign, x * 3, y * 2 + size / 3);
				buffer.text(card.sign, x * 5, y + size / 3);
				buffer.text(card.sign, x * 7, y * 2 + size / 3);
				buffer.text(card.sign, x * 3, y * 4 + size / 3);
				buffer.text(card.sign, x * 7, y * 4 + size / 3);
				buffer.text(card.sign, x * 5, y * 3 + size / 3);
			} // K
		];

		buffer.push();

		buffer.fill(signColor(card.sign));
		buffer.noStroke();
		buffer.textAlign(CENTER);

		patterns[card.val - 1]();

		buffer.pop();
	}

	drawFace();
	drawValues();
	drawSignPattern();
}

function etalerCartes(cards) {
	let x, y;
	x = y = 0;
	cards.forEach(card => {
		card.pos.set(x, y);

		if (x > window.innerWidth - card.size.x * 2) {
			x = 0;
			y += card.size.y;
		} else x += card.size.x;
	});
}

function signColor(sign) {
	return (sign === "♥" || sign === "♦") ? color("red") : color("black");
}