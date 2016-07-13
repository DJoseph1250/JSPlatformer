var scale = 20;
// var actorChars = {
// 	Player: "@",
// 	Coin: "o",
// 	Lava: ["=", "|", "v"],
// };
var actorChars = {
	"@": Player,
	"o": Coin,
	"=": Lava, "|": Lava, "v": Lava,
};
var simpleLevelPlan = ["                                                                                ",
   "                                                                                ",
   "                                                                                ",
   "                                                                                ",
   "                                                                                ",
   "                                                                                ",
   "                                                                  xxx           ",
   "                                                   xx      xx    xx!xx          ",
   "                                    o o      xx                  x!!!x          ",
   "                                                                 xx!xx          ",
   "                                   xxxxx                          xvx           ",
   "                                                                            xx  ",
   "  xx                                      o o                                x  ",
   "  x                     o                                                    x  ",
   "  x                                      xxxxx                             o x  ",
   "  x          xxxx       o                                                    x  ",
   "  x  @       x  x                                                xxxxx       x  ",
   "  xxxxxxxxxxxx  xxxxxxxxxxxxxxx   xxxxxxxxxxxxxxxxxxxx     xxxxxxx   xxxxxxxxx  ",
   "                              x   x                  x     x                    ",
   "                              x!!!x                  x!!!!!x                    ",
   "                              x!!!x                  x!!!!!x                    ",
   "                              xxxxx                  xxxxxxx                    ",
   "                                                                                ",
   "                                                                                "];
var simpleLevel = new Level(simpleLevelPlan);
console.log(simpleLevel.width, "by", simpleLevel.height);

function Level(plan) {
	this.width = plan[0].length;
	this.height = plan.length;
	this.grid = [];
	this.actors = [];

	for (var y = 0; y < this.height; y++) {
		var line = plan[y], gridline = [];
		for (var x = 0; x < this.width; x++) {
			var ch = line[x], fieldType = null;
			var Actor = actorChars[ch];	
			if (Actor) {
				this.actors.push(new Actor(new Vector(x,y), ch));
			} else if(ch == 'x') {
				fieldType = 'wall';
			} else if(ch == '!') {
				fieldType = 'lava';
			}
			gridline.push(fieldType);
		}
		this.grid.push(gridline);
	}

	this.player = this.actors.filter(function(actor) {
		return actor.type == 'player';
	})[0];
	this.status = this.finishDelay = null;
}

Level.prototype.isFinished = function(first_argument) {
	return this.status != null && this.finishDelay < 0;
};

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

Vector.prototype.plus = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function(factor) {
	return new Vector(this.x * factor, this.y * factor);
};

function Player(pos) {
	this.pos = pos + (new Vector(0, -0.5));
	this.size = new Vector(0.8, 1.5);
	this.speed = new Vector(0, 0);
}

Player.prototype.type = "player";

function Lava(pos, ch) {
	this.pos = pos;
	this.size = new Vector(1, 1);
	if (ch == "=") {
		this.speed = new Vector(2, 0);
	} else if (ch == "|") {
		this.speed = new Vector(0, 2);
	} else if (ch == "v") {
		this.speed = new Vector(0, 3);
		this.repeatPos = pos;
	}
}

Lava.prototype.type = "lava";

function Coin(pos) {
	this.pos = pos;
	this.size = new Vector(0.6, 0.6);
	this.wobble = Math.random() * Math.PI * 2;
}

Coin.prototype.type = "coin";



function elt(name, className) {
	var elt = document.createElement(name);
	if (className) {elt.className = className;}
	return elt;
}

function DomDisplay(parent, level) {
	this.wrap = parent.appendChild(elt("div", "game"));
	this.level = level;
	this.wrap.appendChild(this.displayBackground());
	this.actorLayer = null;
	this.drawFrame();
	this.drawActors();
}

DomDisplay.prototype.displayBackground = function() {
	var table = elt("table", "background");
	table.style.width = this.level.width * scale + "px";
	this.level.grid.forEach(function(row) {
		var rowElt = table.appendChild(elt("tr"));
		rowElt.style.height = scale + "px";
		row.forEach(function(type) {
			rowElt.appendChild(elt("td", type));
		});
	});
	return table;
};

DomDisplay.prototype.drawActors = function() {
	var wrap = elt("div");
	this.level.actors.forEach(function(actor) {
		var rect = wrap.appendChild(elt("div","actor" + actor.type));
		rect.style.width = actor.size.x * scale + "px";
		rect.style.height = actor.size.y * scale + "px";
		rect.style.left = actor.pos.x * scale + "px";
		rect.style.top = actor.pos.y * scale + "px";
	});
};

DomDisplay.prototype.drawFrame = function() {
	if (this.actorLayer) {
		this.wrap.removeChild(this.actorLayer);
		this.actorLayer = this.wrap.appendChild(drawActors);
		this.wrap.className = "game" + (this.level.status || " ");
		this.scrollPlayerIntoView;
	}
};

DomDisplay.prototype.scrollPlayerIntoView = function() {
	var width = this.wrap.clientWidth,
		height = this.wrap.clientHeight,
		margin = width / 3,
		left = this.wrap.scrollLeft,
		right = left + width,
		top = this.wrap.scrollTop,
		bottom = top + height,
		player = this.level.player,
		center = player.pos.plus(player.size.times(0.5)).times(scale);

	if (center.x < left + margin) {
		this.wrap.scrollLeft = center.x - margin;
	} else if (center.x > left - margin) {
		this.wrap.scrollLeft = center.x + margin - width;
	}

	if (center.y < top + margin) {
		this.wrap.scrollTop = center.y - margin;
	} else if (center.y > top - margin) {
		this.wrap.scrollTop = center.y + margin - height;
	}
};

DomDisplay.prototype.clear = function() {
	this.wrap.parentNode.removeChild(this.wrap);
};
