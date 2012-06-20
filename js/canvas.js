"use strict";

var tau = Math.PI*2;

var angle_between = function(from, to){
	var dx = from.x - to.x,
		dy = from.y - to.y;
	return Math.atan2(dy, dx);
};

CanvasRenderingContext2D.prototype.arrow = function(points, width, lineWidth, head){
    if(points.length < 2){
    	throw "Requires at least 2 points!";
    }
    
    lineWidth = lineWidth || 1;
    head = head || width;

    var fill = ctx.fillStyle,
    	stroke = ctx.strokeStyle;

    var angle, dx, dy, prex, prey, last;

    this.lineWidth = width;
    this.lineCap = "round";
    this.lineJoin = "round";

    this.beginPath();
    this.moveTo(points[0].x, points[0].y);
    for(var i = 1; i < points.length-1; i += 1){
    	this.lineTo(points[i].x, points[i].y);
    }

    last = points[points.length-1];

    angle = angle_between(points[points.length-2], last);
    dx = Math.cos(angle)*head*2;
    dy = Math.sin(angle)*head*2;

    prex = last.x + dx,
    prey = last.y + dy;
    
    this.lineTo(prex, prey);
    this.stroke();

    this.strokeStyle = fill;
    this.lineWidth = width - lineWidth*2;
    this.stroke();

    this.strokeStyle = stroke;

    this.lineWidth = lineWidth;
    this.lineCap = "butt";
    this.lineJoin = "miter";

    this.beginPath();
    
    angle += tau/4;
    dx = Math.cos(angle)*head;
    dy = Math.sin(angle)*head;
    
    this.moveTo(prex+dx, prey+dy);
    this.lineTo(last.x, last.y);
    this.lineTo(prex-dx, prey-dy);

    this.closePath();
	this.fill();
    this.stroke();
};

CanvasRenderingContext2D.prototype.fillTextC = function(text, x, y){
    var tm = this.measureText(text);
    tm.height = this.measureText("X").width;

    ctx.fillText(text,
        x - tm.width / 2,
        y + tm.height / 2);
};

// possible calling conventions
// (imagedata, dx, dy)
// (imagedata, dx, dy, dw, dh)
// (imagedata, sx, sy, sw, sh, dx, dy, dw, dh)
CanvasRenderingContext2D.prototype.drawImageData = function(
    imageData, sx, sy, sw, sh, dx, dy, dw, dh){
    if(!this.tempCanvas){
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
    }

    if(sw == undefined){
        sw = imageData.width;
        sh = imageData.height;
    }

    if(dx == undefined){
        dx = sx;
        dy = sy;
        sx = 0;
        sy = 0;
    }

    if(dw == undefined){
        dw = sw;
        dh = sh;
        sw = imageData.width;
        sh = imageData.height;
    }

    var canvas = this.tempCanvas,
        ctx = this.tempCtx;

    if(canvas.width < sw)
        canvas.width = sw;
    if(canvas.height < sh)
        canvas.height = sh;

    ctx.putImageData(imageData, -sx, -sy);
    this.drawImage(canvas, 
        0, 0, sw, sh,
        dx, dy, dw, dh);
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


