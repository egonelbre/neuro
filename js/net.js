//TODO: type asserts

function CPU(){
	this.paused = false;
	this.next = {};
	this.hotness = 1.0;
}

CPU.methods({
	schedule : function(node){
		this.next[node.name] = node;
	},
	toggle : function(){
		this.paused = !this.paused;
	},
	process : function(){
		if(this.paused)
			return;

		this.hotness *= 0.8;
		
		var cur = this.next,
			keys = Object.keys(cur);
		
		if(keys.length <= 0)
			return;
		
		this.next = {};
		keys.map(function(n){ cur[n].compute(); });
		keys.map(function(n){ cur[n].update(); });

		this.hotness = 1.0;
	}
});

function GUI(){}

GUI.methods({
	renderNode : function(ctx, net, node){
		this.positionNode(net, node);
		var view = node.view;

		ctx.strokeStyle = "#111";
		ctx.lineWidth = 1;
		
		ctx.fillStyle = view.hover ? "#ecd" : "#ddd";
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
	render : function(ctx, net){
		var g = this,
			keys = Object.keys(net.nodes);
		keys.map(function(name){ g.renderNode(ctx, net, net.nodes[name]);});
		net.wires.map(function(wire){ g.renderWire(ctx, net, wire); });
	},
	positionNode : function(net, node){
		if(node.view == null){
			node.view = {
				pos : { x : Math.random()*500, 
				        y : Math.random()*500 },
				hover : false,
				radius : 20
			};
		}
	},
	positionWire : function(net, wire){
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

function Net(){
	this.nodes = {};
	this.ports = [];
	this.wires = [];
	this.cpu = new CPU();
	this.gui = new GUI();
}

Net.methods({
	has : function(name){
		return this.nodes[name] != undefined;
	},
	update : function(){
		var net = this,
			keys = Object.keys(this.nodes);
		keys.map(function(name){
			net.nodes[name].signal(this);
		});
	},
	// for debugging
	print : function(){
		var net = this,
			status = "===\n",
			keys = Object.keys(this.nodes);
		keys.map(function(name){
			var node = net.nodes[name];
			status += name + ":" + node.value + ":" + node.bias + "\n";
		});	
		return status;
	},

	render : function(ctx){
		this.gui.render(ctx, this);
	},
	touch : function(action, e){

	},
	// api
	addNode : function(node){
		node.net = this;
		this.nodes[node.name] = node;
		this.ports.push(node.input);
		this.ports.push(node.output);
	},
	addWire : function(wire){
		this.wires.push(wire);
		wire.signal(this);
	},

	// element constructors
	Node : function(name){
		if(this.nodes[name] != undefined)
			return this.nodes[name];
		var node = new Node(name);
		this.addNode(node);
		node.signal(this);
		return node;
	},
	Wire : function(from, to){
		if(typeof from == "string")
			from = this.Node(from);
		if(typeof to == "string")
			to = this.Node(to);
		for(var i = 0; i < this.wires.length; i += 1){
			var wire = this.wires[i];
			if((wire.from.owner == from) && (wire.to.owner == to))
				return wire;
		}
		var wire = new Wire(from.output, to.input);
		this.addWire(wire);
		return wire;
	}
});

// Node drives computation
function Node(name){
	this.net = null;
	this.name = name;
	this.input = new Port(this);
	this.output = new Port(this);
	this.bias = 0;
	this.value = 0;
	this.view = null;
}

Node.methods({
	// set the node and output port value
	set : function(value){
		this.value = value;
		this.output.set(this.value);
	},
	// schedule an update for this node
	signal : function(sender){
		if(this.net != null)
			this.net.cpu.schedule(this);
	},
	// compute the next value for the output port
	compute : function(){
		var inputs = this.input.collect();
		// aggregate inputs
		var value = this.bias;
		for(var i = 0; i < inputs.length; i += 1){
			var inp = inputs[i];
			value += inp.data * inp.modifier;
		}
		// neuron function
		value = value > 0.0 ? 1.0 : value < 0.0 ? -1.0 : 0.0;
		// store the new value
		this.value = value;
	},
	// set the output port to the target value
	update : function(){
		this.output.set(this.value);
	}
});

// Port is basically a multiplexer for wires
function Port(owner){
	this.owner = owner;
	this.wires = [];
	this.value = null;
}

Port.methods({
	// set the port value
	// signal connected ports
	set : function(value){
		//TODO: check value type
		if(this.value == value)
			return;
		this.value = value;
		for(var i = 0; i < this.wires.length; i += 1){
			var w = this.wires[i];
			w.signal(this);
		}
	},
	// get the current value
	get : function(){
		return this.value;
	},
	// collect information from the wires
	collect : function(){
		var result = [];
		for(var i = 0; i < this.wires.length; i += 1){
			var wire = this.wires[i];
			result.push(wire.get());
		}
		return result;
	},
	// signal the owner node
	signal : function(sender){
		this.owner.signal(sender);
	}
});

// Wire is basically a signal transimtter
function Wire(from, to){
	this.from = from;
	this.to = to;
	this.modifier = 1.0;
	this.view = null;

	this.from.wires.push(this);
	this.to.wires.push(this);
}

Wire.methods({
	// signal the target port
	signal: function(sender){
		this.to.signal(sender);
	},
	// get the value from source port
	get: function(){
		var data = this.from.get();
		return {data: data, modifier: this.modifier};
	}
});
