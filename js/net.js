//TODO: type asserts

function CPU(){
	this.hotness = 1.0;
	this.paused = false;
	this.next = {};
}

CPU.methods({
	schedule : function(node){
		this.next[node.name] = node;
	},
	process : function(){
		var cur = this.next,
			keys = Object.keys(cur);
		this.next = {};
		keys.map(function(n){ cur[n].compute(); });
		keys.map(function(n){ cur[n].update(); });
	}
});

function Net(){
	this.nodes = {};
	this.ports = [];
	this.wires = [];
	this.CPU = new CPU();
}

Net.methods({
	hasNode : function(name){
		return this.nodes[name] != undefined;
	},
	newNode : function(name){
		var node = new Node(this, name);
		this.nodes[name] = node;
		this.ports.push(node.input);
		this.ports.push(node.output);
		return node;
	},
	newWire : function(from, to){
		var wire = new Wire(this, from.output, to.input);
		this.wires.push(wire);
		return wire;
	},
	signalNodes : function(){
		var net = this,
			keys = Object.keys(this.nodes);
		keys.map(function(name){
			net.nodes[name].signal(this);
		});
	},
	print : function(){
		var net = this,
			status = "===\n",
			keys = Object.keys(this.nodes);
		keys.map(function(name){
			var node = net.nodes[name];
			status += name + ":" + node.value + ":" + node.bias + "\n";
		});	

		console.log(status);
	}
});

// Node drives computation
function Node(net, name){
	this.net = net;
	this.name = name;
	this.input = new Port(this.net, this);
	this.output = new Port(this.net, this);
	this.bias = 0;
	this.value = 0;
}

Node.methods({
	// set the node and output port value
	set : function(value){
		this.value = value;
		this.output.set(this.value);
	},
	// schedule an update for this node
	signal : function(sender){
		this.net.CPU.schedule(this);
	},
	// compute the next value for the output port
	compute : function(){
		var inputs = this.input.collect();
		var value = this.bias;
		for(var i = 0; i < inputs.length; i += 1){
			value += inputs[i];
		}

		value = value > 0.0 ? 1.0 : value < 0.0 ? -1.0 : 0.0;
		// aggregate inputs
		// apply function
		this.value = value;
	},
	// set the output port to the target value
	update : function(){
		this.output.set(this.value);
	}
});

// Port is basically a multiplexer for wires
function Port(net, owner){
	this.net = net;
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
function Wire(net, from, to){
	this.net = net;
	this.from = from;
	this.to = to;
	this.modifier = 1.0;

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
		return this.func(data, this.modifier);
	},
	// apply the modifier to the data
	func : function(data, modifier){
		//TODO: multiple dispatch based on data/modifier type
		return data * modifier;
	}	
});



net = new Net();
x = net.newNode("x")
y = net.newNode("y")
x$y = net.newWire(x, y);
y$x = net.newWire(y, x);

x.set(1.0);
y.set(-1.0);

net.signalNodes();