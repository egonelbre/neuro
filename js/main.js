var tau = Math.PI * 2;

var body = document.body,
	canvas = document.getElementById("view"),
	ctx = canvas.getContext("2d");

document.body.clientWidth;

main = {
	controls : {
		control : false,
		shift : false,
		alt : false
	},
	size : { x: 800, y: 480	},
	huds : new HUDStack(),
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
		this.huds.render(ctx);
	},
	setSize : function(size){
		this.size.x = size.x;
		this.size.y = size.y;
	}
};

canvas.width = main.size.x;
canvas.height = main.size.y;

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

setInterval(requestRender, 1000);
requestRender();
