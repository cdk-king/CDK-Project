var AnimationTimer = function(b, a) { this.easingFunction = a; if(b !== undefined) { this.duration = b } else { this.duration = 1000 } this.stopwatch = new Stopwatch() };
AnimationTimer.prototype = {
	start: function(a) { this.stopwatch.start(a) },
	stop: function(a) { this.stopwatch.stop(a) },
	pause: function(a) { this.stopwatch.pause(a) },
	unpause: function(a) { this.stopwatch.unpause(a) },
	isPaused: function() { return this.stopwatch.isPaused() },
	getElapsedTime: function(b) {
		var a = this.stopwatch.getElapsedTime(b),
			c = a / this.duration;
		if(this.easingFunction === undefined || c === 0 || c > 1) { return a }
		return a * (this.easingFunction(c) / c)
	},
	isRunning: function() { return this.stopwatch.running },
	isExpired: function(a) { return this.stopwatch.getElapsedTime(a) > this.duration },
	reset: function(a) { this.stopwatch.reset(a) }
};
AnimationTimer.makeEaseOutEasingFunction = function(a) { return function(b) { return 1 - Math.pow(1 - b, a * 2) } };
AnimationTimer.makeEaseInEasingFunction = function(a) { return function(b) { return Math.pow(b, a * 2) } };
AnimationTimer.makeEaseOutInEasingFunction = function() { return function(a) { return a + Math.sin(a * 2 * Math.PI) / (2 * Math.PI) } };
AnimationTimer.makeEaseInOutEasingFunction = function() { return function(a) { return a - Math.sin(a * 2 * Math.PI) / (2 * Math.PI) } };
AnimationTimer.makeLinearEasingFunction = function() { return function(a) { return a } };
var BounceBehavior = function(b, a) {
	this.duration = b || 1000;
	this.distance = a * 2 || 100;
	this.bouncing = false;
	this.timer = new AnimationTimer(this.duration, AnimationTimer.makeEaseOutInEasingFunction());
	this.paused = false
};
BounceBehavior.prototype = {
	pause: function(b, a) { if(!this.timer.isPaused()) { this.timer.pause(a) } this.paused = true },
	unpause: function(b, a) { if(this.timer.isPaused()) { this.timer.unpause(a) } this.paused = false },
	startBouncing: function(b, a) {
		this.baseline = b.top;
		this.bouncing = true;
		this.timer.start(a)
	},
	resetTimer: function(a) {
		this.timer.stop(a);
		this.timer.reset(a);
		this.timer.start(a)
	},
	adjustVerticalPosition: function(e, c, d) {
		var b = false,
			a = this.timer.getElapsedTime(d) / this.duration * this.distance;
		if(c < this.duration / 2) { b = true }
		if(b) { e.top = this.baseline - a } else { e.top = this.baseline - this.distance + a }
	},
	execute: function(f, d, g, e, b) { var c, a; if(!this.bouncing) { this.startBouncing(f, d) } else { c = this.timer.getElapsedTime(d); if(this.timer.isExpired(d)) { this.resetTimer(d); return } this.adjustVerticalPosition(f, c, d) } }
};
var CellSwitchBehavior = function(b, c, a, d) {
	this.cells = b;
	this.duration = c || 1000;
	this.trigger = a;
	this.callback = d
};
CellSwitchBehavior.prototype = {
	switchCells: function(b, a) {
		b.originalCells = b.artist.cells;
		b.originalIndex = b.artist.cellIndex;
		b.switchStartTime = a;
		b.artist.cells = this.cells;
		b.artist.cellIndex = 0
	},
	revert: function(b, a) {
		b.artist.cells = b.originalCells;
		b.artist.cellIndex = b.originalIndex;
		if(this.callback) { this.callback(b, this) }
	},
	execute: function(d, b, e, c, a) { if(this.trigger && this.trigger(d, b, e, a)) { if(d.artist.cells !== this.cells) { this.switchCells(d, b) } else { if(b - d.switchStartTime > this.duration) { this.revert(d, b) } } } }
};
CycleBehavior = function(b, a) {
	this.duration = b || 1000;
	this.lastAdvance = 0;
	this.interval = a
};
CycleBehavior.prototype = {
	execute: function(d, b, e, c, a) {
		if(this.lastAdvance === 0) { this.lastAdvance = b }
		if(b - this.lastAdvance > this.duration) {
			d.artist.advance();
			this.lastAdvance = b
		} else {
			if(this.interval && d.artist.cellIndex === 0) {
				if(b - this.lastAdvance > this.interval) {
					d.artist.advance();
					this.lastAdvance = b
				}
			}
		}
	}
};
var PulseBehavior = function(b, a) {
	this.duration = b || 1000;
	this.opacityThreshold = a || 0;
	this.timer = new AnimationTimer(this.duration, AnimationTimer.makeEaseInOutEasingFunction());
	this.paused = false;
	this.pulsating = false
};
PulseBehavior.prototype = {
	pause: function(b, a) { if(!this.timer.isPaused()) { this.timer.pause(a) } this.paused = true },
	unpause: function(b, a) { if(this.timer.isPaused()) { this.timer.unpause(a) } this.paused = false },
	dim: function(b, a) { b.opacity = 1 - ((1 - this.opacityThreshold) * (parseFloat(a) / this.duration)) },
	brighten: function(b, a) { b.opacity += (1 - this.opacityThreshold) * parseFloat(a) / this.duration },
	startPulsing: function(a) {
		this.pulsating = true;
		this.timer.start()
	},
	resetTimer: function() {
		this.timer.stop();
		this.timer.reset();
		this.timer.start()
	},
	execute: function(e, c, f, d, a) { var b; if(!this.pulsating) { this.startPulsing(e) } else { b = this.timer.getElapsedTime(); if(this.timer.isExpired()) { this.resetTimer(); return } if(b < this.duration / 2) { this.dim(e, b) } else { this.brighten(e, b) } } }
};
window.requestNextAnimationFrame = (function() {
	var c = undefined,
		g = undefined,
		f = undefined,
		e = 0,
		d = navigator.userAgent,
		b = 0,
		a = this;
	if(window.webkitRequestAnimationFrame) {
		g = function(h) { if(h === undefined) { h = +new Date() } a.callback(h) };
		c = window.webkitRequestAnimationFrame;
		window.webkitRequestAnimationFrame = function(i, h) {
			a.callback = i;
			c(g, h)
		}
	}
	if(window.mozRequestAnimationFrame) { b = d.indexOf("rv:"); if(d.indexOf("Gecko") != -1) { e = d.substr(b + 3, 3); if(e === "2.0") { window.mozRequestAnimationFrame = undefined } } }
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(k, i) {
		var j, h;
		window.setTimeout(function() {
			j = +new Date();
			k(j);
			h = +new Date();
			a.timeout = 1000 / 60 - (h - j)
		}, a.timeout)
	}
})();
var COREHTML5 = COREHTML5 || {};
COREHTML5.Slider = function(d, a, c, b) {
	c = c || 0;
	b = b || 1000;
	this.railCanvas = document.createElement("canvas");
	this.railContext = this.railCanvas.getContext("2d");
	this.changeEventListeners = [];
	this.railCanvas.style.cursor = "pointer";
	this.initializeConstants();
	this.initializeStrokeAndFillStyles(d, a);
	this.initializeKnob(c, b);
	this.createDOMTree();
	this.addMouseListeners();
	this.addKnobTransitionListeners();
	return this
};
COREHTML5.Slider.prototype = {
	initializeConstants: function() {
		this.SHADOW_COLOR = "rgba(100, 100, 100, 0.4)";
		this.SHADOW_OFFSET_X = 3;
		this.SHADOW_OFFSET_Y = 3;
		this.SHADOW_BLUR = 4;
		this.KNOB_SHADOW_COLOR = "rgba(255,255,0,0.8)";
		this.KNOB_SHADOW_OFFSET_X = 1;
		this.KNOB_SHADOW_OFFSET_Y = 1;
		this.KNOB_SHADOW_BLUR = 0;
		this.KNOB_FILL_STYLE = "rgba(255, 255, 255, 0.45)";
		this.KNOB_STROKE_STYLE = "rgba(0, 0, 80, 0.5)";
		this.HORIZONTAL_MARGIN = 2.5 * this.SHADOW_OFFSET_X;
		this.VERTICAL_MARGIN = 2.5 * this.SHADOW_OFFSET_Y;
		this.DEFAULT_STROKE_STYLE = "gray";
		this.DEFAULT_FILL_STYLE = "skyblue"
	},
	initializeStrokeAndFillStyles: function(b, a) {
		this.strokeStyle = b ? b : this.DEFAULT_STROKE_STYLE;
		this.fillStyle = a ? a : this.DEFAULT_FILL_STYLE
	},
	initializeKnob: function(b, a) {
		this.animatingKnob = false;
		this.draggingKnob = false;
		this.knobPercent = b;
		this.knobAnimationDuration = a;
		this.createKnobCanvas()
	},
	createKnobCanvas: function() {
		this.knobCanvas = document.createElement("canvas");
		this.knobContext = this.knobCanvas.getContext("2d");
		this.knobCanvas.style.position = "absolute";
		this.knobCanvas.style.marginLeft = "0px";
		this.knobCanvas.style.marginTop = "1px";
		this.knobCanvas.style.zIndex = "1";
		this.knobCanvas.style.cursor = "crosshair";
		this.activateKnobAnimation();
		this.knobCanvas.style.webkitAnimationTimingFunction = "ease-out";
		this.knobCanvas.style.mozAnimationTimingFunction = "ease-out";
		this.knobCanvas.style.oAnimationTimingFunction = "ease-out"
	},
	createDOMTree: function() {
		var a = this;
		this.domElement = document.createElement("div");
		this.domElement.appendChild(this.knobCanvas);
		this.domElement.appendChild(this.railCanvas)
	},
	appendTo: function(a) {
		document.getElementById(a).appendChild(this.domElement);
		this.setCanvasSize();
		this.resize()
	},
	setCanvasSize: function() {
		var a = this.domElement.parentNode;
		this.railCanvas.width = a.offsetWidth;
		this.railCanvas.height = a.offsetHeight
	},
	resize: function() {
		this.cornerRadius = (this.railCanvas.height / 2 - 2 * this.VERTICAL_MARGIN) / 2;
		this.top = this.HORIZONTAL_MARGIN;
		this.left = this.VERTICAL_MARGIN;
		this.right = this.left + this.railCanvas.width - 2 * this.HORIZONTAL_MARGIN;
		this.bottom = this.top + this.railCanvas.height - 2 * this.VERTICAL_MARGIN;
		this.knobRadius = this.railCanvas.height / 2 - this.railContext.lineWidth;
		this.knobCanvas.style.width = this.knobRadius * 2 + "px";
		this.knobCanvas.style.height = this.knobRadius * 2 + "px";
		this.knobCanvas.width = this.knobRadius * 2;
		this.knobCanvas.height = this.knobRadius * 2
	},
	trackKnobAnimation: function(g, f) {
		var e = 0,
			b = 60,
			d = this,
			c = d.knobAnimationDuration / 1000 * b,
			a;
		a = setInterval(function(h) {
			if(d.animatingKnob) {
				d.knobPercent = g + ((f - g) / c * e++);
				d.knobPercent = d.knobPercent > 1 ? 1 : d.knobPercent;
				d.knobPercent = d.knobPercent < 0 ? 0 : d.knobPercent;
				if(e > 1) { d.fireChangeEvent(h) }
			} else {
				d.knobPercent = f;
				d.draggingKnob = false;
				clearInterval(a);
				e = 0
			}
		}, d.knobAnimationDuration / c)
	},
	activateKnobAnimation: function() {
		var a = "margin-left " + (this.knobAnimationDuration / 1000).toFixed(1) + "s";
		this.knobCanvas.style.webkitTransition = a;
		this.knobCanvas.style.MozTransition = a;
		this.knobCanvas.style.OTransition = a
	},
	deactivateKnobAnimation: function() {
		this.knobCanvas.style.webkitTransition = "margin-left 0s";
		this.knobCanvas.style.MozTransition = "margin-left 0s";
		this.knobCanvas.style.OTransition = "margin-left 0s"
	},
	addMouseListeners: function() {
		var a = this;
		this.knobCanvas.addEventListener("mousedown", function(b) {
			a.draggingKnob = true;
			b.preventDefault()
		});
		this.railCanvas.onmousedown = function(f) {
			var b = a.windowToCanvas(f.clientX, f.clientY),
				d, c;
			f.preventDefault();
			a.knobPercent = a.knobPositionToPercent(b.x);
			d = a.knobPercent;
			c = a.knobPositionToPercent(b.x);
			a.animatingKnob = true;
			a.trackKnobAnimation(d, c);
			a.knobPercent = c;
			a.erase();
			a.draw()
		};
		this.knobCanvas.addEventListener("mousemove", function(d) {
			var b = null,
				c = null;
			d.preventDefault();
			if(a.draggingKnob) {
				a.deactivateKnobAnimation();
				b = a.windowToCanvas(d.clientX, d.clientY);
				c = a.knobPositionToPercent(b.x);
				if(c >= 0 && c <= 1) {
					a.fireChangeEvent(d);
					a.erase();
					a.draw(c)
				}
			}
		}, false);
		this.knobCanvas.addEventListener("mouseup", function(c) {
			var b = null;
			c.preventDefault();
			if(a.draggingKnob) {
				a.draggingKnob = false;
				a.animatingKnob = false;
				a.activateKnobAnimation()
			}
		}, false)
	},
	addKnobTransitionListeners: function() {
		var c = ["webkit", "o"],
			b = this;
		for(var a = 0; a < c.length; ++a) { this.knobCanvas.addEventListener(c[0] + "TransitionEnd", function(d) { b.animatingKnob = false }) } this.knobCanvas.addEventListener("transitionend", function(d) { b.animatingKnob = false })
	},
	fireChangeEvent: function(b) { for(var a = 0; a < this.changeEventListeners.length; ++a) { this.changeEventListeners[a](b) } },
	addChangeListener: function(a) { this.changeEventListeners.push(a) },
	mouseInKnob: function(b) {
		var a = this.knobPercentToPosition(this.knobPercent);
		this.railContext.beginPath();
		this.railContext.arc(a, this.railCanvas.height / 2, this.knobRadius, 0, Math.PI * 2);
		return this.railContext.isPointInPath(b.x, b.y)
	},
	mouseInRail: function(a) {
		this.railContext.beginPath();
		this.railContext.rect(this.left, 0, this.right - this.left, this.bottom);
		return this.railContext.isPointInPath(a.x, a.y)
	},
	windowToCanvas: function(a, c) { var b = this.railCanvas.getBoundingClientRect(); return { x: a - b.left * (this.railCanvas.width / b.width), y: c - b.top * (this.railCanvas.height / b.height) } },
	knobPositionToPercent: function(a) {
		var b = this.right - this.left - 2 * this.knobRadius;
		percent = (a - this.left - this.knobRadius) / b;
		percent = percent > 1 ? 1 : percent;
		percent = percent < 0 ? 0 : percent;
		return percent
	},
	knobPercentToPosition: function(a) { if(a > 1) { a = 1 } if(a < 0) { a = 0 } var b = this.right - this.left - 2 * this.knobRadius; return a * b + this.left + this.knobRadius },
	moveKnob: function(a) { this.knobCanvas.style.marginLeft = a - this.knobCanvas.width / 2 + "px" },
	fillKnob: function() {
		this.knobContext.save();
		this.knobContext.beginPath();
		this.knobContext.arc(this.knobCanvas.width / 2, this.knobCanvas.height / 2, this.knobCanvas.width / 2 - 2, 0, Math.PI * 2, false);
		this.knobContext.clip();
		this.knobContext.fillStyle = this.KNOB_FILL_STYLE;
		this.knobContext.fill();
		this.knobContext.restore()
	},
	strokeKnob: function() {
		this.knobContext.save();
		this.knobContext.lineWidth = 1;
		this.knobContext.strokeStyle = this.KNOB_STROKE_STYLE;
		this.knobContext.stroke();
		this.knobContext.restore()
	},
	drawKnob: function(a) {
		if(a < 0) { a = 0 }
		if(a > 1) { a = 1 } this.knobPercent = a;
		this.moveKnob(this.knobPercentToPosition(a));
		this.fillKnob();
		this.strokeKnob()
	},
	drawRail: function() {
		var a = (this.bottom - this.top) / 2;
		this.railContext.save();
		this.railContext.shadowColor = this.SHADOW_COLOR;
		this.railContext.shadowOffsetX = this.SHADOW_OFFSET_X;
		this.railContext.shadowOffsetY = this.SHADOW_OFFSET_Y;
		this.railContext.shadowBlur = this.SHADOW_BLUR;
		this.railContext.beginPath();
		this.railContext.moveTo(this.left + a, this.top);
		this.railContext.arcTo(this.right, this.top, this.right, this.bottom, a);
		this.railContext.arcTo(this.right, this.bottom, this.left, this.bottom, a);
		this.railContext.arcTo(this.left, this.bottom, this.left, this.top, a);
		this.railContext.arcTo(this.left, this.top, this.right, this.top, a);
		this.railContext.closePath();
		this.railContext.fillStyle = this.fillStyle;
		this.railContext.fill();
		this.railContext.shadowColor = undefined;
		this.railContext.restore();
		this.overlayRailGradient();
		this.railContext.restore()
	},
	overlayRailGradient: function() {
		var a = this.railContext.createLinearGradient(this.left, this.top, this.left, this.bottom);
		a.addColorStop(0, "rgba(255,255,255,0.4)");
		a.addColorStop(0.2, "rgba(255,255,255,0.6)");
		a.addColorStop(0.25, "rgba(255,255,255,0.7)");
		a.addColorStop(0.3, "rgba(255,255,255,0.9)");
		a.addColorStop(0.4, "rgba(255,255,255,0.7)");
		a.addColorStop(0.45, "rgba(255,255,255,0.6)");
		a.addColorStop(0.6, "rgba(255,255,255,0.4)");
		a.addColorStop(1, "rgba(255,255,255,0.1)");
		this.railContext.fillStyle = a;
		this.railContext.fill();
		this.railContext.lineWidth = 0.4;
		this.railContext.strokeStyle = this.strokeStyle;
		this.railContext.stroke()
	},
	draw: function(a) {
		this.drawRail();
		this.drawKnob(a === undefined ? this.knobPercent : a)
	},
	erase: function() {
		this.railContext.clearRect(this.left - this.knobRadius, 0 - this.knobRadius, this.railCanvas.width + 4 * this.knobRadius, this.railCanvas.height + 3 * this.knobRadius);
		this.knobContext.clearRect(0, 0, this.knobCanvas.width, this.knobCanvas.height)
	},
	redraw: function(a) {
		this.erase();
		this.draw(a)
	}
};
var SmokingHole = function(c, b, e, d, a) {
	this.smokeBubbles = [];
	this.fireParticles = [];
	this.disguiseAsSprite(e, d, a);
	this.createFireParticles(b, e, d);
	this.createSmokeBubbles(c, e, d);
	this.smokeBubbleCursor = 0
};
SmokingHole.prototype = {
	addBehaviors: function() {
		this.behaviors = [{
			pause: function(b, a) { for(i = 0; i < b.smokeBubbles.length; ++i) { b.smokeBubbles[i].pause(a) } },
			unpause: function(b, a) { for(i = 0; i < b.smokeBubbles.length; ++i) { b.smokeBubbles[i].unpause(a) } },
			execute: function(d, b, e, c, a) {
				if(d.hasMoreSmokeBubbles()) {
					d.emitSmokeBubble();
					d.advanceCursor()
				}
			}
		}]
	},
	disguiseAsSprite: function(c, b, a) {
		this.addSpriteProperties(c, b, a);
		this.addSpriteMethods();
		this.addBehaviors()
	},
	addSpriteProperties: function(c, b, a) {
		this.type = "smoking hole";
		this.top = b;
		this.left = c;
		this.width = a;
		this.height = a;
		this.visible = true
	},
	addSpriteMethods: function() {
		this.draw = function(a) {
			this.drawFireParticles(a);
			this.drawSmokeBubbles(a)
		};
		this.update = function(b, e, d, a) { this.updateSmokeBubbles(b, e, d, a); for(var c = 0; c < this.behaviors.length; ++c) { this.behaviors[c].execute(this, b, e, d, a) } }
	},
	createFireParticleArtist: function(d, c, a) {
		var b = "rgba(255,255,0,";
		return {
			draw: function(f, e) {
				e.save();
				e.fillStyle = b + Math.random().toFixed(2) + ");";
				e.beginPath();
				e.arc(f.left, f.top, f.radius * 1.5, 0, Math.PI * 2, false);
				e.fill();
				e.restore()
			}
		}
	},
	createFireParticle: function(d, c, a) {
		var b = new Sprite("fire particle", this.createFireParticleArtist(d, c, a));
		b.left = d;
		b.top = c;
		b.radius = a;
		b.visible = true;
		return b
	},
	createFireParticles: function(b, d, c) {
		var a, e;
		for(i = 0; i < b; ++i) {
			a = Math.random() * 1.5;
			e = Math.random() * (a * 2);
			if(i % 2 === 0) { fireParticle = this.createFireParticle(d + e, c - e, a) } else { fireParticle = this.createFireParticle(d - e, c + e, a) } this.fireParticles.push(fireParticle)
		}
	},
	setInitialSmokeBubbleColor: function(a, c) {
		var b = "rgba(255,104,31,0.3)",
			d = "rgba(255,255,0,0.3)",
			e = "rgba(0,0,0,0.5)";
		if(c <= 5) { a.fillStyle = e } else { if(c <= 8) { a.fillStyle = d } else { if(c <= 10) { a.fillStyle = b } else { a.fillStyle = "rgb(" + (220 + Math.random() * 35).toFixed(0) + "," + (220 + Math.random() * 35).toFixed(0) + "," + (220 + Math.random() * 35).toFixed(0) + ")" } } }
	},
	createSmokeBubbles: function(b, d, c) { var a; for(i = 0; i < b; ++i) { if(i % 2 === 0) { a = this.createBubbleSprite(d + Math.random() * 3, c - Math.random() * 3, 1, Math.random() * 8, Math.random() * 5) } else { a = this.createBubbleSprite(d + Math.random() * 10, c + Math.random() * 6, 1, Math.random() * 8, Math.random() * 5) } this.setInitialSmokeBubbleColor(a, i); if(i < 10) { a.dissipatesSlowly = true } this.smokeBubbles.push(a) } },
	drawFireParticles: function(b) { for(var a = 0; a < this.fireParticles.length; ++a) { this.fireParticles[a].draw(b) } },
	drawSmokeBubbles: function(b) { for(var a = 0; a < this.smokeBubbles.length; ++a) { this.smokeBubbles[a].draw(b) } },
	updateSmokeBubbles: function(b, e, d, a) { for(var c = 0; c < this.smokeBubbles.length; ++c) { this.smokeBubbles[c].update(b, e, d, a) } },
	hasMoreSmokeBubbles: function() { return this.smokeBubbleCursor !== this.smokeBubbles.length - 1 },
	emitSmokeBubble: function() { this.smokeBubbles[this.smokeBubbleCursor].visible = true },
	advanceCursor: function() { if(this.smokeBubbleCursor <= this.smokeBubbles.length - 1) {++this.smokeBubbleCursor } else { this.smokeBubbleCursor = 0 } },
	createBubbleArtist: function() {
		return {
			draw: function(b, a) {
				var c = Math.PI * 2;
				if(b.radius > 0) {
					a.save();
					a.beginPath();
					a.fillStyle = b.fillStyle;
					a.arc(b.left, b.top, b.radius, 0, c, false);
					a.fill();
					a.restore()
				}
			}
		}
	},
	createDissipateBubbleBehavior: function() {
		return {
			FULLY_OPAQUE: 1,
			BUBBLE_EXPANSION_RATE: 15,
			BUBBLE_SLOW_EXPANSION_RATE: 10,
			BUBBLE_X_SPEED_FACTOR: 8,
			BUBBLE_Y_SPEED_FACTOR: 16,
			execute: function(d, b, e, c, a) {
				if(!d.timer.isRunning()) { d.timer.start(b) } else {
					if(!d.timer.isExpired(b)) { this.dissipateBubble(d, b, e, a) } else {
						d.timer.reset(b);
						this.resetBubble(d, b)
					}
				}
			},
			dissipateBubble: function(d, c, e, a) {
				var b = d.timer.getElapsedTime(c),
					f = (c - a) / 1000;
				d.left += d.velocityX * f;
				d.top -= d.velocityY * f;
				d.opacity = this.FULLY_OPAQUE - b / d.timer.duration;
				if(d.dissipatesSlowly) { d.radius += this.BUBBLE_SLOW_EXPANSION_RATE * f } else { d.radius += this.BUBBLE_EXPANSION_RATE * f }
			},
			resetBubble: function(b, a) {
				b.opacity = this.FULLY_OPAQUE;
				b.left = b.originalLeft;
				b.top = b.originalTop;
				b.radius = b.originalRadius;
				b.velocityX = Math.random() * this.BUBBLE_X_SPEED_FACTOR;
				b.velocityY = Math.random() * this.BUBBLE_Y_SPEED_FACTOR;
				b.opacity = 0
			}
		}
	},
	setBubbleSpriteProperties: function(d, f, e, b, c, a) {
		d.left = f;
		d.top = e;
		d.radius = b;
		d.originalLeft = f;
		d.originalTop = e;
		d.originalRadius = b;
		d.velocityX = c;
		d.velocityY = a
	},
	createBubbleSpriteTimer: function(a, b) {
		a.timer = new AnimationTimer(b, AnimationTimer.makeEaseOutEasingFunction(1.5));
		a.pause = function(c) { this.timer.pause(c) };
		a.unpause = function(c) { this.timer.unpause(c) }
	},
	createBubbleSprite: function(f, e, b, c, a) {
		var d = 10000;
		sprite = new Sprite("smoke bubble", this.createBubbleArtist(), [this.createDissipateBubbleBehavior()]);
		this.setBubbleSpriteProperties(sprite, f, e, b, c, a);
		this.createBubbleSpriteTimer(sprite, d);
		return sprite
	},
};
SpriteSheetArtist = function(b, a) {
	this.cells = a;
	this.spritesheet = b;
	this.cellIndex = 0
};
SpriteSheetArtist.prototype = {
	draw: function(c, b) {
		var a = this.cells[this.cellIndex];
		b.drawImage(this.spritesheet, a.left, a.top, a.width, a.height, c.left, c.top, a.width, a.height)
	},
	advance: function() {
		if(this.cellIndex === this.cells.length - 1) { this.cellIndex = 0 } else { this.cellIndex++ }
	}
};
var Sprite = function(e, b, a) {
	var c = 10,
		d = 10,
		f = 1;
	this.artist = b;
	this.type = e;
	this.behaviors = a || [];
	this.hOffset = 0;
	this.left = 0;
	this.top = 0;
	this.width = c;
	this.height = d;
	this.velocityX = 0;
	this.velocityY = 0;
	this.opacity = f;
	this.visible = true;
	this.showCollisionRectangle = false;
	this.collisionMargin = { left: 0, right: 0, top: 0, bottom: 0 }
};
Sprite.prototype = {
	calculateCollisionRectangle: function() {
		return 
		{ 
			left: this.left - this.hOffset + this.collisionMargin.left,
			right: this.left - this.hOffset + this.width - this.collisionMargin.right,
			top: this.top + this.collisionMargin.top,
			bottom: this.top + this.collisionMargin.top + this.height - this.collisionMargin.bottom,
			centerX: this.left + this.width / 2,
			centerY: this.top + this.height / 2 
		} 
	},
	drawCollisionRectangle: function(b) {
		var d = "white",
			a = 2,
			c = this.calculateCollisionRectangle();
		b.save();
		b.beginPath();
		b.strokeStyle = d;
		b.lineWidth = a;
		b.strokeRect(c.left + this.hOffset, c.top, c.right - c.left, c.bottom - c.top);
		b.restore()
	},
	draw: function(a) {
		a.save();
		a.globalAlpha = this.opacity;
		if(this.visible && this.artist) { this.artist.draw(this, a) }
		if(this.showCollisionRectangle) { this.drawCollisionRectangle(a) } a.restore()
	},
	update: function(b, e, d, a) {
		for(var c = 0; c < this.behaviors.length; ++c) {
			this.behaviors[c].execute(this, b, e, d, a)
		}
	},
};
var Stopwatch = function() {
	this.startTime = 0;
	this.running = false;
	this.elapsed = undefined;
	this.paused = false;
	this.startPause = 0;
	this.totalPausedTime = 0
};
Stopwatch.prototype = {
	start: function(a) {
		this.startTime = a ? a : +new Date();
		this.elapsedTime = undefined;
		this.running = true;
		this.totalPausedTime = 0;
		this.startPause = 0
	},
	stop: function(a) {
		if(this.paused) { this.unpause() } this.elapsed = (a ? a : +new Date()) - this.startTime - this.totalPausedTime;
		this.running = false
	},
	pause: function(a) {
		if(this.paused) { return } this.startPause = a ? a : +new Date();
		this.paused = true
	},
	unpause: function(a) {
		if(!this.paused) { return } this.totalPausedTime += (a ? a : +new Date()) - this.startPause;
		this.startPause = 0;
		this.paused = false
	},
	isPaused: function() { return this.paused },
	getElapsedTime: function(a) { if(this.running) { return(a ? a : +new Date()) - this.startTime - this.totalPausedTime } else { return this.elapsed } },
	isRunning: function() { return this.running },
	reset: function(a) {
		this.elapsed = 0;
		this.startTime = a ? a : +new Date();
		this.elapsedTime = undefined;
		this.running = false
	}
};
var TimeSystem = function() {
	this.transducer = function(a) { return a };
	this.timer = new AnimationTimer();
	this.lastTimeTransducerWasSet = 0;
	this.gameTime = 0
};
TimeSystem.prototype = {
	start: function() { this.timer.start() },
	reset: function() {
		this.timer.stop();
		this.timer.reset();
		this.timer.start();
		this.lastTimeTransducerWasSet = this.gameTime
	},
	setTransducer: function(d, c) {
		var b = this.transducer,
			a = this;
		this.calculateGameTime();
		this.reset();
		this.transducer = d;
		if(c) { setTimeout(function(f) { a.setTransducer(b) }, c) }
	},
	calculateGameTime: function() {
		this.gameTime = this.lastTimeTransducerWasSet + this.transducer(this.timer.getElapsedTime());
		this.reset();
		return this.gameTime
	}
};
var SnailBait = function() {
	this.canvas = document.getElementById("snailbait-game-canvas");
	this.context = this.canvas.getContext("2d");
	this.fpsElement = document.getElementById("snailbait-fps");
	this.CANVAS_WIDTH_IN_METERS = 13;
	this.PIXELS_PER_METER = this.canvas.width / this.CANVAS_WIDTH_IN_METERS;
	this.rulerCanvas = document.getElementById("snailbait-ruler-canvas");
	this.rulerContext = this.rulerCanvas.getContext("2d");
	this.initialCursor = this.rulerCanvas.style.cursor;
	this.mobileInstructionsVisible = false;
	this.mobileStartToast = document.getElementById("snailbait-mobile-start-toast");
	this.mobileWelcomeToast = document.getElementById("snailbait-mobile-welcome-toast");
	this.welcomeStartLink = document.getElementById("snailbait-welcome-start-link");
	this.showHowLink = document.getElementById("snailbait-show-how-link");
	this.mobileStartLink = document.getElementById("snailbait-mobile-start-link");
	this.timeSystem = new TimeSystem();
	this.timeRate = 1;
	this.SHORT_DELAY = 50;
	this.TIME_RATE_DURING_TRANSITIONS = 0.2;
	this.NORMAL_TIME_RATE = 1;
	this.MAX_TIME_RATE = 2;
	this.serverAvailable = true;
	try { this.serverSocket = new io.connect("http://corehtml5canvas.com:98") } catch(a) { this.serverAvailable = false } this.score = 0;
	this.highScoreElement = document.getElementById("snailbait-high-score-toast");
	this.highScoreListElement = document.getElementById("snailbait-high-score-list");
	this.highScoreNameElement = document.getElementById("snailbait-high-score-name");
	this.highScoreNewGameElement = document.getElementById("snailbait-high-score-new-game");
	this.highScoreAddScoreElement = document.getElementById("snailbait-high-score-add-score");
	this.highScoreNamePending = false;
	this.HIGH_SCORE_TRANSITION_DURATION = 1000;
	this.developerBackdoorElement = document.getElementById("snailbait-developer-backdoor");
	this.collisionRectanglesCheckboxElement = document.getElementById("snailbait-collision-rectangles-checkbox");
	this.detectRunningSlowlyCheckboxElement = document.getElementById("snailbait-detect-running-slowly-checkbox");
	this.smokingHolesCheckboxElement = document.getElementById("snailbait-smoking-holes-checkbox");
	this.runningSlowlyReadoutElement = document.getElementById("snailbait-running-slowly-readout");
	this.timeRateReadoutElement = document.getElementById("snailbait-time-rate-readout");
	this.developerBackdoorVisible = false;
	this.developerBackdoorSlidersInitialized = false;
	this.runningSlowlySlider = new COREHTML5.Slider("blue", "royalblue");
	this.timeRateSlider = new COREHTML5.Slider("brickred", "red");
	this.showSmokingHoles = true;
	this.musicElement = document.getElementById("snailbait-music");
	this.musicElement.volume = 0.1;
	this.musicCheckboxElement = document.getElementById("snailbait-music-checkbox");
	this.musicOn = this.musicCheckboxElement.checked;
	this.soundCheckboxElement = document.getElementById("snailbait-sound-checkbox");
	this.audioSprites = document.getElementById("snailbait-audio-sprites");
	this.soundOn = this.soundCheckboxElement.checked;
	this.cannonSound = { position: 7.7, duration: 1031, volume: 0.5 };
	this.coinSound = { position: 7.1, duration: 588, volume: 0.5 };
	this.electricityFlowingSound = { position: 1.03, duration: 1753, volume: 0.5 };
	this.explosionSound = { position: 4.3, duration: 760, volume: 1 };
	this.pianoSound = { position: 5.6, duration: 395, volume: 0.5 };
	this.thudSound = { position: 3.1, duration: 809, volume: 1 };
	this.audioChannels = [{ playing: false, audio: this.audioSprites, }, { playing: false, audio: null, }, { playing: false, audio: null, }, { playing: false, audio: null }];
	this.audioSpriteCountdown = this.audioChannels.length - 1;
	this.graphicsReady = false;
	this.LEFT = 1, this.RIGHT = 2, this.GRAVITY_FORCE = 9.81;
	this.SHORT_DELAY = 50;
	this.TRANSPARENT = 0, this.OPAQUE = 1, this.BACKGROUND_VELOCITY = 25, this.RUN_ANIMATION_RATE = 30, this.PLATFORM_HEIGHT = 8, this.PLATFORM_STROKE_WIDTH = 2, this.PLATFORM_STROKE_STYLE = "rgb(0,0,0)", this.RUNNER_EXPLOSION_DURATION = 500, this.RUNNER_LEFT = 50, this.BAD_GUYS_EXPLOSION_DURATION = 1500, this.BACKGROUND_WIDTH = 1102;
	this.BACKGROUND_HEIGHT = 400;
	this.livesElement = document.getElementById("snailbait-lives");
	this.lifeIconLeft = document.getElementById("snailbait-life-icon-left");
	this.lifeIconMiddle = document.getElementById("snailbait-life-icon-middle");
	this.lifeIconRight = document.getElementById("snailbait-life-icon-right");
	this.MAX_NUMBER_OF_LIVES = 3;
	this.lives = this.MAX_NUMBER_OF_LIVES;
	this.FPS_SLOW_CHECK_INTERVAL = 2000;
	this.DEFAULT_RUNNING_SLOWLY_THRESHOLD = 40;
	this.MAX_RUNNING_SLOWLY_THRESHOLD = 60;
	this.RUNNING_SLOWLY_FADE_DURATION = 2000;
	this.runningSlowlyElement = document.getElementById("snailbait-running-slowly");
	this.slowlyOkayElement = document.getElementById("snailbait-slowly-okay");
	this.slowlyDontShowElement = document.getElementById("snailbait-slowly-dont-show");
	this.slowlyWarningElement = document.getElementById("snailbait-slowly-warning");
	this.runningSlowlyThreshold = this.DEFAULT_RUNNING_SLOWLY_THRESHOLD;
	this.lastSlowWarningTime = 0;
	this.showSlowWarning = false;
	this.lastFpsCheckTime = 0;
	this.speedSamples = [60, 60, 60, 60, 60, 60, 60, 60, 60, 60];
	this.speedSamplesIndex = 0;
	this.NUM_SPEED_SAMPLES = this.speedSamples.length;
	this.creditsElement = document.getElementById("snailbait-credits");
	this.playAgainLink = document.getElementById("snailbait-play-again-link");
	this.BUTTON_PACE_VELOCITY = 80;
	this.SNAIL_PACE_VELOCITY = 50;
	this.loadingElement = document.getElementById("snailbait-loading");
	this.loadingTitleElement = document.getElementById("snailbait-loading-title");
	this.loadingAnimatedGIFElement = document.getElementById("snailbait-loading-animated-gif");
	this.TRACK_1_BASELINE = 323;
	this.TRACK_2_BASELINE = 223;
	this.TRACK_3_BASELINE = 123;
	this.PLATFORM_VELOCITY_MULTIPLIER = 4.35;
	this.STARTING_BACKGROUND_VELOCITY = 0;
	this.STARTING_BACKGROUND_OFFSET = 0;
	this.STARTING_SPRITE_OFFSET = 0;
	this.paused = false;
	this.PAUSED_CHECK_INTERVAL = 200;
	this.windowHasFocus = true;
	this.countdownInProgress = false;
	this.gameStarted = false;
	this.playing = false;
	this.stalled = false;
	this.spritesheet = new Image();
	this.lastAnimationFrameTime = 0;
	this.lastFpsUpdateTime = 0;
	this.fps = 60;
	this.toastElement = document.getElementById("snailbait-toast");
	this.originalFont = this.toastElement.style.font;
	this.instructionsElement = document.getElementById("snailbait-instructions");
	this.copyrightElement = document.getElementById("snailbait-copyright");
	this.scoreElement = document.getElementById("snailbait-score");
	this.soundAndMusicElement = document.getElementById("snailbait-sound-and-music");
	this.tweetElement = document.getElementById("snailbait-tweet");
	TWEET_PREAMBLE = "https://twitter.com/intent/tweet?text=I scored ";
	TWEET_EPILOGUE = " playing this HTML5 Canvas platform game: http://bit.ly/1oiASlY &hashtags=html5";
	this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET;
	this.spriteOffset = this.STARTING_SPRITE_OFFSET;
	this.bgVelocity = this.STARTING_BACKGROUND_VELOCITY, this.platformVelocity, this.RUNNER_CELLS_WIDTH = 50;
	this.RUNNER_CELLS_HEIGHT = 52;
	this.BAT_CELLS_HEIGHT = 34;
	this.BEE_CELLS_HEIGHT = 50;
	this.BEE_CELLS_WIDTH = 50;
	this.BUTTON_CELLS_HEIGHT = 20;
	this.BUTTON_CELLS_WIDTH = 31;
	this.COIN_CELLS_HEIGHT = 30;
	this.COIN_CELLS_WIDTH = 30;
	this.EXPLOSION_CELLS_HEIGHT = 62;
	this.RUBY_CELLS_HEIGHT = 30;
	this.RUBY_CELLS_WIDTH = 35;
	this.SAPPHIRE_CELLS_HEIGHT = 30;
	this.SAPPHIRE_CELLS_WIDTH = 35;
	this.SNAIL_BOMB_CELLS_HEIGHT = 20;
	this.SNAIL_BOMB_CELLS_WIDTH = 20;
	this.SNAIL_CELLS_HEIGHT = 34;
	this.SNAIL_CELLS_WIDTH = 64;
	this.batCells = [{ left: 3, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT }, { left: 41, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT }, { left: 93, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT }, { left: 132, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT }];
	this.beeCells = [{ left: 5, top: 234, width: this.BEE_CELLS_WIDTH, height: this.BEE_CELLS_HEIGHT }, { left: 75, top: 234, width: this.BEE_CELLS_WIDTH, height: this.BEE_CELLS_HEIGHT }, { left: 145, top: 234, width: this.BEE_CELLS_WIDTH, height: this.BEE_CELLS_HEIGHT }];
	this.blueCoinCells = [{ left: 5, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }, { left: 5 + this.COIN_CELLS_WIDTH, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }];
	this.explosionCells = [{ left: 3, top: 48, width: 52, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 63, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 146, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 233, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 308, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 392, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 473, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }];
	this.blueButtonCells = [{ left: 10, top: 192, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT }, { left: 53, top: 192, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT }];
	this.goldCoinCells = [{ left: 65, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }, { left: 96, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }, { left: 128, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }];
	this.goldButtonCells = [{ left: 90, top: 190, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT }, { left: 132, top: 190, width: this.BUTTON_CELLS_WIDTH, height: this.BUTTON_CELLS_HEIGHT }];
	this.sapphireCells = [{ left: 3, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT }, { left: 39, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT }, { left: 76, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT }, { left: 112, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT }, { left: 148, top: 138, width: this.SAPPHIRE_CELLS_WIDTH, height: this.SAPPHIRE_CELLS_HEIGHT }];
	this.runnerCellsRight = [{ left: 414, top: 385, width: 47, height: this.RUNNER_CELLS_HEIGHT }, { left: 362, top: 385, width: 44, height: this.RUNNER_CELLS_HEIGHT }, { left: 314, top: 385, width: 39, height: this.RUNNER_CELLS_HEIGHT }, { left: 265, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT }, { left: 205, top: 385, width: 49, height: this.RUNNER_CELLS_HEIGHT }, { left: 150, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT }, { left: 96, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT }, { left: 45, top: 385, width: 35, height: this.RUNNER_CELLS_HEIGHT }, { left: 0, top: 385, width: 35, height: this.RUNNER_CELLS_HEIGHT }], this.runnerCellsLeft = [{ left: 0, top: 305, width: 47, height: this.RUNNER_CELLS_HEIGHT }, { left: 55, top: 305, width: 44, height: this.RUNNER_CELLS_HEIGHT }, { left: 107, top: 305, width: 39, height: this.RUNNER_CELLS_HEIGHT }, { left: 152, top: 305, width: 46, height: this.RUNNER_CELLS_HEIGHT }, { left: 208, top: 305, width: 49, height: this.RUNNER_CELLS_HEIGHT }, { left: 265, top: 305, width: 46, height: this.RUNNER_CELLS_HEIGHT }, { left: 320, top: 305, width: 42, height: this.RUNNER_CELLS_HEIGHT }, { left: 380, top: 305, width: 35, height: this.RUNNER_CELLS_HEIGHT }, { left: 425, top: 305, width: 35, height: this.RUNNER_CELLS_HEIGHT }], this.rubyCells = [{ left: 185, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT }, { left: 220, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT }, { left: 258, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT }, { left: 294, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT }, { left: 331, top: 138, width: this.RUBY_CELLS_WIDTH, height: this.RUBY_CELLS_HEIGHT }];
	this.snailBombCells = [{ left: 40, top: 512, width: 30, height: 20 }, { left: 2, top: 512, width: 30, height: 20 }];
	this.snailCells = [{ left: 142, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT }, { left: 75, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT }, { left: 2, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT }];
	this.batData = [{ left: 95, top: this.TRACK_2_BASELINE - 1.5 * this.BAT_CELLS_HEIGHT }, { left: 614, top: this.TRACK_3_BASELINE }, { left: 904, top: this.TRACK_3_BASELINE - 3 * this.BAT_CELLS_HEIGHT }, { left: 1180, top: this.TRACK_2_BASELINE - 2.5 * this.BAT_CELLS_HEIGHT }, { left: 1720, top: this.TRACK_2_BASELINE - 2 * this.BAT_CELLS_HEIGHT }, { left: 1960, top: this.TRACK_3_BASELINE - this.BAT_CELLS_HEIGHT }, { left: 2200, top: this.TRACK_3_BASELINE - this.BAT_CELLS_HEIGHT }, { left: 2380, top: this.TRACK_3_BASELINE - 2 * this.BAT_CELLS_HEIGHT }];
	this.beeData = [{ left: 225, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT * 1.25 }, { left: 355, top: this.TRACK_2_BASELINE - this.BEE_CELLS_HEIGHT * 1.25 }, { left: 520, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT }, { left: 780, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT * 1.25 }, { left: 924, top: this.TRACK_2_BASELINE - this.BEE_CELLS_HEIGHT * 1.25 }, { left: 1500, top: 225 }, { left: 1600, top: 115 }, { left: 2225, top: 125 }, { left: 2195, top: 275 }, { left: 2450, top: 275 }];
	this.buttonData = [{ platformIndex: 7 }, { platformIndex: 12 }];
	this.coinData = [{ left: 270, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 489, top: this.TRACK_3_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 620, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 833, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 1050, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 1450, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 1670, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 1870, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 1930, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 2200, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 2320, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }, { left: 2360, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }];
	this.platformData = [{ left: 10, width: 210, height: this.PLATFORM_HEIGHT, fillStyle: "rgb(200, 200, 60)", opacity: 1, track: 1, pulsate: false, }, { left: 240, width: 110, height: this.PLATFORM_HEIGHT, fillStyle: "rgb(110,150,255)", opacity: 1, track: 2, pulsate: false, }, { left: 400, width: 125, height: this.PLATFORM_HEIGHT, fillStyle: "rgb(250,0,0)", opacity: 1, track: 3, pulsate: false }, { left: 603, width: 250, height: this.PLATFORM_HEIGHT, fillStyle: "rgb(255,255,0)", opacity: 0.8, track: 1, pulsate: false, }, { left: 810, width: 100, height: this.PLATFORM_HEIGHT, fillStyle: "rgb(200,200,0)", opacity: 1, track: 2, pulsate: false }, { left: 1005, width: 150, height: this.PLATFORM_HEIGHT, fillStyle: "rgb(80,140,230)", opacity: 1, track: 2, pulsate: false }, { left: 1200, width: 105, height: this.PLATFORM_HEIGHT, fillStyle: "aqua", opacity: 1, track: 3, pulsate: false }, { left: 1400, width: 180, height: this.PLATFORM_HEIGHT, fillStyle: "aqua", opacity: 1, track: 1, pulsate: false, }, { left: 1625, width: 100, height: this.PLATFORM_HEIGHT, fillStyle: "cornflowerblue", opacity: 1, track: 2, pulsate: false }, { left: 1800, width: 250, height: this.PLATFORM_HEIGHT, fillStyle: "gold", opacity: 1, track: 1, pulsate: false }, { left: 2000, width: 200, height: this.PLATFORM_HEIGHT, fillStyle: "rgb(200,200,80)", opacity: 1, track: 2, pulsate: false }, { left: 2100, width: 100, height: this.PLATFORM_HEIGHT, fillStyle: "aqua", opacity: 1, track: 3, pulsate: false }, { left: 2269, width: 200, height: this.PLATFORM_HEIGHT, fillStyle: "gold", opacity: 1, track: 1, pulsate: true }, { left: 2500, width: 200, height: this.PLATFORM_HEIGHT, fillStyle: "#2b950a", opacity: 1, track: 2, pulsate: true }];
	this.sapphireData = [{ left: 155, top: this.TRACK_1_BASELINE - this.SAPPHIRE_CELLS_HEIGHT }, { left: 880, top: this.TRACK_2_BASELINE - this.SAPPHIRE_CELLS_HEIGHT }, { left: 1100, top: this.TRACK_2_BASELINE - this.SAPPHIRE_CELLS_HEIGHT }, { left: 1475, top: this.TRACK_1_BASELINE - this.SAPPHIRE_CELLS_HEIGHT }, { left: 2400, top: this.TRACK_1_BASELINE - this.SAPPHIRE_CELLS_HEIGHT }];
	this.rubyData = [{ left: 690, top: this.TRACK_1_BASELINE - this.RUBY_CELLS_HEIGHT }, { left: 1700, top: this.TRACK_2_BASELINE - this.RUBY_CELLS_HEIGHT }, { left: 2056, top: this.TRACK_2_BASELINE - this.RUBY_CELLS_HEIGHT }];
	this.smokingHoleData = [{ left: 250, top: this.TRACK_2_BASELINE - 20 }, { left: 850, top: this.TRACK_2_BASELINE - 20 }];
	this.snailData = [{ platformIndex: 13 }, ];
	this.bats = [];
	this.bees = [];
	this.buttons = [];
	this.coins = [];
	this.platforms = [];
	this.rubies = [];
	this.sapphires = [];
	this.smokingHoles = [];
	this.snails = [];
	this.sprites = [];
	this.platformArtist = {
		draw: function(c, b) {
			var f = 1,
				e = "black",
				d;
			d = snailBait.calculatePlatformTop(c.track);
			b.lineWidth = f;
			b.strokeStyle = e;
			b.fillStyle = c.fillStyle;
			b.strokeRect(c.left, d, c.width, c.height);
			b.fillRect(c.left, d, c.width, c.height)
		}
	};
	this.runBehavior = {
		lastAdvanceTime: 0,
		execute: function(e, c, f, d, b) {
			if(e.runAnimationRate === 0) { return }
			if(this.lastAdvanceTime === 0) { this.lastAdvanceTime = c } else {
				if(c - this.lastAdvanceTime > 1000 / e.runAnimationRate) {
					e.artist.advance();
					this.lastAdvanceTime = c
				}
			}
		}
	};
	this.paceBehavior = {
		setDirection: function(b) {
			var c = b.left + b.width,
				d = b.platform.left + b.platform.width;
			if(b.direction === undefined) { b.direction = snailBait.RIGHT }
			if(c > d && b.direction === snailBait.RIGHT) { b.direction = snailBait.LEFT } else { if(b.left < b.platform.left && b.direction === snailBait.LEFT) { b.direction = snailBait.RIGHT } }
		},
		setPosition: function(e, d, b) { var c = e.velocityX * (d - b) / 1000; if(e.direction === snailBait.RIGHT) { e.left += c } else { e.left -= c } },
		execute: function(e, c, f, d, b) {
			this.setDirection(e);
			this.setPosition(e, c, b)
		}
	};
	this.snailShootBehavior = {
		execute: function(f, d, h, e, c) {
			var g = f.bomb,
				b = 2;
			if(!snailBait.isSpriteInView(f)) { return }
			if(!g.visible && f.artist.cellIndex === b) {
				g.left = f.left;
				g.visible = true;
				snailBait.playSound(snailBait.cannonSound)
			}
		}
	};
	this.snailBombMoveBehavior = {
		execute: function(e, c, f, d, b) {
			var g = 550;
			if(e.left + e.width > e.hOffset && e.left + e.width < e.hOffset + e.width) {
				e.visible = false
			} else {
				e.left -= g * ((c - b) / 1000)
			}
		}
	};
	this.runnerExplodeBehavior = new CellSwitchBehavior(this.explosionCells, this.RUNNER_EXPLOSION_DURATION, function(d, c, e, b) { return d.exploding }, function(c, b) { c.exploding = false });
	this.blueButtonDetonateBehavior = {
		execute: function(g, e, h, f, b) {
			var d = 1000,
				c = 400;
			if(!g.detonating) { return } g.artist.cellIndex = 1;
			snailBait.explode(snailBait.bees[5]);
			setTimeout(function() { snailBait.explode(snailBait.bees[6]) }, c);
			g.detonating = false;
			setTimeout(function() { g.artist.cellIndex = 0 }, d)
		}
	};
	this.goldButtonDetonateBehavior = {
		execute: function(e, d, f, b) {
			var c = 1000;
			if(!e.detonating) { return } e.artist.cellIndex = 1;
			snailBait.revealWinningAnimation();
			e.detonating = false;
			setTimeout(function() { e.artist.cellIndex = 0 }, c)
		}
	};
	this.badGuyExplodeBehavior = new CellSwitchBehavior(this.explosionCells, this.BAD_GUYS_EXPLOSION_DURATION, function(c, b, d) { return c.exploding }, function(c, b) { c.exploding = false });
	this.jumpBehavior = {
		pause: function(c, b) { if(c.ascendTimer.isRunning()) { c.ascendTimer.pause(b) } else { if(c.descendTimer.isRunning()) { c.descendTimer.pause(b) } } },
		unpause: function(c, b) { if(c.ascendTimer.isRunning()) { c.ascendTimer.unpause(b) } else { if(c.descendTimer.isRunning()) { c.descendTimer.unpause(b) } } },
		isAscending: function(b) { return b.ascendTimer.isRunning() },
		ascend: function(e, d) {
			var c = e.ascendTimer.getElapsedTime(d),
				b = c / (e.JUMP_DURATION / 2) * e.JUMP_HEIGHT;
			e.top = e.verticalLaunchPosition - b
		},
		isDoneAscending: function(c, b) { return c.ascendTimer.getElapsedTime(b) > c.JUMP_DURATION / 2 },
		finishAscent: function(c, b) {
			c.jumpApex = c.top;
			c.ascendTimer.stop(b);
			c.descendTimer.start(b)
		},
		isDescending: function(b) { return b.descendTimer.isRunning() },
		descend: function(e, d) {
			var c = e.descendTimer.getElapsedTime(d),
				b = c / (e.JUMP_DURATION / 2) * e.JUMP_HEIGHT;
			e.top = e.jumpApex + b
		},
		isDoneDescending: function(c, b) { return c.descendTimer.getElapsedTime(b) > c.JUMP_DURATION / 2 },
		finishDescent: function(c, b) { c.stopJumping(); if(snailBait.platformUnderneath(c)) { c.top = c.verticalLaunchPosition } else { c.fall(snailBait.GRAVITY_FORCE * (c.descendTimer.getElapsedTime(b) / 1000) * snailBait.PIXELS_PER_METER) } },
		execute: function(e, c, f, d, b) { if(!e.jumping || e.falling) { return } if(this.isAscending(e)) { if(!this.isDoneAscending(e, c)) { this.ascend(e, c) } else { this.finishAscent(e, c) } } else { if(this.isDescending(e)) { if(!this.isDoneDescending(e, c)) { this.descend(e, c) } else { this.finishDescent(e, c) } } } }
	};
	this.fallBehavior = {
		pause: function(c, b) { c.fallTimer.pause(b) },
		unpause: function(c, b) { c.fallTimer.unpause(b) },
		isOutOfPlay: function(b) { return b.top > snailBait.canvas.height },
		setSpriteVelocity: function(c, b) { c.velocityY = c.initialVelocityY + snailBait.GRAVITY_FORCE * (c.fallTimer.getElapsedTime(b) / 1000) * snailBait.PIXELS_PER_METER },
		calculateVerticalDrop: function(d, c, b) { return d.velocityY * (c - b) / 1000 },
		willFallBelowCurrentTrack: function(c, b) { return c.top + c.height + b > snailBait.calculatePlatformTop(c.track) },
		fallOnPlatform: function(b) {
			b.stopFalling();
			snailBait.putSpriteOnTrack(b, b.track);
			snailBait.playSound(snailBait.thudSound)
		},
		moveDown: function(e, d, b) {
			var c;
			this.setSpriteVelocity(e, d);
			c = this.calculateVerticalDrop(e, d, b);
			if(!this.willFallBelowCurrentTrack(e, c)) { e.top += c } else {
				if(snailBait.platformUnderneath(e)) {
					this.fallOnPlatform(e);
					e.stopFalling()
				} else {
					e.track--;
					e.top += c
				}
			}
		},
		execute: function(e, c, f, d, b) {
			if(e.falling) {
				if(!this.isOutOfPlay(e) && !e.exploding) { this.moveDown(e, c, b) } else {
					e.stopFalling();
					if(this.isOutOfPlay(e)) {
						snailBait.loseLife();
						snailBait.playSound(snailBait.electricityFlowingSound);
						snailBait.runner.visible = false
					}
				}
			} else { if(!e.jumping && !snailBait.platformUnderneath(e)) { e.fall() } }
		}
	};
	this.collideBehavior = {
		adjustScore: function(b) {
			if(b.value) {
				snailBait.score += b.value;
				snailBait.updateScoreElement()
			}
		},
		isCandidateForCollision: function(b, e) { var c, d; if(!b.calculateCollisionRectangle || !e.calculateCollisionRectangle) { return false } c = b.calculateCollisionRectangle(), d = e.calculateCollisionRectangle(); return d.left < c.right && b !== e && b.visible && e.visible && !b.exploding && !e.exploding },
		didCollide: function(c, f, b) {
			var e = f.calculateCollisionRectangle(),
				d = c.calculateCollisionRectangle();
			if(f.type === "snail bomb") { return this.didRunnerCollideWithSnailBomb(d, e, b) } else { return this.didRunnerCollideWithOtherSprite(d, e, b) }
		},
		didRunnerCollideWithSnailBomb: function(c, d, b) {
			b.beginPath();
			b.rect(c.left + snailBait.spriteOffset, c.top, c.right - c.left, c.bottom - c.top);
			return b.isPointInPath(d.centerX, d.centerY)
		},
		didRunnerCollideWithOtherSprite: function(c, d, b) {
			b.beginPath();
			b.rect(d.left, d.top, d.right - d.left, d.bottom - d.top);
			return b.isPointInPath(c.left, c.top) || b.isPointInPath(c.right, c.top) || b.isPointInPath(c.centerX, c.centerY) || b.isPointInPath(c.left, c.bottom) || b.isPointInPath(c.right, c.bottom)
		},
		processPlatformCollisionDuringJump: function(c, b) {
			var d = c.descendTimer.isRunning();
			c.stopJumping();
			if(d) { snailBait.putSpriteOnTrack(c, b.track) } else {
				c.fall();
				snailBait.playSound(snailBait.thudSound)
			}
		},
		processBadGuyCollision: function(b) {
			snailBait.runner.stopFalling();
			snailBait.runner.stopJumping();
			snailBait.explode(b);
			snailBait.shake();
			snailBait.loseLife()
		},
		processAssetCollision: function(b) { b.visible = false; if(b.type === "coin") { snailBait.playSound(snailBait.coinSound) } else { snailBait.playSound(snailBait.pianoSound) } this.adjustScore(b); if(b.type === "ruby") { snailBait.scoreElement.style.color = "blue" } else { if(b.type === "sapphire") { snailBait.scoreElement.style.color = "red" } else { if(b.type === "coin") { snailBait.scoreElement.style.color = "green" } } } setTimeout(function() { snailBait.scoreElement.style.color = "yellow" }, 100) },
		processCollision: function(b, c) { if(b.jumping && "platform" === c.type) { this.processPlatformCollisionDuringJump(b, c) } else { if("coin" === c.type || "sapphire" === c.type || "ruby" === c.type) { this.processAssetCollision(c) } else { if("bat" === c.type || "bee" === c.type || "snail bomb" === c.type) { this.processBadGuyCollision(b) } else { if("button" === c.type) { if(b.jumping && b.descendTimer.isRunning() || b.falling) { c.detonating = true } } } } } },
		execute: function(f, c, g, e, b) { var h; if(!snailBait.playing) { return } for(var d = 0; d < snailBait.sprites.length; ++d) { h = snailBait.sprites[d]; if(this.isCandidateForCollision(f, h)) { if(this.didCollide(f, h, e)) { this.processCollision(f, h) } } } }
	}
};
SnailBait.prototype = {
	createSprites: function() {
		this.createPlatformSprites();
		this.createBatSprites();
		this.createBeeSprites();
		this.createButtonSprites();
		this.createCoinSprites();
		this.createRunnerSprite();
		this.createRubySprites();
		this.createSapphireSprites();
		this.createSmokingHoles();
		this.createSnailSprites();
		this.addSpritesToSpriteArray();
		this.initializeSprites()
	},
	addSpritesToSpriteArray: function() {
		for(var a = 0; a < this.smokingHoles.length; ++a) {
			snailBait.sprites.push(snailBait.smokingHoles[a])
		}
		for(var a = 0; a < this.platforms.length; ++a) {
			this.sprites.push(this.platforms[a])
		}
		for(var a = 0; a < this.bats.length; ++a) {
			his.sprites.push(this.bats[a])
		}
		for(var a = 0; a < this.bees.length; ++a) {
			this.sprites.push(this.bees[a])
		}
		for(var a = 0; a < this.buttons.length; ++a) {
			this.sprites.push(this.buttons[a])
		}
		for(var a = 0; a < this.coins.length; ++a) {
			this.sprites.push(this.coins[a])
		}
		for(var a = 0; a < this.rubies.length; ++a) {
			this.sprites.push(this.rubies[a])
		}
		for(var a = 0; a < this.sapphires.length; ++a) {
			this.sprites.push(this.sapphires[a])
		}
		for(var a = 0; a < this.snails.length; ++a) {
			this.sprites.push(this.snails[a])
		}
		this.sprites.push(this.runner)
	},
	positionSprites: function(d, c) {
		var b;
		for(var a = 0; a < d.length; ++a) {
			b = d[a];
			if(c[a].platformIndex) { this.putSpriteOnPlatform(b, this.platforms[c[a].platformIndex]) } else {
				b.top = c[a].top;
				b.left = c[a].left
			}
		}
	},
	equipRunnerForJumping: function() {
		var a = 1;
		this.runner.JUMP_HEIGHT = 120;
		this.runner.JUMP_DURATION = 1000;
		this.runner.jumping = false;
		this.runner.track = a;
		this.runner.ascendTimer = new AnimationTimer(this.runner.JUMP_DURATION / 2, AnimationTimer.makeEaseOutEasingFunction(1.15));
		this.runner.descendTimer = new AnimationTimer(this.runner.JUMP_DURATION / 2, AnimationTimer.makeEaseInEasingFunction(1.15));
		this.runner.jump = function() {
			if(this.jumping) { return } this.jumping = true;
			this.runAnimationRate = 0;
			this.verticalLaunchPosition = this.top;
			this.ascendTimer.start(snailBait.timeSystem.calculateGameTime())
		};
		this.runner.stopJumping = function() {
			this.ascendTimer.stop(snailBait.timeSystem.calculateGameTime());
			this.descendTimer.stop(snailBait.timeSystem.calculateGameTime());
			this.runAnimationRate = snailBait.RUN_ANIMATION_RATE;
			this.jumping = false
		}
	},
	equipRunnerForFalling: function() {
		this.runner.fallTimer = new AnimationTimer();
		this.runner.falling = false;
		this.runner.fall = function(a) {
			this.falling = true;
			this.velocityY = a || 0;
			this.initialVelocityY = a || 0;
			this.fallTimer.start(snailBait.timeSystem.calculateGameTime())
		};
		this.runner.stopFalling = function() {
			this.falling = false;
			this.velocityY = 0;
			this.fallTimer.stop(snailBait.timeSystem.calculateGameTime())
		}
	},
	equipRunner: function() {
		this.equipRunnerForJumping();
		this.equipRunnerForFalling();
		this.runner.direction = snailBait.LEFT
	},
	setTimeRate: function(a) {
		this.timeRate = a;
		this.timeRateReadoutElement.innerHTML = (this.timeRate * 100).toFixed(0);
		this.timeRateSlider.knobPercent = this.timeRate / this.MAX_TIME_RATE;
		if(this.developerBackdoorVisible) {
			this.timeRateSlider.erase();
			this.timeRateSlider.draw(this.timeRate / this.MAX_TIME_RATE)
		}
		this.timeSystem.setTransducer(function(b) { return b * snailBait.timeRate })
	},
	setSpriteValues: function() {
		var c, e = 100,
			a = 500,
			d = 1000;
		for(var b = 0; b < this.sprites.length; ++b) { c = this.sprites[b]; if(c.type === "coin") { c.value = e } else { if(c.type === "ruby") { c.value = d } else { if(c.type === "sapphire") { c.value = a } } } }
	},
	initializeSprites: function() {
		this.positionSprites(this.bats, this.batData);
		this.positionSprites(this.bees, this.beeData);
		this.positionSprites(this.buttons, this.buttonData);
		this.positionSprites(this.coins, this.coinData);
		this.positionSprites(this.rubies, this.rubyData);
		this.positionSprites(this.sapphires, this.sapphireData);
		this.positionSprites(this.snails, this.snailData);
		this.setSpriteValues();
		this.armSnails();
		this.equipRunner()
	},
	createBatSprites: function() {
		var c, d = 200,
			a = 50;
		for(var b = 0; b < this.batData.length; ++b) {
			c = new Sprite("bat", new SpriteSheetArtist(this.spritesheet, this.batCells), [new CycleBehavior(d, a)]);
			c.width = this.batCells[1].width;
			c.height = this.BAT_CELLS_HEIGHT;
			c.collisionMargin = { left: 6, top: 11, right: 4, bottom: 8, };
			this.bats.push(c)
		}
	},
	createBeeSprites: function() {
		var e, c, b, a = 100,
			f = 30;
		b = new CellSwitchBehavior(this.explosionCells, this.BAD_GUYS_EXPLOSION_DURATION, function(i, h, j, g) { return i.exploding }, function(h, g) { h.exploding = false });
		for(var d = 0; d < this.beeData.length; ++d) {
			e = new Sprite("bee", new SpriteSheetArtist(this.spritesheet, this.beeCells), [new CycleBehavior(a, f), b]);
			e.width = this.BEE_CELLS_WIDTH;
			e.height = this.BEE_CELLS_HEIGHT;
			e.collisionMargin = { left: 10, top: 10, right: 5, bottom: 10, };
			this.bees.push(e)
		}
	},
	createButtonSprites: function() {
		var b;
		for(var a = 0; a < this.buttonData.length; ++a) {
			if(a !== this.buttonData.length - 1) {
				b = new Sprite("button",
					new SpriteSheetArtist(this.spritesheet, this.blueButtonCells), [this.paceBehavior, this.blueButtonDetonateBehavior])
			} else {
				b = new Sprite("button",
					new SpriteSheetArtist(this.spritesheet, this.goldButtonCells), [this.paceBehavior, this.goldButtonDetonateBehavior])
			}
			b.width = this.BUTTON_CELLS_WIDTH;
			b.height = this.BUTTON_CELLS_HEIGHT;
			b.velocityX = this.BUTTON_PACE_VELOCITY;
			this.buttons.push(b)
		}
	},
	createCoinSprites: function() {
		var d = 100,
			b = 500,
			a = 800,
			f = 50,
			e;
		for(var c = 0; c < this.coinData.length; ++c) {
			if(c % 2 === 0) { e = new Sprite("coin", new SpriteSheetArtist(this.spritesheet, this.goldCoinCells), [new BounceBehavior(a + a * Math.random(), f + f * Math.random()), new CycleBehavior(b)]) } else { e = new Sprite("coin", new SpriteSheetArtist(this.spritesheet, this.blueCoinCells), [new BounceBehavior(a + a * Math.random(), f + f * Math.random()), new CycleBehavior(d)]) } e.width = this.COIN_CELLS_WIDTH;
			e.height = this.COIN_CELLS_HEIGHT;
			e.value = 50;
			e.collisionMargin = { left: e.width / 8, top: e.height / 8, right: e.width / 8, bottom: e.height / 4 };
			this.coins.push(e)
		}
	},
	createPlatformSprites: function() {
		var d, b, e = 800,
			a = 0.1;
		for(var c = 0; c < this.platformData.length; ++c) {
			b = this.platformData[c];
			d = new Sprite("platform", this.platformArtist);
			d.left = b.left;
			d.width = b.width;
			d.height = b.height;
			d.fillStyle = b.fillStyle;
			d.opacity = b.opacity;
			d.track = b.track;
			d.button = b.button;
			d.pulsate = b.pulsate;
			d.top = this.calculatePlatformTop(b.track);
			if(d.pulsate) { d.behaviors = [new PulseBehavior(e, a)] } this.platforms.push(d)
		}
	},
	createRubySprites: function() {
		var f = 100,
			b = 1000,
			e = 100,
			a, d = new SpriteSheetArtist(this.spritesheet, this.rubyCells);
		for(var c = 0; c < this.rubyData.length; ++c) {
			a = new Sprite("ruby", d, [new CycleBehavior(f), new BounceBehavior(b + b * Math.random(), e + e * Math.random())]);
			a.width = this.RUBY_CELLS_WIDTH;
			a.height = this.RUBY_CELLS_HEIGHT;
			a.value = 200;
			a.collisionMargin = { left: a.width / 5, top: a.height / 8, right: 0, bottom: a.height / 4 };
			this.rubies.push(a)
		}
	},
	createRunnerSprite: function() {
		var d = 50,
			b = 53,
			a = 1,
			c = this.RUN_ANIMATION_RATE;
		this.runner = new Sprite("runner", new SpriteSheetArtist(this.spritesheet, this.runnerCellsRight), [this.runBehavior, this.jumpBehavior, this.collideBehavior, this.runnerExplodeBehavior, this.fallBehavior]);
		this.runner.runAnimationRate = c;
		this.runner.track = a;
		this.runner.left = d;
		this.runner.width = this.RUNNER_CELLS_WIDTH;
		this.runner.height = this.RUNNER_CELLS_HEIGHT;
		this.putSpriteOnTrack(this.runner, a);
		this.runner.collisionMargin = { left: 15, top: 10, right: 10, bottom: 10, };
		this.sprites.push(this.runner)
	},
	createSapphireSprites: function() {
		var e = 100,
			a = 3000,
			d = 100,
			f, b = new SpriteSheetArtist(this.spritesheet, this.sapphireCells);
		for(var c = 0; c < this.sapphireData.length; ++c) {
			f = new Sprite("sapphire", b, [new CycleBehavior(e), new BounceBehavior(a + a * Math.random(), d + d * Math.random())]);
			f.width = this.SAPPHIRE_CELLS_WIDTH;
			f.height = this.SAPPHIRE_CELLS_HEIGHT;
			f.value = 100;
			f.collisionMargin = { left: f.width / 8, top: f.height / 8, right: f.width / 8, bottom: f.height / 4 };
			this.sapphires.push(f)
		}
	},
	createSmokingHoles: function() {
		var f, b, e = 20,
			a = 3,
			c = 10;
		for(var d = 0; d < this.smokingHoleData.length; ++d) {
			f = this.smokingHoleData[d];
			b = new SmokingHole(e, a, f.left, f.top, c);
			this.smokingHoles.push(b)
		}
	},
	createSnailSprites: function() {
		var d, e = new SpriteSheetArtist(this.spritesheet, this.snailCells),
			a = 300,
			c = 1500;
		for(var b = 0; b < this.snailData.length; ++b) {
			d = new Sprite("snail", e, [this.paceBehavior, this.snailShootBehavior, new CycleBehavior(a, c)]);
			d.width = this.SNAIL_CELLS_WIDTH;
			d.height = this.SNAIL_CELLS_HEIGHT;
			d.velocityX = snailBait.SNAIL_PACE_VELOCITY;
			this.snails.push(d)
		}
	},
	armSnails: function() {
		var c, a = new SpriteSheetArtist(this.spritesheet, this.snailBombCells);
		for(var b = 0; b < this.snails.length; ++b) {
			c = this.snails[b];
			c.bomb = new Sprite("snail bomb", a, [this.snailBombMoveBehavior]);
			c.bomb.width = snailBait.SNAIL_BOMB_CELLS_WIDTH;
			c.bomb.height = snailBait.SNAIL_BOMB_CELLS_HEIGHT;
			c.bomb.top = c.top + c.bomb.height / 2;
			c.bomb.left = c.left + c.bomb.width / 2;
			c.bomb.visible = false;
			c.bomb.snail = c;
			this.sprites.push(c.bomb)
		}
	},
	isSpriteInView: function(a) {
		return a.left + a.width > a.hOffset &&
			a.left < a.hOffset + this.canvas.width
	},
	updateSprites: function(a) { var c; for(var b = 0; b < this.sprites.length; ++b) { c = this.sprites[b]; if(!this.showSmokingHoles && c.type === "smoking hole") { continue } if(c.visible && this.isSpriteInView(c)) { c.update(a, this.fps, this.context, this.lastAnimationFrameTime) } } },
	drawSprites: function() {
		var b;
		for(var a = 0; a < this.sprites.length; ++a) {
			b = this.sprites[a];
			if(!this.showSmokingHoles && b.type === "smoking hole") { continue }
			if(b.visible && this.isSpriteInView(b)) {
				this.context.translate(-b.hOffset, 0);
				b.draw(this.context);
				this.context.translate(b.hOffset, 0)
			}
		}
	},
	drawRulerMajorTick: function(a) {
		var c = this.rulerCanvas.height,
			b = this.rulerCanvas.height / 2 + 2,
			d = (this.spriteOffset + a).toFixed(0);
		this.rulerContext.beginPath();
		this.rulerContext.moveTo(a + 0.5, b);
		this.rulerContext.lineTo(a + 0.5, c);
		this.rulerContext.stroke();
		this.rulerContext.fillText(d, a - 10, 10)
	},
	drawRulerMinorTick: function(c) {
		var b = this.rulerCanvas.height,
			a = 3 * this.rulerCanvas.height / 4;
		this.rulerContext.beginPath();
		this.rulerContext.moveTo(c + 0.5, a);
		this.rulerContext.lineTo(c + 0.5, b);
		this.rulerContext.stroke()
	},
	eraseRuler: function() { this.rulerContext.clearRect(0, 0, this.rulerCanvas.width, this.rulerCanvas.height) },
	drawRuler: function() {
		var d = 50,
			a = 10,
			c = 0.5,
			e = "blue",
			b;
		this.rulerContext.lineWidth = c;
		this.rulerContext.fillStyle = e;
		for(b = 0; b < this.BACKGROUND_WIDTH; b += a) { if(b === 0) { continue } if(b % d === 0) { this.drawRulerMajorTick(b) } else { this.drawRulerMinorTick(b) } }
	},
	draw: function(a) {
		this.setPlatformVelocity();
		this.setOffsets(a);
		this.drawBackground();
		this.updateSprites(a);
		this.drawSprites();
		if(this.developerBackdoorVisible) {
			this.eraseRuler();
			this.drawRuler()
		}
		if(this.mobileInstructionsVisible) { snailBait.drawMobileInstructions() }
	},
	setPlatformVelocity: function() { this.platformVelocity = this.bgVelocity * this.PLATFORM_VELOCITY_MULTIPLIER },
	setOffsets: function(a) {
		this.setBackgroundOffset(a);
		this.setSpriteOffsets(a)
	},
	setBackgroundOffset: function(a) {
		this.backgroundOffset += this.bgVelocity * (a - this.lastAnimationFrameTime) / 1000;
		if(this.backgroundOffset < 0 || this.backgroundOffset > this.BACKGROUND_WIDTH) {
			this.backgroundOffset = 0 
		} 
	},
	setSpriteOffsets: function(a) {
		var c;
		this.spriteOffset += this.platformVelocity * (a - this.lastAnimationFrameTime) / 1000;
		for(var b = 0; b < this.sprites.length; ++b) { c = this.sprites[b]; if("smoking hole" === c.type) { c.hOffset = this.backgroundOffset } else { if("runner" !== c.type) { c.hOffset = this.spriteOffset } } }
	},
	drawBackground: function() {
		var a = 590;
		this.context.translate(-this.backgroundOffset, 0);
		this.context.drawImage(this.spritesheet, 0, a, this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT, 0, 0, this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT);
		this.context.drawImage(this.spritesheet, 0, a, this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT, this.BACKGROUND_WIDTH, 0, this.BACKGROUND_WIDTH, this.BACKGROUND_HEIGHT);
		this.context.translate(this.backgroundOffset, 0)
	},
	drawPlatform: function(b) {
		var a = this.calculatePlatformTop(b.track);
		this.context.lineWidth = this.PLATFORM_STROKE_WIDTH;
		this.context.strokeStyle = this.PLATFORM_STROKE_STYLE;
		this.context.fillStyle = b.fillStyle;
		this.context.globalAlpha = b.opacity;
		this.context.strokeRect(b.left, a, b.width, b.height);
		this.context.fillRect(b.left, a, b.width, b.height)
	},
	drawPlatforms: function() {
		var a;
		this.context.translate(-this.platformOffset, 0);
		for(a = 0; a < this.platformData.length; ++a) { this.drawPlatform(this.platformData[a]) } this.context.translate(this.platformOffset, 0)
	},
	calculateFps: function(a) { var b = 1 / (a - this.lastAnimationFrameTime) * 1000 * this.timeRate; if(a - this.lastFpsUpdateTime > 1000) { this.lastFpsUpdateTime = a } return b },
	checkFps: function(a) {
		var b;
		this.updateSpeedSamples(snailBait.fps);
		b = this.calculateAverageSpeed();
		if(b < 40) { this.fpsElement.style.color = "red" } else { this.fpsElement.style.color = "yellow" } this.fpsElement.innerHTML = this.fps.toFixed(0) + " fps";
		if(b < this.runningSlowlyThreshold) { this.revealRunningSlowlyWarning(a, b) }
	},
	resetSpeedSamples: function() { snailBait.speedSamples = [60, 60, 60, 60, 60, 60, 60, 60, 60, 60] },
	advanceSpeedSamplesIndex: function() { if(this.speedSamplesIndex !== this.NUM_SPEED_SAMPLES - 1) { this.speedSamplesIndex++ } else { this.speedSamplesIndex = 0 } },
	updateSpeedSamples: function(a) {
		this.speedSamples[this.speedSamplesIndex] = a;
		this.advanceSpeedSamplesIndex()
	},
	calculateAverageSpeed: function() { var a, b = 0; for(a = 0; a < this.NUM_SPEED_SAMPLES; a++) { b += this.speedSamples[a] } return b / this.NUM_SPEED_SAMPLES },
	revealRunningSlowlyWarning: function(a, b) {
		this.slowlyWarningElement.innerHTML = "Snail Bait is running at <i><b>" + b.toFixed(0) + "</i></b> frames/second (fps), but it needs more than " + this.runningSlowlyThreshold + " fps to work correctly.";
		this.fadeInElements(this.runningSlowlyElement);
		this.lastSlowWarningTime = a
	},
	putSpriteOnPlatform: function(a, b) {
		a.top = b.top - a.height;
		a.left = b.left;
		a.platform = b
	},
	calculatePlatformTop: function(a) { if(a === 1) { return this.TRACK_1_BASELINE } else { if(a === 2) { return this.TRACK_2_BASELINE } else { if(a === 3) { return this.TRACK_3_BASELINE } } } },
	putSpriteOnTrack: function(c, b) {
		var a = 2;
		c.track = b;
		c.top = this.calculatePlatformTop(c.track) - c.height - a
	},
	platformUnderneath: function(d, b) {
		var a, f, e = d.calculateCollisionRectangle(),
			g;
		if(b === undefined) { b = d.track }
		for(var c = 0; c < snailBait.platforms.length; ++c) {
			a = snailBait.platforms[c];
			g = a.calculateCollisionRectangle();
			if(b === a.track) { if(e.right > g.left && e.left < g.right) { f = a; break } }
		}
		return f
	},
	turnLeft: function() {
		this.bgVelocity = -this.BACKGROUND_VELOCITY;
		this.runner.runAnimationRate = this.RUN_ANIMATION_RATE;
		this.runner.artist.cells = this.runnerCellsLeft;
		this.runner.direction = snailBait.LEFT
	},
	turnRight: function() {
		this.bgVelocity = this.BACKGROUND_VELOCITY;
		this.runner.runAnimationRate = this.RUN_ANIMATION_RATE;
		this.runner.artist.cells = this.runnerCellsRight;
		this.runner.direction = snailBait.RIGHT
	},
	fadeInElements: function() { var a = arguments; for(var b = 0; b < a.length; ++b) { a[b].style.display = "block" } setTimeout(function() { for(var c = 0; c < a.length; ++c) { a[c].style.opacity = snailBait.OPAQUE } }, this.SHORT_DELAY) },
	fadeOutElements: function() {
		var a = arguments,
			c = a[a.length - 1];
		for(var b = 0; b < a.length - 1; ++b) { a[b].style.opacity = this.TRANSPARENT } setTimeout(function() { for(var d = 0; d < a.length - 1; ++d) { a[d].style.display = "none" } }, c)
	},
	hideToast: function() {
		var a = 450;
		this.fadeOutElements(this.toastElement, a)
	},
	startToastTransition: function(a) {
		this.toastElement.innerHTML = a;
		this.fadeInElements(this.toastElement)
	},
	revealToast: function(c, b) {
		var a = 1000;
		b = b || a;
		this.startToastTransition(c);
		setTimeout(function(d) { snailBait.hideToast() }, b)
	},
	hideCredits: function() {
		var a = 1000;
		this.fadeOutElements(this.creditsElement, a)
	},
	revealCredits: function() {
		this.fadeInElements(this.creditsElement);
		this.tweetElement.href = TWEET_PREAMBLE + this.score + TWEET_EPILOGUE
	},
	initializeDeveloperBackdoorSliders: function() {
		this.timeRateSlider.appendTo("snailbait-time-rate-slider");
		this.runningSlowlySlider.appendTo("snailbait-running-slowly-slider");
		this.developerBackdoorSlidersInitialized = true
	},
	updateRunningSlowlySlider: function() {
		this.runningSlowlySlider.knobPercent = this.runningSlowlyThreshold / this.MAX_RUNNING_SLOWLY_THRESHOLD;
		this.runningSlowlySlider.erase();
		this.runningSlowlySlider.draw(this.runningSlowlyThreshold / this.MAX_RUNNING_SLOWLY_THRESHOLD)
	},
	updateTimeRateSlider: function() {
		this.timeRateSlider.knobPercent = this.timeRate * this.MAX_TIME_RATE;
		this.timeRateSlider.erase();
		this.timeRateSlider.draw(this.timeRate / this.MAX_TIME_RATE)
	},
	updateDeveloperBackdoorSliders: function() {
		if(!this.developerBackdoorSlidersInitialized) { this.initializeDeveloperBackdoorSliders() } this.updateRunningSlowlySlider();
		this.updateTimeRateSlider()
	},
	updateDeveloperBackdoorCheckboxes: function() {
		this.detectRunningSlowlyCheckboxElement.checked = this.showSlowWarning;
		this.smokingHolesCheckboxElement.checked = this.showSmokingHoles
	},
	updateDeveloperBackdoorReadouts: function() {
		this.timeRateReadoutElement.innerText = (this.timeRate * 100).toFixed(0);
		this.runningSlowlyReadoutElement.innerText = (this.runningSlowlyThreshold / this.MAX_RUNNING_SLOWLY_THRESHOLD * this.MAX_RUNNING_SLOWLY_THRESHOLD).toFixed(0)
	},
	revealDeveloperBackdoor: function() {
		this.fadeInElements(this.developerBackdoorElement, this.rulerCanvas);
		this.updateDeveloperBackdoorSliders();
		this.updateDeveloperBackdoorCheckboxes();
		this.updateDeveloperBackdoorReadouts();
		this.canvas.style.cursor = "move";
		this.developerBackdoorVisible = true
	},
	hideDeveloperBackdoor: function() {
		var a = 1000;
		this.fadeOutElements(this.developerBackdoorElement, this.rulerCanvas, a);
		this.canvas.style.cursor = this.initialCursor;
		this.developerBackdoorVisible = false
	},
	revealHighScores: function() {
		this.highScoreNameElement.value = "";
		this.fadeInElements(snailBait.highScoreElement);
		this.highScoreNameElement.focus()
	},
	hideHighScores: function() {
		var a = 1000;
		snailBait.fadeOutElements(snailBait.highScoreElement, a)
	},
	checkHighScores: function() { this.serverSocket.emit("get high score") },
	explode: function(a) {
		if(!a.exploding) {
			if(a.runAnimationRate === 0) { a.runAnimationRate = this.RUN_ANIMATION_RATE } a.exploding = true;
			this.playSound(this.explosionSound)
		}
	},
	shake: function() {
		var a = 12,
			e = 80,
			d = snailBait.BACKGROUND_VELOCITY * 1.5,
			b = snailBait.bgVelocity,
			c = 0;
		reverseDirection = function() { snailBait.bgVelocity = c % 2 ? d : -d; if(c < a) { setTimeout(reverseDirection, e);++c } else { snailBait.bgVelocity = b } };
		reverseDirection()
	},
	revealWinningAnimation: function() {
		var a = 5000,
			b = 0.25;
		this.bgVelocity = 0;
		this.playing = false;
		this.loadingTitleElement.style.display = "none";
		this.fadeInElements(this.loadingAnimatedGIFElement, this.loadingElement);
		this.scoreElement.innerHTML = "Winner!";
		this.canvas.style.opacity = b;
		setTimeout(function() {
			snailBait.loadingAnimatedGIFElement.style.display = "none";
			snailBait.fadeInElements(snailBait.canvas);
			snailBait.gameOver()
		}, a)
	},
	animate: function(a) {
		a = snailBait.timeSystem.calculateGameTime();
		if(snailBait.paused) { 
			setTimeout(function() {
				requestNextAnimationFrame(snailBait.animate)
				}, snailBait.PAUSED_CHECK_INTERVAL)
		} else {
			snailBait.fps = snailBait.calculateFps(a);
			if(snailBait.windowHasFocus && snailBait.playing && snailBait.showSlowWarning && a - snailBait.lastFpsCheckTime > snailBait.FPS_SLOW_CHECK_INTERVAL)
			{
				snailBait.checkFps(a);
				snailBait.lastFpsCheckTime = a
			}
			snailBait.draw(a);
			snailBait.lastAnimationFrameTime = a;
			requestNextAnimationFrame(snailBait.animate)
		}
	},
	togglePausedStateOfAllBehaviors: function(b) {
		var d;
		for(var c = 0; c < this.sprites.length; ++c) {
			sprite = this.sprites[c];
			for(var a = 0; a < sprite.behaviors.length; ++a) { 
				d = sprite.behaviors[a];
				if(this.paused) {
					if(d.pause) {
						d.pause(sprite, b) 
					} 
				} else {
					if(d.unpause) {
						d.unpause(sprite, b) 
					} 
				} 
			} 
		} 
	},
	togglePaused: function() {
		var a = this.timeSystem.calculateGameTime();
		this.paused = !this.paused;
		this.togglePausedStateOfAllBehaviors(a);
		if(this.paused) {
			this.pauseStartTime = a;
			this.revealToast("paused")
		} else { this.lastAnimationFrameTime += (a - this.pauseStartTime) }
		if(this.musicOn) { if(this.paused) { this.musicElement.pause() } else { this.musicElement.play() } }
	},
	spritesheetLoaded: function() {
		var a = 2000;
		this.graphicsReady = true;
		this.fadeOutElements(this.loadingElement, a);
		setTimeout(function() { if(!snailBait.gameStarted) { snailBait.startGame() } }, a)
	},
	loadingAnimationLoaded: function() { if(!this.gameStarted) { this.fadeInElements(this.loadingAnimatedGIFElement, this.loadingTitleElement) } },
	initializeImages: function() {
		this.spritesheet.src = "../images/spritesheet.png";
		this.loadingAnimatedGIFElement.src = "../images/snail.gif";
		this.spritesheet.onload = function(a) { snailBait.spritesheetLoaded() };
		this.loadingAnimatedGIFElement.onload = function() { snailBait.loadingAnimationLoaded() }
	},
	createAudioChannels: function() {
		var b;
		for(var a = 0; a < this.audioChannels.length; ++a) {
			b = this.audioChannels[a];
			if(a !== 0) {
				b.audio = document.createElement("audio");
				b.audio.addEventListener("loadeddata", this.soundLoaded, false);
				b.audio.src = this.audioSprites.currentSrc
			}
			b.audio.autobuffer = true
		}
	},
	seekAudio: function(c, a) {
		try {
			a.pause();
			a.currentTime = c.position
		} catch(b) { if(console) { console.error("Cannot seek audio") } }
	},
	playAudio: function(b, a) {
		try {
			b.play();
			a.playing = true
		} catch(c) { if(console) { console.error("Cannot play audio") } }
	},
	soundLoaded: function() { 
		snailBait.audioSpriteCountdown--;
		if(snailBait.audioSpriteCountdown === 0) {
			if(!snailBait.gameStarted && snailBait.graphicsReady) {
				snailBait.startGame() 
			} 
		} 
	},
	getFirstAvailableAudioChannel: function() {
		for(var a = 0; a < this.audioChannels.length; ++a) {
			if(!this.audioChannels[a].playing) {
				return this.audioChannels[a] 
			} 
		} 
		return null 
	},
	playSound: function(c) {
		var b, a;
		if(this.soundOn) {
			b = this.getFirstAvailableAudioChannel();
			if(!b) { if(console) { console.warn("All audio channels are busy. Cannot play sound") } } else {
				a = b.audio;
				a.volume = c.volume;
				this.seekAudio(c, a);
				this.playAudio(a, b);
				setTimeout(function() {
					b.playing = false;
					snailBait.seekAudio(c, a)
				}, c.duration)
			}
		}
	},
	dimControls: function() {
		FINAL_OPACITY = 0.5;
		snailBait.instructionsElement.style.opacity = FINAL_OPACITY;
		snailBait.soundAndMusicElement.style.opacity = FINAL_OPACITY
	},
	revealCanvas: function() { this.fadeInElements(this.canvas) },
	revealTopChrome: function() { this.fadeInElements(this.scoreElement, this.livesElement, this.fpsElement) },
	revealTopChromeDimmed: function() {
		var a = 0.25;
		this.scoreElement.style.display = "block";
		this.livesElement.style.display = "block";
		this.fpsElement.style.display = "block";
		setTimeout(function() {
			snailBait.scoreElement.style.opacity = a;
			snailBait.livesElement.style.opacity = a;
			snailBait.fpsElement.style.opacity = a
		}, this.SHORT_DELAY)
	},
	revealBottomChrome: function() { this.fadeInElements(this.soundAndMusicElement, this.copyrightElement, this.instructionsElement) },
	revealGame: function() {
		var a = 5000;
		this.revealTopChromeDimmed();
		this.revealCanvas();
		this.revealBottomChrome();
		setTimeout(function() {
			snailBait.dimControls();
			snailBait.revealTopChrome()
		}, a)
	},
	revealInitialToast: function() {
		var a = 1500,
			b = 3000;
		setTimeout(function() {
			snailBait.revealToast("Collide with coins and jewels. Avoid bats and bees.", b);
			setTimeout(function() { snailBait.revealToast("Type CTRL-d to reveal the developer backdoor", 3000) }, b * 1.2)
		}, a)
	},
	processRightTap: function() { if(snailBait.runner.direction === snailBait.LEFT || snailBait.bgVelocity === 0) { snailBait.turnRight() } else { snailBait.runner.jump() } },
	processLeftTap: function() { if(snailBait.runner.direction === snailBait.RIGHT) { snailBait.turnLeft() } else { snailBait.runner.jump() } },
	touchStart: function(a) { if(snailBait.playing) { a.preventDefault() } },
	touchEnd: function(b) { var a = b.changedTouches[0].pageX; if(snailBait.playing) { if(a < snailBait.canvas.width / 2) { snailBait.processLeftTap() } else { if(a > snailBait.canvas.width / 2) { snailBait.processRightTap() } } b.preventDefault() } },
	addTouchEventHandlers: function() {
		snailBait.canvas.addEventListener("touchstart", snailBait.touchStart);
		snailBait.canvas.addEventListener("touchend", snailBait.touchEnd)
	},
	initializeContextForMobileInstructions: function() {
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.font = "26px fantasy";
		this.context.shadowBlur = 2;
		this.context.shadowOffsetX = 2;
		this.context.shadowOffsetY = 2;
		this.context.shadowColor = "rgb(0,0,0)";
		this.context.fillStyle = "yellow";
		this.context.strokeStyle = "yellow"
	},
	drawMobileDivider: function(a, b) {
		this.context.beginPath();
		this.context.moveTo(a / 2, 0);
		this.context.lineTo(a / 2, b);
		this.context.stroke()
	},
	drawMobileInstructionsLeft: function(a, d, b, c) {
		this.context.font = "32px fantasy";
		this.context.fillText("Tap on this side to:", a / 4, d / 2 - b);
		this.context.fillStyle = "white";
		this.context.font = "italic 26px fantasy";
		this.context.fillText("Turn around when running right", a / 4, d / 2 - b + 2 * c);
		this.context.fillText("Jump when running left", a / 4, d / 2 - b + 3 * c)
	},
	drawMobileInstructionsRight: function(a, d, b, c) {
		this.context.font = "32px fantasy";
		this.context.fillStyle = "yellow";
		this.context.fillText("Tap on this side to:", 3 * a / 4, d / 2 - b);
		this.context.fillStyle = "white";
		this.context.font = "italic 26px fantasy";
		this.context.fillText("Turn around when running left", 3 * a / 4, d / 2 - b + 2 * c);
		this.context.fillText("Jump when running right", 3 * a / 4, d / 2 - b + 3 * c);
		this.context.fillText("Start running", 3 * a / 4, d / 2 - b + 5 * c)
	},
	drawMobileInstructions: function() {
		var a = this.canvas.width,
			c = this.canvas.height,
			d = 115,
			b = 40;
		this.context.save();
		this.initializeContextForMobileInstructions();
		this.drawMobileDivider(a, c);
		this.drawMobileInstructionsLeft(a, c, d, b);
		this.drawMobileInstructionsRight(a, c, d, b);
		this.context.restore()
	},
	revealMobileStartToast: function() { snailBait.fadeInElements(snailBait.mobileStartToast) },
	updateScoreElement: function() { this.scoreElement.innerHTML = this.score },
	updateLivesElement: function() {
		if(this.lives === 3) {
			this.lifeIconLeft.style.opacity = snailBait.OPAQUE;
			this.lifeIconMiddle.style.opacity = snailBait.OPAQUE;
			this.lifeIconRight.style.opacity = snailBait.OPAQUE
		} else {
			if(this.lives === 2) {
				this.lifeIconLeft.style.opacity = snailBait.OPAQUE;
				this.lifeIconMiddle.style.opacity = snailBait.OPAQUE;
				this.lifeIconRight.style.opacity = snailBait.TRANSPARENT
			} else {
				if(this.lives === 1) {
					this.lifeIconLeft.style.opacity = snailBait.OPAQUE;
					this.lifeIconMiddle.style.opacity = snailBait.TRANSPARENT;
					this.lifeIconRight.style.opacity = snailBait.TRANSPARENT
				} else {
					if(this.lives === 0) {
						this.lifeIconLeft.style.opacity = snailBait.TRANSPARENT;
						this.lifeIconMiddle.style.opacity = snailBait.TRANSPARENT;
						this.lifeIconRight.style.opacity = snailBait.TRANSPARENT
					}
				}
			}
		}
	},
	pollMusic: function() {
		var a = 500,
			b = 132,
			c;
		c = setInterval(function() {
			if(snailBait.musicElement.currentTime > b) {
				clearInterval(c);
				snailBait.restartMusic()
			}
		}, a)
	},
	restartMusic: function() {
		snailBait.musicElement.pause();
		snailBait.musicElement.currentTime = 0;
		snailBait.startMusic()
	},
	startMusic: function() {
		var a = 1000;
		setTimeout(function() { if(snailBait.musicCheckboxElement.checked) { snailBait.musicElement.play() } snailBait.pollMusic() }, a)
	},
	startGame: function() {
		this.revealGame();
		if(snailBait.mobile) { this.fadeInElements(snailBait.mobileWelcomeToast) } else {
			this.revealInitialToast();
			this.playing = true
		}
		this.startMusic();
		this.timeSystem.start();
		this.gameStarted = true;
		this.showSlowWarning = true;
		requestNextAnimationFrame(this.animate)
	},
	restartGame: function() {
		this.hideCredits();
		this.resetScore();
		this.resetLives();
		this.revealTopChrome();
		this.dimControls();
		this.restartLevel()
	},
	restartLevel: function() {
		this.resetOffsets();
		this.resetRunner();
		this.makeAllSpritesVisible();
		this.playing = true
	},
	resetOffsets: function() {
		this.bgVelocity = 0;
		this.backgroundOffset = 0;
		this.platformOffset = 0;
		this.spriteOffset = 0
	},
	resetRunner: function() {
		this.runner.left = snailBait.RUNNER_LEFT;
		this.runner.track = 3;
		this.runner.hOffset = 0;
		this.runner.visible = true;
		this.runner.exploding = false;
		this.runner.jumping = false;
		this.runner.falling = false;
		this.runner.top = this.calculatePlatformTop(3) - this.runner.height;
		this.runner.artist.cells = this.runnerCellsRight;
		this.runner.artist.cellIndex = 0
	},
	makeAllSpritesVisible: function() { for(var a = 0; a < this.sprites.length; ++a) { this.sprites[a].visible = true } },
	resetScore: function() {
		this.score = 0;
		this.updateScoreElement()
	},
	resetLives: function() {
		this.lives = this.MAX_NUMBER_OF_LIVES;
		this.updateLivesElement()
	},
	gameOver: function() {
		this.livesElement.style.opacity = 0.2;
		this.scoreElement.style.opacity = 0.2;
		this.fpsElement.style.opacity = 0.2;
		this.instructionsElement.style.opacity = 0.2;
		this.soundAndMusicElement.style.opacity = 0.2;
		this.bgVelocity = this.BACKGROUND_VELOCITY / 20;
		this.playing = false;
		if(this.developerBackdoorVisible) { this.hideDeveloperBackdoor() }
		if(this.serverAvailable) { this.checkHighScores() } else { this.revealCredits() }
	},
	startLifeTransition: function(a) {
		var b = 0.05,
			c = 0.1;
		if(a === undefined) { a = 0 } this.canvas.style.opacity = b;
		this.playing = false;
		setTimeout(function() {
			snailBait.setTimeRate(c);
			snailBait.runner.visible = false
		}, a)
	},
	endLifeTransition: function() {
		var a = 1000,
			b = 500;
		this.canvas.style.opacity = this.OPAQUE;
		if(this.lives === 0) { this.gameOver() } else { this.restartLevel() } setTimeout(function() {
			snailBait.setTimeRate(1);
			setTimeout(function() { snailBait.runner.runAnimationRate = 0 }, b)
		}, a)
	},
	loseLife: function() {
		var a = 3000;
		this.lives--;
		this.updateLivesElement();
		if(this.runner.exploding) {
			this.startLifeTransition(snailBait.RUNNER_EXPLOSION_DURATION);
			a += snailBait.RUNNER_EXPLOSION_DURATION
		} else { this.startLifeTransition() }
		if(this.serverAvailable) { this.serverSocket.emit("life lost", { left: this.spriteOffset + this.runner.left, top: this.runner.top }) } setTimeout(function() { snailBait.endLifeTransition() }, a)
	},
	getViewportSize: function() { return { width: Math.max(document.documentElement.clientWidth || window.innerWidth || 0), height: Math.max(document.documentElement.clientHeight || window.innerHeight || 0) } },
	detectMobile: function() { snailBait.mobile = "ontouchstart" in window },
	resizeElement: function(b, a, c) {
		b.style.width = a + "px";
		b.style.height = c + "px"
	},
	resizeElementsToFitScreen: function(a, b) {
		snailBait.resizeElement(document.getElementById("snailbait-arena"), a, b);
		snailBait.resizeElement(snailBait.mobileWelcomeToast, a, b);
		snailBait.resizeElement(snailBait.mobileStartToast, a, b)
	},
	calculateArenaSize: function(b) {
		var a = 800,
			e = 520,
			d, c;
		d = b.width * (e / a);
		if(d < b.height) { c = b.width } else {
			d = b.height;
			c = d * (a / e)
		}
		if(c > a) { c = a }
		if(d > e) { d = e }
		return { width: c, height: d }
	},
	fitScreen: function() {
		var a = snailBait.calculateArenaSize(snailBait.getViewportSize());
		snailBait.resizeElementsToFitScreen(a.width, a.height)
	},
	startDraggingGameCanvas: function(a) {
		this.mousedown = { x: a.clientX, y: a.clientY };
		this.dragging = true;
		this.runner.visible = false;
		this.backgroundOffsetWhenDraggingStarted = this.backgroundOffset;
		this.spriteOffsetWhenDraggingStarted = this.spriteOffset;
		a.preventDefault()
	},
	dragGameCanvas: function(b) {
		var a = b.clientX - this.mousedown.x;
		this.backgroundOffset = this.backgroundOffsetWhenDraggingStarted - a;
		this.spriteOffset = this.spriteOffsetWhenDraggingStarted - a
	},
	stopDraggingGameCanvas: function() {
		this.dragging = false;
		this.runner.visible = true
	}
};
window.addEventListener("keydown", function(b) {
	var a = b.keyCode,
		c = 0.2;
	if(a === 68 && b.ctrlKey) { if(!snailBait.developerBackdoorVisible) { snailBait.revealDeveloperBackdoor() } else { snailBait.hideDeveloperBackdoor() } return }
	if(!snailBait.playing || snailBait.runner.exploding) { return }
	if(a === 83 && b.shiftKey) { if(snailBait.timeRate === snailBait.NORMAL_TIME_RATE) { snailBait.setTimeRate(c) } else { if(snailBait.timeRate === c) { snailBait.setTimeRate(snailBait.NORMAL_TIME_RATE) } } } else {
		if(a === 83) {
			if(!snailBait.stalled) {
				snailBait.previousBgVelocity = snailBait.bgVelocity;
				snailBait.bgVelocity = 0;
				snailBait.stalled = true
			} else {
				snailBait.stalled = false;
				snailBait.bgVelocity = snailBait.previousBgVelocity
			}
		} else { if(a === 68 || a === 37) { snailBait.turnLeft() } else { if(a === 75 || a === 39) { snailBait.turnRight() } else { if(a === 80) { snailBait.togglePaused() } else { if(a === 74) { snailBait.runner.jump() } } } } }
	}
});
window.addEventListener("blur", function(a) { if(!snailBait.gameStarted) { return } snailBait.windowHasFocus = false; if(!snailBait.paused) { snailBait.togglePaused() } });
window.addEventListener("focus", function(b) {
	var c = 1000,
		a = function() { return snailBait.windowHasFocus && snailBait.countdownInProgress };
	if(!snailBait.gameStarted) { return } snailBait.windowHasFocus = true;
	if(!snailBait.playing) { snailBait.togglePaused() } else {
		if(snailBait.paused) {
			snailBait.countdownInProgress = true;
			snailBait.toastElement.style.font = "128px fantasy";
			if(a()) {
				snailBait.revealToast("3", 500);
				setTimeout(function(d) {
					if(a()) { snailBait.revealToast("2", 500) } setTimeout(function(f) {
						if(a()) { snailBait.revealToast("1", 500) } setTimeout(function(g) {
							if(a()) {
								snailBait.togglePaused();
								snailBait.toastElement.style.font = snailBait.originalFont
							}
							snailBait.countdownInProgress = false
						}, c)
					}, c)
				}, c)
			}
		}
	}
});
var snailBait = new SnailBait();
snailBait.playAgainLink.addEventListener("click", function(a) { snailBait.restartGame() });
snailBait.collisionRectanglesCheckboxElement.addEventListener("change", function(c) { var a = snailBait.collisionRectanglesCheckboxElement.checked; for(var b = 0; b < snailBait.sprites.length; ++b) { snailBait.sprites[b].showCollisionRectangle = a } });
snailBait.detectRunningSlowlyCheckboxElement.addEventListener("change", function(a) { snailBait.showSlowWarning = snailBait.detectRunningSlowlyCheckboxElement.checked });
snailBait.smokingHolesCheckboxElement.addEventListener("change", function(a) { snailBait.showSmokingHoles = snailBait.smokingHolesCheckboxElement.checked });
snailBait.runningSlowlySlider.addChangeListener(function(b) {
	var a = (snailBait.runningSlowlySlider.knobPercent * snailBait.MAX_RUNNING_SLOWLY_THRESHOLD).toFixed(0);
	snailBait.runningSlowlyThreshold = a;
	snailBait.runningSlowlyReadoutElement.innerHTML = a
});
snailBait.timeRateSlider.addChangeListener(function(a) {
	if(snailBait.timeRateSlider.knobPercent < 0.01) { snailBait.timeRateSlider.knobPercent = 0.01 } snailBait.setTimeRate(snailBait.timeRateSlider.knobPercent * (snailBait.MAX_TIME_RATE));
	snailBait.timeRateReadoutElement.innerHTML = (snailBait.timeRate * 100).toFixed(0)
});
snailBait.slowlyDontShowElement.addEventListener("click", function(a) {
	snailBait.fadeOutElements(snailBait.runningSlowlyElement, snailBait.RUNNING_SLOWLY_FADE_DURATION);
	snailBait.showSlowWarning = false;
	snailBait.updateDeveloperBackdoorCheckboxes()
});
snailBait.slowlyOkayElement.addEventListener("click", function(a) {
	snailBait.fadeOutElements(snailBait.runningSlowlyElement, snailBait.RUNNING_SLOWLY_FADE_DURATION);
	snailBait.resetSpeedSamples()
});
snailBait.musicCheckboxElement.addEventListener("change", function(a) { snailBait.musicOn = snailBait.musicCheckboxElement.checked; if(snailBait.musicOn) { snailBait.musicElement.play() } else { snailBait.musicElement.pause() } });
snailBait.soundCheckboxElement.addEventListener("change", function(a) { snailBait.soundOn = snailBait.soundCheckboxElement.checked });
snailBait.canvas.addEventListener("mousedown", function(a) { if(snailBait.developerBackdoorVisible) { snailBait.startDraggingGameCanvas(a) } });
snailBait.canvas.addEventListener("mousemove", function(a) { if(snailBait.developerBackdoorVisible && snailBait.dragging) { snailBait.dragGameCanvas(a) } });
window.addEventListener("mouseup", function(a) { if(snailBait.developerBackdoorVisible) { snailBait.stopDraggingGameCanvas() } });
snailBait.highScoreNameElement.addEventListener("keypress", function() {
	if(snailBait.highScoreNamePending) {
		snailBait.highScoreAddScoreElement.disabled = false;
		snailBait.highScoreNamePending = false
	}
});
snailBait.highScoreAddScoreElement.addEventListener("click", function() {
	snailBait.highScoreAddScoreElement.disabled = true;
	snailBait.serverSocket.emit("set high score", { name: snailBait.highScoreNameElement.value, score: snailBait.score })
});
snailBait.highScoreNewGameElement.addEventListener("click", function() {
	snailBait.highScoreAddScoreElement.disabled = true;
	snailBait.hideHighScores();
	snailBait.restartGame()
});
try {
	snailBait.serverSocket.on("high score", function(a) {
		if(snailBait.score > a.score) {
			snailBait.serverSocket.emit("get high scores");
			snailBait.highScoreNamePending = true
		} else {
			snailBait.revealCredits();
			snailBait.livesElement.style.opacity = 0.2;
			snailBait.scoreElement.style.opacity = 0.2;
			snailBait.instructionsElement.style.opacity = 0.2;
			snailBait.soundAndMusicElement.style.opacity = 0.2
		}
	});
	snailBait.serverSocket.on("high scores", function(b) { snailBait.highScoreListElement.innerHTML = ""; for(var a = 0; a < b.scores.length; a += 2) { snailBait.highScoreListElement.innerHTML += "<li>" + b.scores[a + 1] + " by " + b.scores[a] + "</li>" } snailBait.revealHighScores() });
	snailBait.serverSocket.on("high score set", function(a) { snailBait.serverSocket.emit("get high scores") })
} catch(err) {} snailBait.showHowLink.addEventListener("click", function(b) {
	var a = 1000;
	snailBait.fadeOutElements(snailBait.mobileWelcomeToast, a);
	snailBait.drawMobileInstructions();
	snailBait.revealMobileStartToast();
	snailBait.mobileInstructionsVisible = true
});
snailBait.mobileStartLink.addEventListener("click", function(b) {
	var a = 1000;
	snailBait.fadeOutElements(snailBait.mobileStartToast, a);
	snailBait.mobileInstructionsVisible = false;
	snailBait.playSound(snailBait.coinSound);
	snailBait.playing = true
});
snailBait.welcomeStartLink.addEventListener("click", function(b) {
	var a = 1000;
	snailBait.playSound(snailBait.coinSound);
	snailBait.fadeOutElements(snailBait.mobileWelcomeToast, a);
	snailBait.playing = true
});
snailBait.initializeImages();
snailBait.createSprites();
snailBait.createAudioChannels();
snailBait.drawRuler();
snailBait.detectMobile();
if(snailBait.mobile) {
	snailBait.DEFAULT_RUNNING_SLOWLY_THRESHOLD = 30;
	snailBait.instructionsElement = document.getElementById("snailbait-mobile-instructions");
	snailBait.addTouchEventHandlers();
	if(/android/i.test(navigator.userAgent)) {
		snailBait.cannonSound.position = 5.4;
		snailBait.coinSound.position = 4.8;
		snailBait.electricityFlowingSound.position = 0.3;
		snailBait.explosionSound.position = 2.8;
		snailBait.pianoSound.position = 3.5;
		snailBait.thudSound.position = 1.8
	}
}
snailBait.fitScreen();
window.addEventListener("resize", snailBait.fitScreen);
window.addEventListener("orientationchange", snailBait.fitScreen);