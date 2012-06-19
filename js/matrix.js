function assert(cond){
	if(!cond)
		throw "error";
}

function Matrix(size){
	this.size = {x:size.x, y:size.y};
	this.count = size.x * size.y;
	this.value = new Float32Array(this.count);
	this.changed = true;
	this.imageData = null;
}

Matrix.methods({
	clone : function(){
		var m = new Matrix(this.size);
		m.assign(this);
		return m;
	},
	clear : function(value){
		value = value || 0;
		for(var i = 0; i < this.count; i += 1)
			this.value[i] = value;
		this.changed = true;
	},
	assign : function(other){
		assert(this.count == other.count);
		for(var i = 0; i < this.count; i += 1)
			this.value[i] = other.value[i];
		this.changed = true;
	},
	add : function(other, mul){
		assert(this.count == other.count);
		mul = mul || 1.0;
		for(var i = 0; i < this.count; i += 1)
			this.value[i] += other.value[i] * mul;
		this.changed = true;
	},
	addScalar : function(value){
		for(var i = 0; i < this.count; i += 1)
			this.value[i] += value;
		this.changed = true;
	},
	same : function(other){
		assert(this.count == other.count);
		var err = 0;
		for(var i = 0; i < this.count; i += 1){
			err += Math.abs(this.value[i] - other.value[i]);
			if(err > 0.001)
				return false;
		}
		return true;
	},
	applyFunc : function(fun){
		for(var i = 0; i < this.count; i += 1)
			this.value[i] = fun(this.value[i]);
		this.changed = true;
	},
	invalidate : function(ctx){
		if(this.imageData == null)
			this.imageData = ctx.createImageData(this.size.x, this.size.y);
		var i = 0,
			data = this.imageData.data;
		for(var k = 0; k < this.count; k += 1){
	        var v = this.value[k];
	        k += 1;
	        v = (v+1) / 2;
	        v = v > 1 ? 255 : v < 0 ? 0 : (v*255)|0;
	        data[i]   = v;
	        data[i+1] = v;
	        data[i+2] = v;
	        data[i+3] = 255;
	        i += 4;
		}
	},
	
	render : function(ctx, x, y){
		if(this.changed)
			this.invalidate(ctx);

		ctx.beginPath();
		ctx.rect(x-1, y-1, this.size.x+2, this.size.y+2);
		ctx.fill();
		ctx.stroke();

		ctx.drawImageData(this.imageData, x, y);
	}
});