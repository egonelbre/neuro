Math.sgn = function(x){
	return x > 0 ? 1.0 : x < 0 ? -1.0 : 0.0;
};

Math.sigmoid = function(x){
	return 1 / (1 + Math.exp(-x));
};