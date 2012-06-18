
function Grid(){
    this.owner = null;
    this.density = 40;
}

Grid.methods({
    render : function(ctx){
        var stack = this.owner,
            px = 1/stack.zoom;

        // canvas size in model coordinates
        var sz = {x : stack.size.x * px,
                  y : stack.size.y * px};
        
        ctx.lineWidth = 0.5*px;
        ctx.strokeStyle = "#333";

        ctx.beginPath();
        ctx.rect(-5,-5,10,10);
        ctx.stroke();

        ctx.lineWidth = 0.2*px;
        ctx.strokeStyle = "#333";
        
        ctx.beginPath();

        var left   = -stack.offset.x,
            right  = sz.x-stack.offset.x,
            top    = -stack.offset.y,
            bottom = -stack.offset.y+sz.y;

        ctx.moveTo(left, 0);
        ctx.lineTo(right, 0);

        ctx.moveTo(0, top);
        ctx.lineTo(0, bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 0.1*px;
        ctx.strokeStyle = "#bbb";

        var x = (((left - this.density)/this.density)|0) * this.density,
            y = (((top - this.density)/this.density)|0) * this.density;

        for(; x < right; x += this.density){
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
        }

        for(; y < bottom; y += this.density){
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
        }

        ctx.stroke();
    },
    touch : function(action, e){

    }
});