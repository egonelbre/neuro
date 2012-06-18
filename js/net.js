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

function Net(){
	this.nodes = {};
	this.ports = [];
	this.wires = [];
	this.cpu = new CPU();
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
	// element constructors
	Node : function(name){
		var node = new Node(this, name);
		this.nodes[name] = node;
		this.ports.push(node.input);
		this.ports.push(node.output);
		node.signal(this);
		return node;
	},
	Wire : function(from, to){
		var wire = new Wire(this, from.output, to.input);
		this.wires.push(wire);
		wire.signal(this);
		return wire;
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
		return {data: data, modifier: this.modifier};
	}
});
