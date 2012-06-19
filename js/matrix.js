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
	        var v = this.value[k] * 255,
	        	err = Math.abs(v) > 255 ? Math.abs(v) - 255 : 0;
	        err = err > 5 ? 255 : err;
	        if(v < 0){
	        	data[i]   = 255     - err;
		        data[i+1] = 255 + v - err;
		        data[i+2] = 255 + v - err;
	        } else {
	        	data[i]   = 255 - v - err;
		        data[i+1] = 255     - err;
		        data[i+2] = 255 - v - err;
	        }
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