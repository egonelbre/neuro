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
		var view = node.view;

		ctx.strokeStyle = "#111";
		ctx.lineWidth = 1;
		
		ctx.fillStyle = timeToColor(net, node.time);
		ctx.beginPath();
		ctx.arc(view.pos.x, view.pos.y, view.radius, 0, tau, 0);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.arc(view.pos.x - view.radius, 
			    view.pos.y, view.radius/3, 0, tau, 0);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(view.pos.x + view.radius, 
			    view.pos.y, view.radius/3, 0, tau, 0);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = "#000";
		ctx.font = "11px Georgia, sans-serif";

	    ctx.fillTextC(node.name,
	        view.pos.x, 
	        view.pos.y);

	   	node.value.render(ctx, view.pos.x, view.pos.y + view.radius);
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
        ctx.font = "11px Georgia, sans-serif";
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.fillStyle = "#eee";
        ctx.strokeStyle = "#111";
        ctx.arc(view.center.x, view.center.y, view.radius, 0, tau, 0);
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
			wire.view = {
				from : {x : 0, y : 0},
				to : {x : 0, y : 0},
				center : { x : 0, y : 0 },
				hover : false,
				radius : 20
			};
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
			
			var distSq = V.distSq(wire.view.center, e.scroll);
			if(distSq < wire.view.radius * wire.view.radius)
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

