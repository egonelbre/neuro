function CPU(){
	this.hotness = 1.0;
	this.paused = false;
	this.cur
}

function Net(){
	this.nodes = [];
	this.CPU = new CPU();
}

Net.methods({
	schedule : function(node){

	}
});

function Node(net){
	this.net = net;
	this.input = new Port(this, "float", "in");
	this.output = new Port(this, "float", "out");
	this.bias = 0;
	this.value = null;
}

Node.methods({
	signal : function(sender){
		this.net.schedule(this);
	},
	compute : function(){
		var inputs = this.input.collect();
		var value = 0;
		for(var i = 0; i < inputs.length; i += 1){
			var input = inputs[i];
			value += input.data * input.modifier;
		}
		// aggregate inputs
		// apply function
		this.value = value;
	},
	update : function(){
		output.set(this.value);
	}
});

function Port(owner, typ){
	this.typ = typ;
	this.owner = owner;
	this.wires = [];
	this.value = null;
}

Port.methods({
	/* set the port value
	    signal connected ports if the value changed */
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
	get : function(){
		return this.value;
	},
	collect : function(){
		var result = [];
		for(var i = 0; i < this.wires.length; i += 1){
			var wire = this.wires[i];
			result.push(wire.get());
		}
		return result;
	},
	signal : function(sender){
		this.owner.signal(this);
	}
});

function Wire(from, to, modifier){
	this.from = from;
	this.to = to;
	this.modifier = modifier;
}

Wire.methods({
	signal: function(sender){
		this.to.signal(sender);
	},
	get: function(){
		var data = this.from.get();
		return this.func(data, this.modifier);
	},
	func : function(data, modifier){
		//TODO: generics
		return data * modifier;
	}	
});

function connectNodes(inp, out, data){
	if(inp.output.typ != out.output.typ)
		throw "Types do not match!";
	var w = new Wire(inp.output, out.input, data);
	inp.output.wires.add(w);
	out.input.wires.add(w);
}