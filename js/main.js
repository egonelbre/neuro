var body = document.body,
	canvas = document.getElementById("view"),
	ctx = canvas.getContext("2d");

document.body.clientWidth;

// MAKE MULTIPLE OBJECTS

var make = function(clzs){
	var objs = [];
	for(var i = 0; i < clzs.length; i += 1)
		objs.push(new clzs[i]());
	return objs;
}

// MAIN CONTROLLER
main = {
	controls : {
		control : false,
		shift : false,
		alt : false
	},
	size : { x: 800, y: 480	},
	huds : new HUDStack(
		make([	Grid,
				HUDStackScroll,
			    NetUI, 
		  		NetMover, 
		  		WireAdjuster,
		  		BiasAdjuster,
		  		WireDrawer])
	),
	key : function(action, e){
		requestRender();
	},
	touch : function(action, e){
		this.huds.touch(action, e);
		requestRender();
	},
	update : function(){

	},
	render : function(ctx){
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, this.size.x, this.size.y);

		this.huds.size.x = this.size.x;
		this.huds.size.y = this.size.y;
		this.huds.render(ctx);
	},
	setSize : function(size){
		this.size.x = size.x;
		this.size.y = size.y;
	},

	net : new Net()
};

// SETUP AUTO UPDATE

setInterval(function(){
	main.net.cpu.update();
}, 40);

canvas.width = main.size.x;
canvas.height = main.size.y;

// SETUP RENDERING

function render(){ 
	main.update();
	main.render(ctx);
	last = 0;
}

fps = 24;
last = 0;
function requestRender(){
    setTimeout(function(){
        window.cancelAnimationFrame(last);
        last = window.requestAnimationFrame(render);
    }, 1000/fps);
}

setInterval(requestRender, 33);
requestRender();

// ADD BUTTON ACTIONS

var $on = function(id, action, func){
	var item = document.getElementById(id);
	item.addEventListener(action, func);
};

$on("load", "click", function(){
	log.innerHTML = "processing...";
	var text = input.value;
	try {
		var net = loader.createFromText(text);
		main.net = net;
		log.innerHTML = "";
	} catch (err){
		log.innerHTML = err;
	}
});

$on("step", "click", function(){
	main.net.cpu.process();
});

$on("run", "click", function(){
	main.net.cpu.paused = false;
});

$on("stop", "click", function(){
	main.net.cpu.paused = true;
});

load.click();
