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
		node.set(this.newValue());
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
	},

	// for defining net behaviour
	newValue : function(){
		return new Matrix({x:50, y:50});
	},
	aggregate : function(value, bias, inputs){
		// aggregate inputs
		value.clear(bias);
		for(var i = 0; i < inputs.length; i += 1){
			var inp = inputs[i];
			value.add(inp.data, inp.modifier);
		}

		value.applyFunc(function(x){
			return x > 0.0 ? 1.0 : x < 0.0 ? -1.0 : 0.0;
		});
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
	this.view = {
		pos : { x : Math.random()*500, 
		        y : Math.random()*500 },
		radius : 20
	};
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
		if(!this.net)
			return;
		var inputs = this.input.collect();
		this.net.aggregate(this.value, this.bias, inputs);
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
		if(this.value == null)
			this.value = value.clone()
		else if(this.value.same(value))
			return;
		
		this.value.assign(value);
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
