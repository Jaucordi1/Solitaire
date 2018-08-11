const Game = {
	canvas: {}
};

function setup() {
	angleMode(DEGREES);
	colorMode(RGB);

	window.addEventListener("resize", () => resizeCanvas(window.innerWidth, window.innerHeight));
	Game.canvas.bg = color(50, 100, 50);
	createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
	background(Game.canvas.bg);
}

function mouseMoved() {
	Game.cursor.set(mouseX, mouseY);
	const cards = Card.list.filter(card => (mouseX >= card.pos.x && mouseX <= card.pos.x + card.size.x))
		.filter(card => (mouseY >= card.pos.y && mouseY <= card.pos.y + card.size.y));
	const spots = new Map();
	cards.forEach(c => {
		if (c.spot && !spots.has(c.spot.name)) spots.set(c.spot.name, c.spot);
	});

	let card;
	spots.forEach(spot => {
		if (spot.squaredUp) {
			card = spot.cards[spot.cards.length - 1];

		}
	});
	if (cards.length > 0) {
		if (mouseIsPressed) {
			if (mouseButton === LEFT) {
				card.select();
			} else {
				card.flip();
			}
		} else {
			card.hover();
		}
	}
}