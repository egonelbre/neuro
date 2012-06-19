var loadFromDefiniton = function(def){
	var net = new Net();
	for(var i = 0; i < def.length; i += 1){
		var row = def[i];
		for(var k = 0; k < row.input.length; k += 1){
			var nodeDef = row.input[k],
				node = net.Node(nodeDef.name);
			node.bias = row.offset;
		}

		for(var f = 0; f < row.input.length; f += 1){
			var fromDef = row.input[f],
				from = net.Node(fromDef.name);
			for(var t = 0; t < row.output.length; t += 1){
				var toDef = row.output[t],
					to = net.Node(toDef.name);

				var wire = net.Wire(from, to);
				wire.modifier = fromDef.multiplier / toDef.multiplier;
			}
		}
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
	console.log();
};

run.onclick = function(){
	console.log();
};

stop.onclick = function(){
	console.log();
};