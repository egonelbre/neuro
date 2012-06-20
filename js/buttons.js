var loadWires = function(state, net, def){
	for(var k = 0; k < def.output.length; k += 1){
		var nodeDef = def.output[k],
			node = net.Node(nodeDef.name);
		console.log(node.name, ":", def.offset);
		node.bias = def.offset;
	}

	for(var f = 0; f < def.input.length; f += 1){
		var fromDef = def.input[f],
			from = net.Node(fromDef.name);
		for(var t = 0; t < def.output.length; t += 1){
			var toDef = def.output[t],
				to = net.Node(toDef.name);

			var wire = net.Wire(from, to);
			wire.setWeight(fromDef.multiplier / toDef.multiplier);
		}
	}
}

var loadLayouts = function(state, net, def){
	var x = state.layer * 200,
		y = -100*def.nodes.length/2;
	for(var i = 0; i < def.nodes.length; i += 1){
		var node = net.Node(def.nodes[i].name);
		node.view.pos.x = x;
		node.view.pos.y = y;
		y += 100 + Math.random()*100;
	}
	state.layer += 1;
}

var doAssignments = function(state, net, def){
	if(def.property == "value"){
		for(var i = 0; i < def.nodes.length; i += 1){
			var node = net.Node(def.nodes[i].name),
				val = node.value;
			if(def.value == "vert"){
				var i = 0;
				for(var y = 0; y < val.size.y; y += 1)
					for(var x = 0; x < val.size.x; x += 1){
						val.value[i] = y*2 / val.size.y - 1.0;
						i += 1;
					}
			}
			if(def.value == "horz"){
				var i = 0;
				for(var y = 0; y < val.size.y; y += 1)
					for(var x = 0; x < val.size.x; x += 1){
						val.value[i] = x*2 / val.size.x - 1.0;
						i += 1;
					}
			}
			node.update();
		}
	}
}

var loadFromDefiniton = function(def){
	var net = new Net(),
	    state = {layer : 0};
	for(var i = 0; i < def.length; i += 1){
		var row = def[i];

		if(row.typ == "wire")
			loadWires(state, net, row.def);
		else if(row.typ == "layout")
			loadLayouts(state, net, row.def);
		else if(row.typ == "assign")
			doAssignments(state, net, row.def);
	}
	return net;
};

load.onclick = function(){
	log.innerHTML = "processing...";
	var text = input.value;
	try {
		var def = neury.parse(text);
		var net = loadFromDefiniton(def);
		main.net = net;
		log.innerHTML = "";
	} catch (err){
		log.innerHTML = err;
	}
};

step.onclick = function(){
	main.net.cpu.process();
};

run.onclick = function(){
	main.net.cpu.paused = false;
};

stop.onclick = function(){
	main.net.cpu.paused = true;
};