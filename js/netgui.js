var timeToColor = function(net, time){
	var diff = net.cpu.time - time,
		norm = Math.exp(-diff/10),
		saturation = norm * 70,
		lightness = 95 - 20*norm;
	return "hsla(0,"+ (saturation|0) +"%, " + (lightness|0) + "%, 1.0)";
}

function NetUI(){
}

NetUI.methods({
	getNet : function(){
		return main.net;
	},
	renderNode : function(ctx, net, node){
		this.positionNode(net, node);
		var view = node.view,
			height = view.image + view.header + view.param;
		
		ctx.strokeStyle = "#111";
		ctx.lineWidth = 0.3;

		// ports
		ctx.fillStyle = "#ddd";
		var ports = [this.getNodePortIn(view, 0), this.getNodePortOut(view, 0)];
		for(var i = 0; i < ports.length; i += 1){
			var port = ports[i];
			ctx.beginPath();
			ctx.arc(port.x, port.y, port.radius, 0, Math.PI*2, 0);
			ctx.fill();
			ctx.stroke();
		}
		// background
		
		ctx.lineWidth = 0.5;
		ctx.fillStyle = timeToColor(net, node.time);
		ctx.beginPath();
		ctx.roundRect(view.pos.x, view.pos.y, view.width, height, 3);
		ctx.fill();
		ctx.stroke();

		// header
		ctx.fillStyle = "#000";
		ctx.font = (view.header - 2) + "px Georgia, sans-serif";
	    ctx.fillText(node.name,
	        view.pos.x + 5, 
	        view.pos.y + view.header - 2);

	    // header underline
	    ctx.lineWidth = 0.1;
	    ctx.beginPath();
	    ctx.moveTo(view.pos.x + 1, view.pos.y + view.header);
	    ctx.lineTo(view.pos.x - 1 + view.width, view.pos.y + view.header);
	    ctx.stroke();

	    // bias parameter
	    ctx.font = (view.param - 2) + "px Georgia, sans-serif";
	    ctx.fillText(node.bias.toFixed(1),
	    	view.pos.x + 3,
	    	view.pos.y + view.header + view.param - 2);

	    // current value
	   	node.value.render(ctx, view.pos.x + 1, view.pos.y + view.header + view.param + 1, view.width - 2, view.image - 2);
	},
	getNodePortIn : function(view, idx){
		var radius = 6,
			pad = 2;

		return {
			x : view.pos.x,
			y : view.pos.y + view.header + (radius + pad)*idx + 2,
			radius : radius
		}
	},
	getNodePortOut : function(view, idx){
		var radius = 6,
			pad = 2;

		return {
			x : view.pos.x + view.width,
			y : view.pos.y + view.header + (radius + pad)*idx + 2,
			radius : radius
		}
	},
	renderWire : function(ctx, net, wire){
		this.positionWire(net, wire);
		var view = wire.view;

        // draw line
        //ctx.fillStyle = "#ddd";
        ctx.fillStyle = timeToColor(net, wire.time);
        ctx.strokeStyle = "#444";
        ctx.arrow([view.from, view.to], 3, 0.3, 5);

        // draw text
        ctx.font = view.fontSize + "px Georgia, sans-serif";
        
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.fillStyle = "#eee";
        ctx.strokeStyle = "#111";

        ctx.roundRect(view.center.x - view.size.x/2,
        		 view.center.y - view.size.y/2,
        		 view.size.x, view.size.y, 3);

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000";

        var text = wire.weight >= 1000 ? 
        	wire.weight.toFixed(0): wire.weight.toFixed(1);

        ctx.fillTextC(text, view.center.x, view.center.y);
	},
	render : function(ctx){
		var net = this.getNet();

		var g = this,
			keys = Object.keys(net.nodes);
		keys.map(function(name){ g.renderNode(ctx, net, net.nodes[name]);});
		net.wires.map(function(wire){ g.renderWire(ctx, net, wire); });
	},
	touch : function(action, e){},
	positionNode : function(net, node){
		var net = this.net;
	},
	positionWire : function(net, wire){
		var net = this.net;

		if(wire.view == null){

		}
		var view = wire.view;
		
		V.set(view.from, wire.from.owner.view.pos);
		view.from.x += wire.from.owner.view.radius;

		V.set(view.to, wire.to.owner.view.pos);
		view.to.x -= wire.to.owner.view.radius;

		V.avg(view.from, view.to, view.center);
	}
});


function NetAdjuster(){
	this.adjusting = false;
	this.selection = false;
}

NetAdjuster.methods({
	getNet : function(){
		return main.net;
	},
	render : function(ctx){
	},
	findItem : function(e){
		return null;
	},
	adjustItem : function(item, e){
	},
	touch : function(action, e){
		if(!this.adjusting && (action != "start"))
			return;
		if(e.button != 0) return;

		if(action == "start")
			this.selection = this.findItem(action, e);

		if(this.selection == null)
			return false;

		this.adjustItem(action, e, this.selection);
        
		if((action == "cancel") || (action == "end"))
			this.selection = null;

		this.adjusting = this.selection != null;
		return true;
	}
})


function NetMover(){
	NetAdjuster.call(this);
	this.last = {x:0, y:0};
}
NetMover.inherit(NetAdjuster);
NetMover.methods({
	findItem : function(action, e){
		var net = this.getNet(),
			keys = Object.keys(net.nodes);
		for(var i = keys.length - 1; i >= 0; i -= 1){
			var node = net.nodes[keys[i]];
			if (node.view == null)
				continue;
			
			var distSq = V.distSq(node.view.pos, e.scroll);
			if(distSq < node.view.radius * node.view.radius)
				return node;
		}
	},
	adjustItem : function(action, e, item){
        if(action == "start")
            V.set(this.last, e.scroll);

        this.selection.view.pos.x += e.scroll.x - this.last.x;
        this.selection.view.pos.y += e.scroll.y - this.last.y;

        V.set(this.last, e.scroll);
	}
});

function WireAdjuster(){
	NetAdjuster.call(this);
	this.last = {x:0,y:0};
}
WireAdjuster.inherit(NetAdjuster);
WireAdjuster.methods({
	findItem : function(action, e){
		var net = this.getNet();

		for(var i = net.wires.length-1; i >= 0; i -= 1){
			var wire = net.wires[i];
			if (wire.view == null)
				continue;
			
			if(V.pointInsideRect(e.scroll, wire.view.center, wire.view.size))
				return wire;
		}
	},
	adjustItem : function(action, e, item){
        if(action == "start")
            V.set(this.last, e.pos);
        
        var value = this.selection.weight - (e.pos.y - this.last.y)/2;
        this.selection.setWeight(value);

        V.set(this.last, e.pos);
	}
});

