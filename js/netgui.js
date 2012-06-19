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
		
		ctx.fillStyle = "#ddd";
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
        ctx.fillStyle = "#ddd";
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

        var text = wire.modifier >= 1000 ? 
        	wire.modifier.toFixed(0): wire.modifier.toFixed(1);

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
	adjustItem : function(e){
	},
	touch : function(action, e){
		if(!this.adjusting && (action != "start"))
			return;
		if(e.button != 0) return;

		if(action == "start")
			this.selection = this.findItem(e);

		if(this.selection == null)
			return false;

		this.adjustItem(this.selection, e);
        
		if((action == "cancel") || (action == "end"))
			this.selection = null;

		this.adjusting = this.selection != null;
		return true;
	}
})

function NetMover(){
	//todo : inherit from NetAdjuster
	this.moving = false;
	this.selection = null;
	this.last = {x:0, y:0};
}

NetMover.methods({
	getNet : function(){
		return main.net;
	},
	render : function(ctx){
	},
	touch : function(action, e){
		if(!this.moving && (action != "start"))
			return;
		if(e.button != 0) return;

		var net = this.getNet(),
			keys = Object.keys(net.nodes);

		if(action == "start"){
			for(var i = 0; i < keys.length; i += 1){
				var node = net.nodes[keys[i]];
				if (node.view == null)
					continue;
				
				var distSq = V.distSq(node.view.pos, e.scroll);
				if(distSq < node.view.radius * node.view.radius){
					this.selection = node;
					break;
				}
			}
		}

		if(this.selection == null)
			return false;

        if(action == "start")
            V.set(this.last, e.scroll);

        this.selection.view.pos.x += e.scroll.x - this.last.x;
        this.selection.view.pos.y += e.scroll.y - this.last.y;

        V.set(this.last, e.scroll);

		if((action == "cancel") || (action == "end"))
			this.selection = null;
		this.moving = this.selection != null;

		return true;
	}
});

function WireAdjuster(){
	//todo : inherit from NetAdjuster
	this.moving = false;
	this.selection = null;
	this.last = {x:0, y:0};
}

WireAdjuster.methods({
	getNet : function(){
		return main.net;
	},
	render : function(ctx){
	},
	touch : function(action, e){
		if(!this.moving && (action != "start"))
			return;
		if(e.button != 0) return;

		var net = this.getNet();

		if(action == "start"){
			for(var i = 0; i < net.wires.length; i += 1){
				var wire = net.wires[i];
				if (wire.view == null)
					continue;
				
				var distSq = V.distSq(wire.view.center, e.scroll);
				if(distSq < wire.view.radius * wire.view.radius){
					this.selection = wire;
					break;
				}
			}
		}

		if(this.selection == null)
			return false;

        if(action == "start")
            V.set(this.last, e.pos);
        
        this.selection.modifier -= (e.pos.y - this.last.y)/2;

        V.set(this.last, e.pos);

		if((action == "cancel") || (action == "end"))
			this.selection = null;
		this.moving = this.selection != null;

		return true;
	}
});