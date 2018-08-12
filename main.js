const CARDS = [];

class Box {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
	}

	get top() {
		return this.pos.y;
	}

	set top(top) {
		this.pos.y = top;
	}

	get bottom() {
		return this.pos.y + this.height;
	}

	set bottom(bottom) {
		this.pos.y = bottom - this.height;
	}

	get left() {
		return this.pos.x;
	}

	set left(left) {
		this.pos.x = left;
	}

	get right() {
		return this.pos.x + this.width;
	}

	set right(right) {
		this.pos.x = right - this.size.width;
	}

	get centerX() {
		return this.pos.x + (this.width / 2);
	}

	set centerX(center) {
		this.pos.x = center - (this.width / 2);
	}

	get centerY() {
		return this.pos.y + (this.height / 2);
	}

	set centerY(center) {
		this.pos.y = center - (this.height / 2);
	}

	get center() {
		return createVector(this.centerX, this.centerY);
	}

	set center(center) {
		this.centerX = center.x;
		this.centerY = center.y;
	}

	get width() {
		return this.size.x;
	}

	get height() {
		return this.size.y;
	}

	overlaps(box) {
		return this.left < box.right && this.right > box.left && this.top < box.bottom && this.bottom > box.top;
	}

	isIn(point) {
		return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom;
	}
}
class Card {
	constructor(value, sign, color, size) {
		this.val = value;
		this.sign = sign;
		this.color = color;

		this.pos = createVector(0, 0);
		this.size = size;

		this.bounds = new Box(this.pos, this.size);
		this.hovered = false;
		this.selected = false;
		this.frontUp = false;

		this.buffer = null;
	}

	get width() {
		return this.bounds.width;
	}

	get height() {
		return this.bounds.height;
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

	flip() {
		this.frontUp = !this.frontUp;
		this.redraw();
	}

	hover() {
		if (!this.hovered) {
			this.hovered = true;
			this.redraw();
		}
	}

	blur() {
		if (this.hovered) {
			this.hovered = false;
			this.redraw();
		}
	}

	update() {
		const mouse = createVector(winMouseX, winMouseY);
		const isIn = this.bounds.isIn(mouse);

		if (isIn) this.hover(); else this.blur();
	}

	redraw() {
		if (this.buffer === null) this.createBuffer(); else {
			this.buffer.clear();
			drawCard(this, this.buffer);
		}
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
	// Bloquage de l'ouverture du menu lors du clique droit
	window.addEventListener("contextmenu", (e) => {
		e.preventDefault();
	});
	// Création de la "toile" principale
	createCanvas(window.innerWidth, window.innerHeight);

	createDeck();
	shuffle(CARDS);
	etalerCartes(CARDS);
	CARDS.forEach(card => card.flip());
}
function draw() {
	background(color(50, 100, 50));

	CARDS.forEach(card => card.update());
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

		if (card.frontUp) buffer.fill("white"); else buffer.fill(color(50, 50, 150));

		buffer.stroke("black");
		buffer.strokeCap(ROUND);
		buffer.strokeJoin(ROUND);
		buffer.rect(0, 0, card.size.x, card.size.y);

		if (!card.frontUp) {
			const tSize = 30;
			const step = card.bounds.height / 10;

			buffer.noStroke();
			buffer.fill(color(70, 70, 170));
			buffer.textSize(tSize);
			buffer.textAlign(CENTER);
			buffer.text("♥", card.width / 4, step * 2 + tSize / 3);
			buffer.text("♦", card.width / 4, step * 4 + tSize / 3);
			buffer.text("♣", card.width / 4, step * 6 + tSize / 3);
			buffer.text("♠", card.width / 4, step * 8 + tSize / 3);

			buffer.text("C", card.width / 2, step * 2 + tSize / 3);
			buffer.text("A", card.width / 2, step * 4 + tSize / 3);
			buffer.text("R", card.width / 2, step * 6 + tSize / 3);
			buffer.text("D", card.width / 2, step * 8 + tSize / 3);

			buffer.text("♥", card.width / 4 * 3, step * 2 + tSize / 3);
			buffer.text("♦", card.width / 4 * 3, step * 4 + tSize / 3);
			buffer.text("♣", card.width / 4 * 3, step * 6 + tSize / 3);
			buffer.text("♠", card.width / 4 * 3, step * 8 + tSize / 3);
		}

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
		buffer.text(displayValue(card.val), 12, 20);
		buffer.textSize(18);
		buffer.text(card.sign, 12, 34);

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
		buffer.text(displayValue(card.val), 12, 20);
		buffer.textSize(18);
		buffer.text(card.sign, 12, 34);

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
				buffer.stroke("black");
				buffer.noFill();
				buffer.rect(card.size.x / 27 * 1.5, card.size.y / 39, card.size.x / 27 * 24, card.size.y / 39 * 37);
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.fill(signColor(card.sign));
				buffer.noStroke();
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
				buffer.stroke("black");
				buffer.noFill();
				buffer.rect(card.size.x / 27 * 1.5, card.size.y / 39, card.size.x / 27 * 24, card.size.y / 39 * 37);
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.fill(signColor(card.sign));
				buffer.noStroke();
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
				buffer.stroke("black");
				buffer.noFill();
				buffer.rect(card.size.x / 27 * 1.5, card.size.y / 39, card.size.x / 27 * 24, card.size.y / 39 * 37);
				const size = (card.size.x * 2 + card.size.y * 2) / 15;
				const x = card.size.x / 10;
				const y = card.size.y / 10;
				buffer.fill(signColor(card.sign));
				buffer.noStroke();
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
	if (card.frontUp) {
		drawValues();
		drawSignPattern();
	}

	if (card.selected) {
		buffer.push();
		buffer.noFill();
		buffer.stroke("blue");
		buffer.strokeWeight(1);
		buffer.rect(0, 0, card.width, card.height);
		buffer.pop();
	} else if (card.hovered) {
		buffer.push();
		buffer.noFill();
		buffer.stroke("aqua");
		buffer.strokeWeight(2);
		buffer.rect(2, 2, card.width - 3, card.height - 3);
		buffer.pop();
	}
}

/**
 * Positionne les cartes données côte à côte, ligne par ligne
 *
 * @param cards
 */
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

/**
 * Renvoi la couleur du signe donné
 *
 * @param {string} sign
 * @returns {p5.Color}
 */
function signColor(sign) {
	return (sign === "♥" || sign === "♦") ? color("red") : color("black");
}

/**
 * Détermine et renvoi la carte pointée par x & y.
 * Si plusieurs cartes se trouvent sur ce point, renvoi la dernière carte dessinée
 *
 * @param x
 * @param y
 * @returns {Card}|null
 */
function cardAt(x, y) {
	const point = createVector(x, y);
	const cards = [];
	CARDS.forEach(card => {
		if (card.bounds.isIn(point)) cards.push(card);
	});

	return cards[cards.length - 1];
}

/**
 * Appelé chaque fois qu'un bouton de la souris est "enfoncé"
 */
function mousePressed() {
	// Si c'est le bouton droit
	if (mouseButton === RIGHT) {
		// Carte sous le curseur
		const card = cardAt(winMouseX, winMouseY);
		if (card !== null) card.flip(); // Retourne la carte
	}
}

/**
 * Mélange le packet de cartes donné
 *
 * @param cards
 */
function shuffle(cards) {
	cards.sort(() => 0.5 - Math.random());
}