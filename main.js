const GAME_STATES = {
	"main_menu": Symbol("mainmenu"), "in_game": Symbol("game"), "main_sub_menu": Symbol("mainsubmenu")
};
const CARD_RATIO = 100 / 150;
let PREV_TIME, MAIN_COMP, GAME_COMP, CURSOR, MENU, GAME_STATE, FPS, GAME, JACK, QUEEN, KING, BUTTONS, DEBUG;

PREV_TIME = 0;
GAME_STATE = GAME_STATES.main_menu;
FPS = 30;

class Compositor {
	constructor() {
		this.layers = [];
		this.events = new Map();
	}

	/**
	 * Enregistre une fonction à éxécuter lorsqu'un évènement est déclenché.
	 *
	 * @param {string} name
	 * @param {function} callback
	 */
	addEventListener(name, callback) {
		const listeners = (this.events.has(name)) ? this.events.get(name) : [];
		listeners.push(callback);
		this.events.set(name, listeners);
	}
	/**
	 * Déclenche un évènement.
	 *
	 * @param {string} name
	 * @param {Array} datas
	 *
	 * @returns {boolean}
	 */
	event(name, datas) {
		if (!this.events.has(name)) return false;
		this.events.get(name).forEach(callable => callable.apply(null, datas));
		return true;
	}

	/**
	 * Rend une image.
	 *
	 * @param {number} time
	 */
	frame(time) {
		const deltaTime = time - PREV_TIME;

		this.layers.forEach(layer => {
			layer.update(deltaTime);
		});
		this.layers.forEach(layer => {
			layer.draw();
		});
	}
}
class Box {
	/**
	 * Créer une boite/BoundingBox de taille size et placé en pos
	 *
	 * @param {p5.Vector} pos
	 * @param {p5.Vector} size
	 */
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
	}

	/**
	 * Renvoi le bord superieur de la boite sur l'axe vertical
	 *
	 * @returns {*}
	 */
	get top() {
		return this.pos.y;
	}
	/**
	 * Positionne le bord superieur de la boite sur l'axe vertical
	 *
	 * @param top
	 */
	set top(top) {
		this.pos.y = top;
	}
	/**
	 * Renvoi le bord inferieur de la boite sur l'axe vertical
	 *
	 * @returns {*}
	 */
	get bottom() {
		return this.pos.y + this.height;
	}
	/**
	 * Positionne le bord inferieur de la boite sur l'axe vertical
	 *
	 * @param bottom
	 */
	set bottom(bottom) {
		this.pos.y = bottom - this.height;
	}
	/**
	 * Renvoi le bord gauche de la boite sur l'axe horizontal
	 *
	 * @returns {*}
	 */
	get left() {
		return this.pos.x;
	}
	/**
	 * Positionne le bord gauche de la boite sur l'axe horizontal
	 *
	 * @param left
	 */
	set left(left) {
		this.pos.x = left;
	}
	/**
	 * Renvoi le bord droit de la boite sur l'axe horizontal
	 *
	 * @returns {*}
	 */
	get right() {
		return this.pos.x + this.width;
	}
	/**
	 * Positionne le bord droit de la boite sur l'axe horizontal
	 *
	 * @param right
	 */
	set right(right) {
		this.pos.x = right - this.size.width;
	}

	/**
	 * Renvoi le centre de la boite sur l'axe horizontal
	 *
	 * @returns {*}
	 */
	get centerX() {
		return this.pos.x + (this.width / 2);
	}
	/**
	 * Positionne le centre de la boite sur l'axe horizontal
	 *
	 * @param center
	 */
	set centerX(center) {
		this.pos.x = center - (this.width / 2);
	}
	/**
	 * Renvoi le centre de la boite sur l'axe vertical
	 *
	 * @returns {*}
	 */
	get centerY() {
		return this.pos.y + (this.height / 2);
	}
	/**
	 * Positionne le centre de la boite sur l'axe vertical
	 *
	 * @param center
	 */
	set centerY(center) {
		this.pos.y = center - (this.height / 2);
	}
	/**
	 * Renvoi les coordonnées du centre de la boite
	 *
	 * @returns {*}
	 */
	get center() {
		return createVector(this.centerX, this.centerY);
	}
	/**
	 * Positionne le centre de la boite aux coordonnées reçues
	 *
	 * @param center
	 */
	set center(center) {
		this.centerX = center.x;
		this.centerY = center.y;
	}

	/**
	 * Renvoi la largeur de la boite
	 *
	 * @returns {*}
	 */
	get width() {
		return this.size.x;
	}
	/**
	 * Redimmensionne la largeur de la boite
	 *
	 * @param {number} width
	 */
	set width(width) {
		this.size.x = width;
	}
	/**
	 * Renvoi la hauteur de la boite
	 *
	 * @returns {*}
	 */
	get height() {
		return this.size.y;
	}
	/**
	 * Redimmensionne la hauteur de la boite
	 *
	 * @param {number} height
	 */
	set height(height) {
		this.size.y = height;
	}

	overlaps(box) {
		return this.left < box.right && this.right > box.left && this.top < box.bottom && this.bottom > box.top;
	}
	/**
	 * Renvoi TRUE si les coordonnées reçues se trouvent dans la boite, FALSE si elles sont en dehors
	 *
	 * @param point
	 * @returns {boolean}
	 */
	contains(point) {
		return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom;
	}
}

class Buffer extends Box {
	/**
	 * Créer un buffer.
	 *
	 * @param {p5.Vector} pos
	 * @param {p5.Vector} size
	 */
	constructor(pos, size) {
		super(pos, size);
		this.image = Buffer.createBuffer(size.x, size.y);
		this.needsRedraw = true;
	}

	/**
	 * Créer un nouveau buffer et le pre-configure.
	 *
	 * @param {number} width Largeur du buffer
	 * @param {number} height Hauteur du buffer
	 *
	 * @returns {p5.Graphics}
	 */
	static createBuffer(width, height) {
		const buffer = createGraphics(width + 10, height + 10);
		buffer.angleMode(DEGREES);
		buffer.colorMode(RGB);
		buffer.translate(5, 5);

		return buffer;
	}
	/**
	 * Appelée pour dessiner sur le buffer.
	 */
	drawBuffer() {}
	/**
	 * Redimmensionne et redessine le buffer
	 */
	redraw() {
		if (this.image.width !== this.width + 10 || this.image.height !== this.height + 10) {
			this.image.width = this.width + 10;
			this.image.height = this.height + 10;
		}
		this.image.clear();
		this.drawBuffer();
		this.needsRedraw = false;
	}
	/**
	 * Colle le buffer sur le canvas
	 */
	draw() {
		if (this.needsRedraw) this.redraw();

		image(this.image, this.left - 5, this.top - 5);
	}
	/**
	 * Colle le buffer sur le buffer donné.
	 *
	 * @param {p5.Graphics} img Buffer de destination
	 * @param {p5.Vector} pos Coordonnées de destination sur le buffer
	 */
	paste(img, pos) {
		if (this.needsRedraw) this.redraw();

		img.image(this.image, pos.x - 5, pos.y - 5);
	}
}
class MenuItem {
	/**
	 * Créer un nouvel item pour un menu
	 *
	 * @param {string} text
	 * @param {string} align
	 */
	constructor(text, align) {
		this.text = text;
		this.align = align;
		this.selected = false;
		this.disabled = false;
		this.callback = (item) => {};
	}
}
class Menu extends Box {
	/**
	 * Créer un nouveau menu.
	 *
	 * @param {string} title Titre du menu
	 * @param {number} itemTextSize Taille du texte des items
	 */
	constructor(title, itemTextSize) {
		super(createVector(window.innerWidth / 2 - (width / 2), 200), createVector(width, height));
		this.title = title;

		this.items = [];
		this.selection = 0;
		this.itemTextSize = itemTextSize;
	}

	/**
	 * Renvoi les items qui ne sont pas désactivés uniquement.
	 *
	 * @returns {Array}
	 */
	get enabledItems() {
		const items = [];
		this.items.forEach(i => {
			if (!i.disabled) {
				items.push(i);
			}
		});

		return items;
	}
	/**
	 * Renvoi le nombre total d'items.
	 *
	 * @returns {number}
	 */
	get nbItems() {
		return this.items.length;
	}
	/**
	 * Renvoi l'item séléctionné uniquement.
	 *
	 * @returns {MenuItem|null}
	 */
	get selectedItem() {
		const items = this.enabledItems;
		return (items[this.selection]) ? items[this.selection] : null;
	}

	/**
	 * Renvoi l'item aux coordonnées données ou NULL s'il n'y en a pas.
	 *
	 * @param {number} x
	 * @param {number} y
	 *
	 * @returns {MenuItem|null}
	 */
	itemAt(x, y) {
		if (x < this.left || x > this.right) return null;
		if (y < this.top || y > this.bottom) return null;

		let itemY = this.top + 200;
		for (let i = 0; i < this.items.length - 1; i++) {
			if (y > itemY && y < itemY + this.itemTextSize) return this.items[i];
			itemY += this.itemTextSize;
		}

		return null;
	}

	/**
	 * Renvoi TRUE si l'index donné est un item existant.
	 *
	 * @param {number} idx
	 *
	 * @returns {boolean}
	 */
	hasItem(idx) {
		return this.items[idx] instanceof MenuItem;
	}
	/**
	 * Ajoute un item au menu.
	 *
	 * @param {string} text Texte affiché
	 * @param {string} align Alignement horizontal du texte (LEFT, CENTER, RIGHT)
	 */
	addItem(text, align = CENTER) {
		this.pushItem(new MenuItem(text, align));
	}
	/**
	 * Ajoute l'item donné au menu.
	 *
	 * @param {MenuItem} item
	 */
	pushItem(item) {
		this.items.push(item);
	}

	/**
	 * Séléctionne l'item correspondant à l'index donné et déléctionne les autres.
	 *
	 * @param {number} idx
	 */
	select(idx) {
		const items = this.enabledItems;
		if (items[idx]) {
			if (this.selectedItem !== null) this.selectedItem.selected = false;

			this.selection = idx;
			items[this.selection].selected = true;
		}
	}
	/**
	 * Séléctionne l'item activé suivant, ou le premier si le dernier est actuellement séléctionné.
	 */
	nextItem() {
		this.select((this.selection + 1 < this.enabledItems.length) ? this.selection + 1 : 0);
	}
	/**
	 * Séléctionne l'item activé précédent, ou le dernier si le premier est actuellement séléctionné.
	 */
	prevItem() {
		this.select((this.selection - 1 > 0) ? this.selection - 1 : this.enabledItems.length - 1);
	}
	/**
	 * Valide la séléction du menu.
	 */
	confirm() {
		const item = this.selectedItem;
		if (item) item.callback.call(this, item);
	}

	/**
	 * Met à jour le menu.
	 */
	update() {
		if (!this.contains(createVector(mouseX, mouseY))) return;

		let y = this.top + 200;
		this.items.forEach((item, index) => {
			if (mouseY >= y + 15 + (index * this.itemTextSize) && mouseY <= y + this.itemTextSize +
				(index * this.itemTextSize)) this.select(index);
		});
	}
	/**
	 * Dessine le menu.
	 */
	draw() {
		push();

		const titleSize = this.itemTextSize * 1.5;
		textAlign(CENTER);
		textSize(titleSize);
		textStyle(BOLD);
		// Titre
		translate(0, this.top);
		text(this.title, this.centerX, titleSize - (titleSize / 3.2));
		textSize(this.itemTextSize);
		// Menu

		this.items.forEach((item, index) => {
			push();

			textAlign(item.align);
			if (item.disabled) fill("gray"); else fill((item.selected) ? "aqua" : "black");
			text(item.text, (item.align !== CENTER) ? this.left : this.centerX,
				200 + (index * this.itemTextSize) + this.itemTextSize);

			pop();
		});

		pop();
	}
}
class Cursor extends Box {
	constructor() {
		super(createVector(winMouseX, winMouseY), createVector(0, 0));
		this.prev = createVector(pmouseX, pmouseY);
	}

	isIn(box) {
		return box.contains(this.left, this.top);
	}
	hasMoved() {
		return (this.left !== this.prev.x || this.top !== this.prev.y);
	}

	click(x, y) {
		switch (mouseButton) {
			case LEFT:
				const idx = MENU.items.indexOf(MENU.itemAt(x, y));
				if (idx > -1) {
					MENU.select(idx);
					MENU.confirm();
				}
				break;
			case CENTER:
				break;
			case RIGHT:
				break;
		}
	}
	dblClick() {

	}

	update() {
		this.prev.set(this.left, this.top);
		this.pos.set(mouseX, mouseY);
	}
	draw() {
		push();

		noFill();
		strokeWeight(2);
		stroke("black");
		textStyle(NORMAL);
		line(this.left - 5, this.top, this.left + 5, this.top);
		line(this.left, this.top - 5, this.left, this.top + 5);

		pop();
	}
}

class CardBuffer {
	/**
	 * Créer un nouveau buffer.
	 *
	 * @param pos
	 * @param {p5.Vector} size Taille du buffer
	 */
	constructor(pos, size) {
		this.bounds = new Box(pos, size);
		this.image = Buffer.createBuffer(size.x, size.y);
		this.needsRedraw = true;
	}

	/**
	 * Créer un nouveau buffer et le pre-configure.
	 *
	 * @param {number} width Largeur du buffer
	 * @param {number} height Hauteur du buffer
	 *
	 * @returns {p5.Graphics}
	 */
	static createBuffer(width, height) {
		const buffer = createGraphics(width + 10, height + 10);
		buffer.angleMode(DEGREES);
		buffer.colorMode(RGB);
		buffer.translate(5, 5);

		return buffer;
	}
	drawBuffer() {}
	/**
	 * Redimmensionne et redessine le buffer
	 */
	redraw() {
		this.image.width = this.bounds.size.x + 10;
		this.image.height = this.bounds.size.y + 10;
		this.image.clear();
		this.drawBuffer();
		this.needsRedraw = false;
	}
	/**
	 * Colle le buffer sur la "toile" principale
	 */
	draw() {
		if (this.needsRedraw) this.redraw();

		image(this.image, this.bounds.left - 5, this.bounds.top - 5);
	}
	/**
	 * Colle le buffer sur la "toile" donnée.
	 *
	 * @param {p5.Graphics} img "Toile" sur laquelle sera collé le buffer
	 * @param {p5.Vector} pos Coordonnées auxquelles coller le buffer
	 */
	paste(img, pos) {
		if (this.needsRedraw) this.redraw();

		img.image(this.image, pos.x - 5, pos.y - 5);
	}
}
class Card extends CardBuffer {
	/**
	 * Créer une carte de valeur `value` et de signe `sign`
	 * les valeurs et signes  sont de couleur `color`
	 * la carte mesure `size`
	 *
	 * @param {int} value
	 * @param {string} sign
	 * @param {p5.Vector} size
	 */
	constructor(value, sign, size) {
		super(createVector(0, 0), size);

		this.val = value;
		this.sign = sign;

		this.hovered = false;
		this.selected = false;
		this.frontUp = true;
		this.deck = null;
	}
	/**
	 * Renvoi la largeur de la carte (shortcut)
	 *
	 * @returns {*}
	 */
	get width() {
		return this.bounds.width;
	}
	/**
	 * Renvoi la hauteur de la carte (shortcut)
	 *
	 * @returns {*}
	 */
	get height() {
		return this.bounds.height;
	}
	get inDeck() {
		return this.deck !== null;
	}
	get color() {
		return signColor(this.sign);
	}
	get center() {
		return this.bounds.center;
	}

	setFrontUp(val) {
		if (val !== this.frontUp) {
			this.frontUp = val;
			this.needsRedraw = true;
		}
	}
	/**
	 * Retourne la carte
	 */
	flip() {
		this.setFrontUp(!this.frontUp);
	}
	/**
	 * Affiche le halo de survol
	 */
	hover() {
		if (!this.hovered) {
			this.hovered = true;
			this.needsRedraw = true;
		}
	}
	/**
	 * Cache le halo de survol
	 */
	blur() {
		if (this.hovered) {
			this.hovered = false;
			this.needsRedraw = true;
		}
	}

	/**
	 * Déclenche le survol de la carte ou l'arrêt du survol
	 */
	update() {
		if (!this.inDeck) {
			const contains = this.bounds.contains(GAME.cursor.pos);

			if (contains) this.hover(); else this.blur();
		}
	}
	drawBuffer() {
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
			this.image.push();

			if (this.frontUp) this.image.fill("white"); else this.image.fill(color(50, 50, 150));

			this.image.stroke("black");
			this.image.strokeJoin(ROUND);
			this.image.beginShape();
			this.image.vertex(0, 0);
			this.image.vertex(this.width, 0);
			this.image.vertex(this.width, this.height);
			this.image.vertex(0, this.height);
			this.image.endShape(CLOSE);

			if (!this.frontUp) {
				const tSize = 30;
				const step = this.height / 10;

				this.image.noStroke();
				this.image.fill(color(70, 70, 170));
				this.image.textSize(tSize);
				this.image.textAlign(CENTER);
				this.image.text("♥", this.width / 4, step * 2 + tSize / 3);
				this.image.text("♦", this.width / 4, step * 4 + tSize / 3);
				this.image.text("♣", this.width / 4, step * 6 + tSize / 3);
				this.image.text("♠", this.width / 4, step * 8 + tSize / 3);

				this.image.text("C", this.width / 2, step * 2 + tSize / 3);
				this.image.text("A", this.width / 2, step * 4 + tSize / 3);
				this.image.text("R", this.width / 2, step * 6 + tSize / 3);
				this.image.text("D", this.width / 2, step * 8 + tSize / 3);

				this.image.text("♥", this.width / 4 * 3, step * 2 + tSize / 3);
				this.image.text("♦", this.width / 4 * 3, step * 4 + tSize / 3);
				this.image.text("♣", this.width / 4 * 3, step * 6 + tSize / 3);
				this.image.text("♠", this.width / 4 * 3, step * 8 + tSize / 3);
			}

			this.image.pop();
		}
		/**
		 * Dessine la valeur et le signe dans les angles superieur gauche et inferieur droit
		 */
		function drawValues() {
			this.image.push();

			// Dessine la valeur et le signe dans l'angle superieur gauche de la carte
			this.image.fill(signColor(this.sign));
			this.image.noStroke();
			this.image.textStyle(BOLD);
			this.image.textAlign(CENTER);
			this.image.textSize(16);
			this.image.text(displayValue(this.val), 12, 20);
			this.image.textSize(18);
			this.image.text(this.sign, 12, 34);

			// Transfert du point [0,0] actuel (angle superieur gauche de la carte) en [this.bounds.size.x, this.bounds.size.y]
			// (angle inferieur droit de la carte)
			this.image.translate(this.bounds.size.x, this.bounds.size.y);
			// Rotation de 180°
			this.image.rotate(180);
			// On se retrouve maintenant en [0,0] sur l'angle original inferieur droit, se trouvant être maintenant l'angle superieur
			// gauche, cela permet de créer un effet mirroir qui sert à écrire et dessiner sur la carte sur l'angle opposé sans
			// difficultés

			// Dessine la valeur et le signe, à l'envers,  dans l'angle inferieur droit de la carte
			this.image.textSize(16);
			this.image.text(displayValue(this.val), 12, 20);
			this.image.textSize(18);
			this.image.text(this.sign, 12, 34);

			this.image.pop();
		}
		/**
		 * Dessine le pattern de signes sur la carte (1 si As, 2 si 2, etc…)
		 */
		function drawSignPattern() {
			const patterns = [
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 6;
					const x = this.bounds.size.x / 2;
					const y = this.bounds.size.y / 2 + size / 3;
					this.image.textSize(size);
					this.image.strokeWeight(2);
					this.image.text(this.sign, x, y);
				}, // A
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 10;
					const x = this.bounds.size.x / 2;
					const y = this.bounds.size.y / 4;
					this.image.textSize(size);
					this.image.translate(x, y * 1.5);
					this.image.text(this.sign, 0, 0);
					this.image.translate(0, y);
					this.image.rotate(180);
					this.image.text(this.sign, 0, 0);
				}, // 2
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 12;
					const x = this.bounds.size.x / 2;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.translate(x, y * 2);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, 0, y * 2 + size / 2);
					this.image.translate(0, y * 4);
					this.image.rotate(180);
					this.image.text(this.sign, 0, 0);
				}, // 3
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 12;
					const x = this.bounds.size.x / 10;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.translate(x * 3, y * 2);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
					this.image.translate(x * 4, y * 6);
					this.image.rotate(180);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
				}, // 4
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 12;
					const x = this.bounds.size.x / 10;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.text(this.sign, x * 5, y * 5 + size / 3);
					this.image.translate(x * 3, y * 2);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
					this.image.translate(x * 4, y * 6);
					this.image.rotate(180);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
				}, // 5
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 12;
					const x = this.bounds.size.x / 10;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.text(this.sign, x * 3, y * 5 + size / 3);
					this.image.translate(x * 3, y * 2);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
					this.image.translate(x * 4, y * 6);
					this.image.rotate(180);
					this.image.text(this.sign, 0, y * 3 + size / 3);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
				}, // 6
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 15;
					const x = this.bounds.size.x / 10;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.text(this.sign, x * 5, y * 5 + size / 3);
					this.image.text(this.sign, x * 2, y * 5 + size / 3);
					this.image.translate(x * 3, y * 2);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
					this.image.translate(x * 4, y * 6);
					this.image.rotate(180);
					this.image.text(this.sign, -x, y * 3 + size / 3);
					this.image.text(this.sign, 0, size / 2);
					this.image.text(this.sign, x * 4, size / 2);
				}, // 7
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 15;
					const x = this.bounds.size.x / 10;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.text(this.sign, x * 3, y * 2 + size / 3);
					this.image.text(this.sign, x * 7, y * 2 + size / 3);
					this.image.text(this.sign, x * 2, y * 5 + size / 3);
					this.image.text(this.sign, x * 5, y * 4 + size / 3);
					this.image.translate(this.bounds.size.x, this.bounds.size.y);
					this.image.rotate(180);
					this.image.text(this.sign, x * 3, y * 2 + size / 3);
					this.image.text(this.sign, x * 7, y * 2 + size / 3);
					this.image.text(this.sign, x * 2, y * 5 + size / 3);
					this.image.text(this.sign, x * 5, y * 4 + size / 3);
				}, // 8
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 15;
					const x = this.bounds.size.x / 10;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.text(this.sign, x * 3, y * 2 + size / 3);
					this.image.text(this.sign, x * 7, y * 2 + size / 3);
					this.image.text(this.sign, x * 2, y * 5 + size / 3);
					this.image.text(this.sign, x * 5, y * 3 + size / 3);
					this.image.text(this.sign, x * 5, y * 5 + size / 3);
					this.image.translate(this.bounds.size.x, this.bounds.size.y);
					this.image.rotate(180);
					this.image.text(this.sign, x * 3, y * 2 + size / 3);
					this.image.text(this.sign, x * 7, y * 2 + size / 3);
					this.image.text(this.sign, x * 2, y * 5 + size / 3);
					this.image.text(this.sign, x * 5, y * 3 + size / 3);
				}, // 9
				() => {
					const size = (this.bounds.size.x * 2 + this.bounds.size.y * 2) / 15;
					const x = this.bounds.size.x / 10;
					const y = this.bounds.size.y / 10;
					this.image.textSize(size);
					this.image.text(this.sign, x * 3, y * 2 + size / 3);
					this.image.text(this.sign, x * 5, y + size / 3);
					this.image.text(this.sign, x * 7, y * 2 + size / 3);
					this.image.text(this.sign, x * 3, y * 4 + size / 3);
					this.image.text(this.sign, x * 7, y * 4 + size / 3);
					this.image.translate(this.bounds.size.x, this.bounds.size.y);
					this.image.rotate(180);
					this.image.text(this.sign, x * 3, y * 2 + size / 3);
					this.image.text(this.sign, x * 5, y + size / 3);
					this.image.text(this.sign, x * 7, y * 2 + size / 3);
					this.image.text(this.sign, x * 3, y * 4 + size / 3);
					this.image.text(this.sign, x * 7, y * 4 + size / 3);
				}, // 10
				() => {
					const stepX = this.width / 27;
					const stepY = this.height / 39;
					const xMultiplier = stepX - 0.15;
					const yMultiplier = stepY - 0.15;

					this.image.stroke("black");
					this.image.noFill();
					this.image.rect(stepX, stepY, stepX * 25, stepY * 37);
					this.image.translate(stepX, stepY);

					this.image.push();
					this.image.translate(stepX * 2.25, 0.1);
					JACK.shapes.forEach(shape => {
						this.image.fill(color(shape.bg));
						this.image.beginShape();
						shape.points.forEach(point => {
							this.image.vertex(point[0] * xMultiplier, point[1] * yMultiplier);
						});
						this.image.endShape(CLOSE);
					});
					this.image.pop();

					this.image.text(this.sign, this.centerX, this.centerY);

					this.image.translate(this.bounds.width - (stepX * 2), this.bounds.height - (stepY * 2));
					this.image.rotate(180);
					this.image.translate(stepX * 2.25, 0);

					JACK.shapes.forEach(shape => {
						this.image.fill(color(shape.bg));
						this.image.beginShape();
						shape.points.forEach(point => {
							this.image.vertex(point[0] * xMultiplier, point[1] * yMultiplier);
						});
						this.image.endShape(CLOSE);
					});
				}, // J
				() => {
					const stepX = this.width / 27;
					const stepY = this.height / 39;
					const xMultiplier = stepX - 0.15;
					const yMultiplier = stepY - 0.15;

					this.image.stroke("black");
					this.image.noFill();
					this.image.rect(stepX, stepY, stepX * 25, stepY * 37);
					this.image.translate(stepX, stepY);

					this.image.push();
					this.image.translate(stepX * 2.25, 0.1);
					QUEEN.shapes.forEach(shape => {
						this.image.fill(color(shape.bg));
						this.image.beginShape();
						shape.points.forEach(point => {
							this.image.vertex(point[0] * xMultiplier, point[1] * yMultiplier);
						});
						this.image.endShape(CLOSE);
					});
					this.image.pop();

					this.image.text(this.sign, this.centerX, this.centerY);

					this.image.translate(this.bounds.width - (stepX * 2), this.bounds.height - (stepY * 2));
					this.image.rotate(180);
					this.image.translate(stepX * 2.25, 0);

					QUEEN.shapes.forEach(shape => {
						this.image.fill(color(shape.bg));
						this.image.beginShape();
						shape.points.forEach(point => {
							this.image.vertex(point[0] * xMultiplier, point[1] * yMultiplier);
						});
						this.image.endShape(CLOSE);
					});
				}, // Q
				() => {
					const stepX = this.width / 27;
					const stepY = this.height / 39;
					const xMultiplier = stepX - 0.15;
					const yMultiplier = stepY - 0.15;

					this.image.stroke("black");
					this.image.noFill();
					this.image.rect(stepX, stepY, stepX * 25, stepY * 37);
					this.image.translate(stepX, stepY);

					this.image.push();
					this.image.translate(stepX * 2.25, 0.1);
					KING.shapes.forEach(shape => {
						this.image.fill(color(shape.bg));
						this.image.beginShape();
						shape.points.forEach(point => {
							this.image.vertex(point[0] * xMultiplier, point[1] * yMultiplier);
						});
						this.image.endShape(CLOSE);
					});
					this.image.pop();

					this.image.text(this.sign, this.centerX, this.centerY);

					this.image.translate(this.bounds.width - (stepX * 2), this.bounds.height - (stepY * 2));
					this.image.rotate(180);
					this.image.translate(stepX * 2.25, 0);

					KING.shapes.forEach(shape => {
						this.image.fill(color(shape.bg));
						this.image.beginShape();
						shape.points.forEach(point => {
							this.image.vertex(point[0] * xMultiplier, point[1] * yMultiplier);
						});
						this.image.endShape(CLOSE);
					});
				} // K
			];

			this.image.push();

			this.image.fill(signColor(this.sign));
			this.image.noStroke();
			this.image.textAlign(CENTER);

			patterns[this.val - 1]();

			this.image.pop();
		}

		drawFace.call(this);
		if (this.frontUp) {
			drawValues.call(this);
			drawSignPattern.call(this);
		}

		if (this.selected) {
			this.image.push();
			this.image.noFill();
			this.image.stroke("blue");
			this.image.strokeWeight(1);
			this.image.rect(0, 0, this.width, this.height);
			this.image.pop();
		} else if (this.hovered) {
			this.image.push();
			this.image.noFill();
			this.image.stroke("aqua");
			this.image.strokeWeight(2);
			this.image.beginShape();
			this.image.vertex(0, 0);
			this.image.vertex(this.width, 0);
			this.image.vertex(this.width, this.height);
			this.image.vertex(0, this.height);
			this.image.endShape(CLOSE);
			this.image.pop();
		}
	}
}
class Deck {
	constructor(pos, size) {
		this.bounds = new Box(pos, size);
		this.squaredUp = true;
		this.direction = null;
		this.spreadDistance = 30;
		this.frontUp = null;

		this.cards = [];
		this.maxCards = 52;
	}

	// Booleans
	canTakeFrom(fromIdx) {
		if (!inRange(fromIdx, 0, this.cards.length - 1)) return false;
		if (fromIdx === this.cards.length - 1) return true;

		const index = this.indexOf(this.cards[fromIdx]);
		if (index === -1) return false;

		let previousCard = this.cards[fromIdx];
		for (let i = index + 1; i < this.cards.length; i++) {
			const candidate = this.cards[i];
			if (candidate.color.toString() !== previousCard.color.toString() && candidate.val < previousCard.val) {
				previousCard = candidate;
			} else {
				return false;
			}
		}

		return true;
	}
	canReceive(cards) {
		if (cards.length === 0) return false;
		return this.cards.length + cards.length <= this.maxCards;
	}
	hasCard(card) {
		this.cards.forEach(candidate => {
			if (candidate === card) return true;
		});

		return false;
	}
	isEmpty() {
		return this.cards.length === 0;
	}
	requiringFaceDirection() {
		return this.frontUp !== null;
	}

	// Getters
	getFrom(idx) {
		return this.cards.slice(idx);
	}
	getNFirst(n) {
		if (!inRange(n, 0, this.cards.length)) return this.cards;
		return this.cards.slice(this.cards.length - n, this.cards.length);
	}
	cardAt(pos) {
		for (let i = this.cards.length - 1; i >= 0; i--) if (this.cards[i].bounds.contains(pos)) return this.cards[i];

		return null;
	}
	indexOf(card) {
		let idx = -1;
		this.cards.forEach((candidate, index) => {
			if (candidate.sign === card.sign && candidate.val === card.val) {
				idx = index;
			}
		});

		return idx;
	}
	spreadedBounds() {
		if (this.squaredUp) return this.bounds;
		if (this.cards.length <= 1) return this.bounds;

		let startX, startY, endX, endY;
		switch (this.direction) {
			case LEFT:
				startX = this.bounds.left - (this.cards.length - 1) * this.spreadDistance;
				startY = this.bounds.top;
				endX = this.bounds.right;
				endY = this.bounds.bottom;
				break;
			case TOP:
				startX = this.bounds.left;
				startY = this.bounds.top - (this.cards.length - 1) * this.spreadDistance;
				endX = this.bounds.right;
				endY = this.bounds.bottom;
				break;
			case RIGHT:
				startX = this.bounds.left;
				startY = this.bounds.top;
				endX = this.bounds.right + (this.cards.length - 1) * this.spreadDistance;
				endY = this.bounds.bottom;
				break;
			case BOTTOM:
				startX = this.bounds.left;
				startY = this.bounds.top;
				endX = this.bounds.right;
				endY = this.bounds.bottom + (this.cards.length - 1) * this.spreadDistance;
				break;
			default:
				console.error(this.direction);
				break;
		}

		const width = endX - startX;
		const height = endY - startY;

		return new Box(createVector(startX, startY), createVector(width, height));
	}
	firstCard() {
		return (!this.isEmpty()) ? this.cards[this.cards.length - 1] : null;
	}
	lastCard() {
		return (!this.isEmpty()) ? this.cards[0] : null;
	}

	// Setters
	setFrontUp(val = null) {
		const old = this.frontUp;
		this.frontUp = val;
		if (val !== null && val !== old) this.cards.forEach(card => card.setFrontUp(val));
	}

	// Modificators
	addCard(card, force = false) {
		if (!this.canReceive([card]) && !force) return false;

		if (this.requiringFaceDirection()) card.setFrontUp(this.frontUp);
		card.deck = this;
		this.cards.push(card);
		if (this.squaredUp) card.bounds.pos.set(this.bounds.left, this.bounds.top); else this.spread();

		return true;
	}
	addCards(cards, force = false) {
		if (!this.canReceive(cards) && !force) return false;

		cards.forEach(card => {
			if (this.requiringFaceDirection()) card.setFrontUp(this.frontUp);
			card.deck = this;
			this.cards.push(card);
			if (this.squaredUp) card.bounds.pos.set(this.bounds.left, this.bounds.top);
		});

		if (!this.squaredUp) this.spread();

		return true;
	}
	takeCard(card, force = false) {
		const idx = this.indexOf(card);
		if (!this.canTakeFrom(idx) && !force) return null;
		return this.cards.splice(idx, 1)[0];
	}
	takeNFirst(n, force = false) {
		if (!this.canTakeFrom(this.cards.length - n) && !force) return [];
		if (n > this.cards.length) return this.cards.splice(0, this.cards.length); else return this.cards.splice(
			this.cards.length - n, n);
	}
	takeFrom(idx, force = false) {
		if (!this.canTakeFrom(idx) && !force) return [];
		return this.cards.splice(idx, this.cards.length - idx + 1);
	}
	takeAll() {
		return this.cards.splice(0, this.cards.length);
	}
	squareUp() {
		this.squaredUp = true;
		this.cards.forEach(card => card.bounds.pos.set(this.bounds.left, this.bounds.top));
	}
	spread() {
		if (this.direction === null) return false;

		this.spreadTo(this.direction);
	}
	spreadTo(direction) {
		this.direction = direction;
		this.squaredUp = false;

		const box = this.spreadedBounds();
		switch (direction) {
			case LEFT:
			case RIGHT:
				this.cards.forEach((card, index) => card.bounds.pos.set(box.left + (index * this.spreadDistance), box.top));
				break;
			case TOP:
			case BOTTOM:
				this.cards.forEach((card, index) => {
					card.bounds.pos.set(box.left, box.top + (index * this.spreadDistance));
				});
				break;
		}
	}
	shuffle() {
		shuffleArray(this.cards);
	}

	// Engine
	update() {
		const bounds = this.spreadedBounds();
		const contains = bounds.contains(GAME.cursor.pos);
		if (contains) {
			let index;
			if (this.squaredUp) {
				index = this.cards.length - 1;
			} else {
				switch (this.direction) {
					case LEFT:
					case RIGHT:
						let relativeCursorX = GAME.cursor.pos.x - bounds.left;
						if (relativeCursorX >= this.cards.length * this.spreadDistance) {
							index = this.cards.length - 1;
						} else {
							index = Math.floor(relativeCursorX / this.spreadDistance);
						}
						break;
					case TOP:
					case BOTTOM:
						let relativeCursorY = GAME.cursor.pos.y - bounds.top;
						if (relativeCursorY >= this.cards.length * this.spreadDistance) {
							index = this.cards.length - 1;
						} else {
							index = Math.floor(relativeCursorY / this.spreadDistance);
						}
						break;
				}
			}
			this.cards.forEach((card, idx) => {
				if (index === idx) card.hover(); else card.blur();
			});
		} else this.cards.forEach(card => card.blur());
	}
	draw() {
		this.cards.forEach(card => card.draw());
	}
}
class Spot extends Deck {
	constructor(name, pos, size) {
		super(pos, size, []);

		this.name = name;
	}

	canReceive(cards) {
		if (this.isEmpty()) {
			return cards[0].val === 13;
		} else {
			if (cards[0].val >= this.firstCard().val) return false;
			return (cards[0].color.toString() === this.firstCard().color.toString());
		}
	}

	draw() {
		const bounds = this.bounds;
		push();

		noFill();
		stroke("black");
		strokeWeight(2);
		strokeCap(ROUND);
		strokeJoin(ROUND);
		beginShape();
		vertex(bounds.left, bounds.top);
		vertex(bounds.right, bounds.top);
		vertex(bounds.right, bounds.bottom);
		vertex(bounds.left, bounds.bottom);
		endShape(CLOSE);

		pop();

		super.draw();
	}
}
class Goal extends Spot {
	constructor(name, pos, size) {
		super(name, pos, size);
	}
	get sign() {
		return (!this.isFree()) ? this.cards[0].sign : null;
	}
	addCard(card, force = false) {
		const add = super.addCard(card, force);
		GAME.winCheck();
		return add;
	}
	addCards(cards, force = false) {
		const add = super.addCards(cards, force);
		GAME.winCheck();
		return add;
	}
	canTakeFrom(idx) {
		return false;
	}
	canReceive(cards) {
		if (this.cards.length === 13) return false;
		if (cards.length === 0) return false;
		if (this.isEmpty()) {
			return cards[0].val === 1;
		} else {
			if (this.cards.length + cards.length > this.maxCards) return false;
			if (cards[0].sign !== this.firstCard().sign) return false;
			return (cards[0].val === this.firstCard().val + 1);
		}
	}

	isFree() {
		return this.isEmpty();
	}
}
class Col extends Spot {
	constructor(name, pos, size) {
		super(name, pos, size);
	}

	canTakeFrom(fromIdx) {
		if (!inRange(fromIdx, 0, this.cards.length - 1)) return false;

		if (this.cards[fromIdx].frontUp === false) return false;
		if (!inRange(fromIdx, 0, this.cards.length - 1)) return false;
		if (fromIdx === this.cards.length - 1) return true;

		let previousCard = this.cards[fromIdx];
		for (let i = fromIdx + 1; i < this.cards.length; i++) {
			if (this.cards[i].color.toString() === previousCard.color.toString()) return false;
			if (this.cards[i].val !== previousCard.val - 1) return false;

			previousCard = this.cards[i];
		}

		return true;
	}
	canReceive(cards) {
		if (cards.length === 0) return false;
		if (this.isEmpty() && cards[0].val === 13) return true;
		if (!this.isEmpty()) {
			if (cards[0].color.toString() === this.firstCard().color.toString()) return false;
			return cards[0].val === this.firstCard().val - 1;
		}
	}
}

class Move {
	constructor(fromDeck, fromIndex, toDeck, force = false) {
		this.from = fromDeck;
		this.fromIdx = fromIndex;
		this.to = toDeck;
		this.toIdx = this.to.cards.length;
		this.cards = [];
		this.force = force;

		this.executed = false;
		this.undoed = false;
	}

	execute() {
		if (!this.from.canTakeFrom(this.fromIdx) && !this.force) {
			console.error("Move can't take from", this.fromIdx);
			return false;
		}
		if (!this.to.canReceive(this.from.getFrom(this.fromIdx)) && !this.force) {
			console.error("Move can't receive", this.from.getFrom(this.fromIdx));
			return false;
		}
		this.cards = this.from.takeFrom(this.fromIdx, this.force);

		if (this.cards.length > 0) {
			this.executed = true;
			if (this.to.addCards(this.cards, this.force)) {
				return true;
			} else {
				console.error("Move execution failed", this);
				return false;
			}
		} else {
			console.error("Trying to move inexistant cards");
			return false;
		}
	}

	undo() {
		console.error("UNDO MOVE !", this);

		if (this.executed === false) return true;
		this.executed = false;

		const cards = this.to.takeFrom(this.toIdx, true);
		if (this.from.addCards(cards, true)) {
			return true;
		} else {
			console.error("Move undo failed");
			return false;
		}
	}
}
class CursorDeck extends Deck {
	constructor(size) {
		super(createVector(winMouseX, winMouseY), size);
		this.pos = createVector(winMouseX, winMouseY);
		this.prevPos = createVector(0, 0);
		this.holdAnchor = createVector(0, 0);
		this.origHoldPos = null;

		this.ctrl = false;
	}

	addCard(card, force = false) {
		if (!this.canReceive([card]) && !force) return false;

		const cardX = card.bounds.left;
		const cardY = card.bounds.top;
		this.origHoldPos = createVector(cardX, cardY);
		const cX = this.pos.x;
		const cY = this.pos.y;
		const x = cX - cardX;
		const y = cY - cardY;
		this.holdAnchor.set(x, y);

		return super.addCard(card, force);
	}
	addCards(cards, force = false) {
		if (!this.canReceive(cards) && !force) return false;

		const cardX = cards[0].bounds.left;
		const cardY = cards[0].bounds.top;
		this.origHoldPos = createVector(cardX, cardY);
		const cX = this.pos.x;
		const cY = this.pos.y;
		const x = cX - cardX;
		const y = cY - cardY;
		this.holdAnchor.set(x, y);

		return super.addCards(cards, force);
	}

	canReceive(cards) {
		if (cards.length === 0) return false;
		return this.isEmpty();
	}

	hold() {
		let spot, card;
		card = cardAt(this.pos.x, this.pos.y);
		if (!card) {
			spot = spotAt(this.pos.x, this.pos.y);
			if (!spot) return (this.isEmpty()) ? false : GAME.undo();

			if (spot === GAME.deck) return GAME.drawRiver();
			card = spot.cardAt(this.pos);
		} else {
			spot = card.deck;
			if (spot === GAME.deck) return GAME.drawRiver();

			if (card.frontUp === false) return (card === spot.firstCard()) ? card.flip() : false;
		}

		if (!card) return false;
		if (!spot.canTakeFrom(spot.indexOf(card))) return false;
		return GAME.move(card.deck, card.deck.indexOf(card), this);
	}
	drop() {
		if (!this.isEmpty()) {
			const spot = spotAt(this.pos.x, this.pos.y);
			if (spot === null) return GAME.undo();
			if (!spot.canReceive(this.cards)) {
				GAME.undo();
				return false;
			}

			if (GAME.move(this, 0, spot)) {
				this.holdAnchor.set(0, 0);
				this.origHoldPos = null;
				return true;
			} else {
				return false;
			}
		}

		return false;
	}
	hasMoved() {
		let x, y, orig;
		if (!this.isEmpty()) {
			x = this.bounds.left;
			y = this.bounds.top;
			orig = this.origHoldPos;
		} else {
			x = this.pos.x;
			y = this.pos.Y;
			orig = this.prevPos;
		}

		return x !== orig.x || y !== orig.y;
	}

	spreadedBounds() {
		const bounds = super.spreadedBounds();
		bounds.pos.x -= this.holdAnchor.x;
		bounds.pos.y -= this.holdAnchor.y;
		return bounds;
	}

	press(btn) {
		if (btn === LEFT) if (this.isEmpty()) this.hold();
	}
	release(btn) {
		if (btn === LEFT) if (this.hasMoved()) this.drop();
	}
	dblClick() {
		const card = (this.isEmpty()) ? cardAt(this.pos.x, this.pos.y) : this.cards[0];
		if (!card || card.frontUp === false) return false;

		let goal = goalForSign(card.sign);
		if (goal === null) goal = firstFreeGoal();

		return GAME.move(card.deck, card.deck.indexOf(card), goal);
	}

	update(deltaTime) {
		this.prevPos.set(pwinMouseX, pwinMouseY);
		this.pos.set(winMouseX, winMouseY);
		this.bounds.pos.set(this.pos.x, this.pos.y);
		if (!this.isEmpty()) this.spread();
	}
}
class Game {
	constructor(seed, cardSize) {
		this.previousFrame = 0;
		this.spots = new Map();
		this.signs = ["♥", "♦", "♣", "♠"];
		this.cardSize = cardSize;
		this.moves = [];
		this.cursor = new CursorDeck(this.cardSize);
		this.seed = seed;

		this.won = false;
		this.onWin = () => {};
		this.onLoose = () => {};

		this.debug = false;
	}

	get deck() {
		return this.spots.get("deck");
	}
	get river() {
		return this.spots.get("river");
	}
	get goals() {
		return this.spots.get("goals");
	}
	get cols() {
		return this.spots.get("cols");
	}
	get lastMove() {
		return this.moves[this.moves.length - 1];
	}

	setDebug(debug) {
		this.debug = debug;
		BUTTONS.forEach(btn => (this.debug) ? btn.show() : btn.hide());
	}

	move(from, fromIdx, to, force = false) {
		const move = new Move(from, fromIdx, to, force);
		this.moves.push(move);
		return move.execute();
	}
	undo() {
		if (this.moves.length > 0) {
			const undo = this.lastMove.undo();
			this.moves.pop();
			return undo;
		}
	}
	winCheck() {
		for (let i = 0; i < this.goals.length - 1; i++) {
			const goal = this.goals[i];
			if (goal.cards.length < 13) {
				console.log("Not win");
				return false;
			}
		}

		// TODO WIN SCREEN
		this.won = true;
		this.onWin.call(this);

		return true;
	}
	looseCheck() {
		// TODO Check if no moves can be done
	}

	init() {
		randomSeed(this.seed);
		this.cursor.spreadTo(BOTTOM);
		this.createBoard();
		this.drawCards();

		// Désactivé pour cause de non-légitimité x')
		// this.drawRiver();
	}
	reset() {
		this.init();
	}
	createBoard() {
		function deckOfCards(size) {
			const deck = [];
			const signs = ["♥", "♦", "♣", "♠"];
			signs.forEach(sign => {
				for (let val = 1; val < 14; val++) deck.push(new Card(val, sign, size));
			});

			return deck;
		}
		function createDeck(size) {
			const deck = new Spot("deck", createVector(10, 10), size);
			deck.setFrontUp(false);

			return deck;
		}
		function createRiver(size) {
			const river = new Deck(createVector(10 + size.x + 10, 10), size);
			river.setFrontUp(true);
			river.spreadTo(RIGHT);
			river.spreadDistance = size.x / 3;
			river.maxCards = 3;

			const origTakeFrom = river.canTakeFrom;
			river.canTakeFrom = (fromIdx) => {
				if (fromIdx < river.cards.length - 1) return false;

				return origTakeFrom.call(river, fromIdx);
			};
			river.spreadedBounds = () => {
				return new Box(river.bounds.pos,
					createVector(river.bounds.width + (2 * river.spreadDistance), river.bounds.height));
			};
			river.spread = () => {
				if (river.isEmpty()) return false;
				const cards = [];
				river.cards.forEach(card => cards.push(card));
				while (cards.length > 0) {
					const triple = cards.splice(cards.length - 3, 3);
					triple.forEach((c, index) => {
						if (c === undefined) triple.splice(index, 1);
					});
					if (cards.length < river.cards.length - 3) triple.forEach(
						card => card.bounds.pos.set(river.bounds.left, river.bounds.top)); else for (let i = 0; i <
					triple.length; i++) triple[i].bounds.pos.set(river.bounds.left + (i * river.spreadDistance),
						river.bounds.top);

				}
			};
			river.update = () => {
				const bounds = river.spreadedBounds();
				const contains = bounds.contains(GAME.cursor.pos);
				if (contains) {
					const card = river.cardAt(GAME.cursor.pos);
					if (card) {
						river.cards.forEach(candidate => {
							if (candidate === card) candidate.hover(); else candidate.blur();
						});
					} else river.cards.forEach(candidate => candidate.blur());
				} else river.cards.forEach(card => card.blur());
			};

			return river;
		}
		function createGoals(size) {
			const goal1 = new Goal("goal1", createVector(10 + size.x * 3 + 30, 10), size);
			const goal2 = new Goal("goal2", createVector(10 + size.x * 4 + 40, 10), size);
			const goal3 = new Goal("goal3", createVector(10 + size.x * 5 + 50, 10), size);
			const goal4 = new Goal("goal4", createVector(10 + size.x * 6 + 60, 10), size);

			return [goal1, goal2, goal3, goal4];
		}
		function createCols(size) {
			const col1 = new Col("col1", createVector(10, size.y + 20), size);
			const col2 = new Col("col2", createVector(10 + size.x + 10, size.y + 20), size);
			const col3 = new Col("col3", createVector(10 + (size.x * 2) + 20, size.y + 20), size);
			const col4 = new Col("col4", createVector(10 + (size.x * 3) + 30, size.y + 20), size);
			const col5 = new Col("col5", createVector(10 + (size.x * 4) + 40, size.y + 20), size);
			const col6 = new Col("col6", createVector(10 + (size.x * 5) + 50, size.y + 20), size);
			const col7 = new Col("col7", createVector(10 + (size.x * 6) + 60, size.y + 20), size);

			return [col1, col2, col3, col4, col5, col6, col7];
		}

		const deck = createDeck(this.cardSize);
		deck.addCards(deckOfCards(this.cardSize), true);
		deck.squareUp();
		deck.shuffle();

		const river = createRiver(this.cardSize);

		const goals = createGoals(this.cardSize);
		goals.forEach(goal => goal.maxCards = 13);

		const cols = createCols(this.cardSize);
		cols.forEach(col => {
			col.maxCards = 52 / 4 * 2;
			col.spreadDistance = this.cardSize.y / 5;
			col.spreadTo(BOTTOM);
		});

		this.spots.set("deck", deck);
		this.spots.set("river", river);
		this.spots.set("goals", goals);
		this.spots.set("cols", cols);
	}
	drawCards() {
		let i;
		for (i = 0; i < this.cols.length; i++) {
			for (let c = i; c < this.cols.length; c++) {
				const card = this.deck.takeNFirst(1);
				if (card.length === 0) return false;

				if (!this.cols[c].addCards(card, true)) console.error("Can't add card", card, this.cols[c]);
			}
		}

		for (i = 0; i < this.cols.length; i++) {
			const card = this.cols[i].firstCard();
			if (card) card.flip();
		}

		return true;
	}
	drawRiver() {
		if (!this.deck.isEmpty()) {
			this.move(this.deck, this.deck.cards.length - 3, this.river, true);
			this.river.spread();
		} else {
			while (!this.river.isEmpty()) {
				let triple = this.river.takeNFirst(3, true);
				this.deck.addCards(triple, true);
			}
			this.deck.spread();
		}
	}
	resize(w, h) {
		resizeCanvas(w, h);
	}

	eachSpot(callable) {
		callable.call(null, this.deck);
		callable.call(null, this.river);
		this.eachGoal(callable);
		this.eachCol(callable);
	}
	eachGoal(callable) {
		this.goals.forEach((goal, idx) => callable.call(null, goal, idx));
	}
	eachCol(callable) {
		this.cols.forEach((col, idx) => callable.call(null, col, idx));
	}

	update(deltaTime) {
		GAME.cursor.update(deltaTime);
		this.eachSpot((spot) => spot.update(deltaTime));
	}
	draw() {
		this.eachSpot((spot) => spot.draw());
		if (this.debug) this.drawDebug();
		this.cursor.draw();

		if (this.won) {
			push();
			const tSize = 100;
			textAlign(CENTER);
			textStyle("gold");
			textSize(tSize);
			text("Gagné !", window.innerWidth / 2, window.innerHeight / 2 + (tSize / 3));

			pop();
		}
	}
	drawDebug() {
		push();
		translate(window.innerWidth - 500, 0);

		function drawDebugFrame() {
			push();

			strokeWeight(3);
			stroke("black");
			fill("white");
			rect(0, 0, 500, window.innerHeight);
			textAlign(CENTER);
			textSize(25);
			textStyle(BOLD);
			noFill();
			text("DEBUG", 250, 30);
			fill("white");
			text("DEBUG", 249, 31);
			line(0, 40, 500, 40);

			pop();
		}
		function drawGameDetails(game) {
			function drawMirrors() {
				const tSize = 30;

				push();
				translate(0, window.innerHeight);
				fill("white");
				stroke("red");
				textSize(tSize);
				textAlign(CENTER);

				game.eachSpot((spot) => {
					push();
					translate(10, -150);
					strokeCap(ROUND);
					strokeJoin(ROUND);
					beginShape();
					vertex(spot.bounds.left / 3, spot.bounds.top / 3);
					vertex(spot.bounds.right / 3, spot.bounds.top / 3);
					vertex(spot.bounds.right / 3, spot.bounds.bottom / 3);
					vertex(spot.bounds.left / 3, spot.bounds.bottom / 3);
					endShape(CLOSE);
					fill("black");
					text(spot.cards.length, spot.bounds.centerX / 3, spot.bounds.centerY / 3 + tSize / 3);
					pop();
				});

				pop();
			}

			push();

			translate(250, 60);

			fill("white");
			stroke("black");
			strokeWeight(3);
			textAlign(LEFT);
			textStyle(BOLD);
			textSize(16);
			textLeading(18);
			text(game.moves.length + " moves", 5, 0);
			text(`${game.deck.cards.length} cards in deck`, 5, 16);
			text(`${game.river.cards.length} cards in river`, 5, 32);
			game.goals.forEach((goal, index) => text(`${goal.cards.length} cards in ${goal.name}`, 5, 48 + (index * 16)));
			game.cols.forEach((col, index) => text(`${col.cards.length} cards in ${col.name}`, 5,
				48 + (game.goals.length * 16) + (index * 16)));

			pop();

			drawMirrors();
		}

		drawDebugFrame();
		drawGameDetails(this);

		pop();
	}
}

function preload() {
	JACK = loadJSON("figures/jack.json");
	QUEEN = loadJSON("figures/queen.json");
	KING = loadJSON("figures/king.json");
}
function setup() {
	function canvas() {
		createCanvas(window.innerWidth, window.innerHeight);
		angleMode(DEGREES);
		colorMode(RGB);
		frameRate(FPS);

		// Clique droit n'ouvre pas le menu contextuel
		window.addEventListener("contextmenu", (e) => {
			e.preventDefault();
		});
	}
	function createCompositors() {
		MAIN_COMP = new Compositor();
		MAIN_COMP.addEventListener("resize", (width, height) => {
			MENU.width = width;
			MENU.height = height;
			DEBUG.position(width - 150, 10);
		});
		MAIN_COMP.addEventListener("keyDown", (code) => {
			switch (code) {
				case DOWN_ARROW:
					MENU.nextItem();
					break;
				case UP_ARROW:
					MENU.prevItem();
					break;
				case ENTER:
					MENU.confirm();
					break;
				default:
					break;
			}
		});
		MAIN_COMP.addEventListener("click", (btn, x, y) => CURSOR.click(x, y));

		GAME_COMP = new Compositor();
		GAME_COMP.addEventListener("resize", (width, height) => {
			GAME.resize(width, height);
			DEBUG.position(width - 150, 10);
		});
		GAME_COMP.addEventListener("keyUp", (code) => {
			switch (code) {
				case 17: // CTRL
					GAME.cursor.ctrl = false;
					break;
			}
		});
		GAME_COMP.addEventListener("keyDown", (code) => {
			switch (code) {
				case 17: // CTRL
					GAME.cursor.ctrl = true;
					break;
				case 90: // Z
					if (GAME.cursor.ctrl) {
						if (GAME.lastMove.from === GAME.cursor) GAME.undo();

						GAME.undo();
					}
					break;
			}
		});
		GAME_COMP.addEventListener("dblClick", () => {
			GAME.cursor.dblClick();
		});
		GAME_COMP.addEventListener("mouseUp", (btn) => {
			GAME.cursor.release(btn);
		});
		GAME_COMP.addEventListener("mouseDown", (btn) => {
			GAME.cursor.press(btn);
		});
	}
	function createCursor() {
		CURSOR = new Cursor();
		MAIN_COMP.layers.push(CURSOR);
	}
	function createMenu() {
		MENU = new Menu("Solitaire", 50);
		MENU.top = 200;

		const play = new MenuItem("JOUER", CENTER);
		play.callback = () => {
			GAME.init();
			DEBUG.show();
			GAME_STATE = GAME_STATES.in_game;
		};

		const stats = new MenuItem("STATISTIQUES", CENTER);
		stats.disabled = true;
		const options = new MenuItem("OPTIONS", CENTER);
		options.disabled = true;

		MENU.pushItem(play);
		MENU.pushItem(stats);
		MENU.pushItem(options);

		MAIN_COMP.layers.push(MENU);
	}
	function createGame() {
		const seed = Math.floor(random(0, 4096));
		const cardW = (window.innerWidth / 2) / 7;
		const cardH = cardW / CARD_RATIO;
		const cardSize = createVector(cardW, cardH);

		GAME = new Game(seed, cardSize);
		GAME_COMP.layers.push(GAME);
	}
	function createButtons() {
		DEBUG = createCheckbox("Debug", GAME.debug);
		DEBUG.position(windowWidth - 150, 10);
		DEBUG.style("color", "black");
		DEBUG.style("font-weight", "bold");
		DEBUG.style("float", "left");
		DEBUG.changed(function () {
			GAME.setDebug(this.checked());
		});
		DEBUG.hide();

		BUTTONS = new Map();

		const seedInput = createInput(GAME.seed, "number");
		seedInput.position(window.innerWidth - 485, window.innerHeight - 250);
		seedInput.changed(() => {
			if (seedInput.value() === undefined || seedInput.value() === "") return false;

			GAME.seed = seedInput.value();
			GAME.reset();
		});
		seedInput.hide();

		const seedSend = createButton("Jouer la seed");
		seedSend.position(seedInput.x + seedInput.width - 1, seedInput.y);
		seedSend.mousePressed(() => {
			if (seedInput.value() === undefined || seedInput.value() === "") return false;

			GAME.seed = seedInput.value();
			GAME.reset();
		});
		seedSend.hide();

		const restartBtn = createButton("Recommencer la seed");
		restartBtn.position(seedSend.x + seedSend.width + 5, seedSend.y);
		restartBtn.mousePressed(() => GAME.reset());
		restartBtn.hide();

		BUTTONS.set("seedInput", seedInput);
		BUTTONS.set("seedSend", seedSend);
		BUTTONS.set("restart", restartBtn);
	}

	canvas();
	createCompositors();
	createCursor();
	createMenu();

	createGame();
	createButtons();
}
function draw() {
	// Remplissage du fond
	background(color(50, 100, 50));

	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.frame(millis());
			break;
		case GAME_STATES.in_game:
			GAME_COMP.frame(millis());
			break;
		case GAME_STATES.main_sub_menu:
			break;
	}
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
 * Shuffles array in place. ES6 version
 *
 * @param {Array} arr items An array containing the items.
 */
function shuffleArray(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
/**
 * Détermine et renvoi la carte pointée par x & y.
 * Si plusieurs cartes se trouvent sur ce point, renvoi la dernière carte dessinée
 *
 * @param {int} x
 * @param {int} y
 * @returns {Card}|null
 */
function cardAt(x, y) {
	const point = createVector(x, y);
	const cards = [];
	GAME.eachSpot((spot) => {
		for (let i = spot.cards.length - 1; i >= 0; i--) {
			if (spot.cards[i].bounds.contains(point)) cards.push(spot.cards[i]);
		}
	});

	return (cards.length > 0) ? cards[0] : null;
}
/**
 * Détermine et renvoi le spot pointé par x & y.
 *
 * @param {number} x
 * @param {number} y
 *
 * @returns {Spot|null}
 */
function spotAt(x, y) {
	const point = createVector(x, y);
	const spots = [];
	GAME.eachSpot((spot) => {
		if (spot.spreadedBounds().contains(point)) spots.push(spot);
	});

	return (spots.length > 0) ? spots[spots.length - 1] : null;
}
/**
 * Trouve et renvoi le premier goal vide.
 *
 * @returns {Goal|null}
 */
function firstFreeGoal() {
	for (let i = 0; i < 4; i++) if (GAME.goals[i].isFree()) return GAME.goals[i];

	return null;
}
/**
 * Trouve et renvoi le goal déstiné à un signe.
 *
 * @param {string} sign
 * @returns {Spot|null}
 */
function goalForSign(sign) {
	for (let i = 0; i < 4; i++) if (GAME.goals[i].sign === sign) return GAME.goals[i];

	return null;
}

/**
 * Renvoi TRUE si `n` se trouve entre `min`(inclus) et `max`(inclus)
 *
 * @param {int} n
 * @param {int} min
 * @param {int} max
 *
 * @returns {boolean}
 */
function inRange(n, min, max) {
	return (n >= min && n <= max);
}

/**
 * Appelé chaque fois qu'un bouton de la souris est "enfoncé"
 */
function touchStarted() {
	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.event("mouseDown", [mouseButton]);
			break;
		case GAME_STATES.in_game:
			GAME_COMP.event("mouseDown", [mouseButton]);
			break;
		default:
			console.error("Event in unknown game state");
			break;
	}
}
/**
 * Appelé lorsqu'on relache le bouton de la souris
 */
function touchEnded() {
	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.event("mouseUp", [mouseButton]);
			break;
		case GAME_STATES.in_game:
			GAME_COMP.event("mouseUp", [mouseButton]);
			break;
		default:
			console.error("Event in unknown game state");
			break;
	}
}
/**
 * Appelée lorsqu'un clic est effectué
 */
function mouseClicked() {
	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.event("click", [mouseButton, mouseX, mouseY]);
			break;
		case GAME_STATES.in_game:
			GAME_COMP.event("click", [mouseButton, mouseX, mouseY]);
			break;
		default:
			console.error("Event in unknown game state");
			break;
	}
}
/**
 * Appelé lorsqu'on double-clique
 */
function doubleClicked() {
	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.event("dblClick", [mouseX, mouseY]);
			break;
		case GAME_STATES.in_game:
			GAME_COMP.event("dblClick", [mouseX, mouseY]);
			break;
		default:
			console.error("Event in unknown game state");
			break;
	}
}
/**
 * Appelée lorsqu'une touche est enfoncée
 */
function keyPressed() {
	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.event("keyDown", [keyCode]);
			break;
		case GAME_STATES.in_game:
			GAME_COMP.event("keyDown", [keyCode]);
			break;
		default:
			console.error("Event in unknown game state");
			break;
	}
}
/**
 * Appelée lorsque une touche est relâchée
 */
function keyReleased() {
	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.event("keyUp", [keyCode]);
			break;
		case GAME_STATES.in_game:
			GAME_COMP.event("keyUp", [keyCode]);
			break;
		default:
			console.error("Event in unknown game state");
			break;
	}
}
/**
 * Appelée lorsque la fenêtre est redimmensionnée
 */
function windowResized() {
	switch (GAME_STATE) {
		case GAME_STATES.main_menu:
			MAIN_COMP.event("resize", [windowWidth, windowHeight]);
			break;
		case GAME_STATES.in_game:
			GAME_COMP.event("resize", [windowWidth, windowHeight]);
			break;
		default:
			console.error("Event in unknown game state");
			break;
	}
	resizeCanvas(windowWidth, windowHeight);
}