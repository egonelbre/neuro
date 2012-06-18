function HUDStack(){
    this.name = "";
    this.owner = null;
    this.touches = {};
    this.huds = [];
    this.offset = {x:100, y:100};
    this.zoom = 0.7;
    this.size = {x:0,y:0};

    this.add(new Grid());
    this.add(new HUDStackScroll());
}

HUDStack.methods({
    renderTouches : function(ctx){
        for(var n in this.touches){
            if(this.touches.hasOwnProperty(n)){
                var touch = this.touches[n];
                ctx.beginPath();
                ctx.fillStyle = touch.color;
                ctx.arc(touch.x, touch.y, 10, 0, Math.PI*2, false);
                ctx.fill();
            }
        }
    },
    render : function(ctx){
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(this.offset.x, this.offset.y);

        for(var i = 0; i < this.huds.length; i += 1)
            this.huds[i].render(ctx);

        this.renderTouches(ctx);

        ctx.restore();
    },
    touch : function(action, e){
        // e.scroll is the transformed position on the canvas
        // e.cx.     
        e.scroll = V.inverseTransform(e.pos, this.offset, this.zoom);

        for(var i = 0; i < this.huds.length; i += 1){
            var handled = this.huds[i].touch(action, e);
            if(handled)
                return;
        };

        if(!this.touches[e.identifier])
            this.touches[e.identifier] = {x:e.scroll.x, y:e.scroll.y, color:"#f00"};

        this.touches[e.identifier].x = e.scroll.x;
        this.touches[e.identifier].y = e.scroll.y;

        if(action == "start"){
            this.touches[e.identifier].color = '#'+Math.floor(Math.random()*16777215).toString(16);
        }

        if((action == "end") || (action == "cancel"))
            delete this.touches[e.identifier];
    },
    add : function(hud){
        hud.owner = this;
        this.huds.push(hud);
    }
});

function HUDStackScroll(){
    this.owner = null;
    this.last = {x:0, y:0};
}

HUDStackScroll.methods({
    render : function(ctx){

    },
    touch : function(action, e){
        var stack = this.owner;
        if(action == "wheel"){
            stack.zoom *= e.wheelDelta > 0 ? 1.2 : 1/1.2;
            if(stack.zoom < 0.25)
                stack.zoom = 0.25;
            if(stack.zoom > 4)
                stack.zoom = 4;
            if(Math.abs(stack.zoom - 1.0) < 0.1 )
                stack.zoom = 1.0;
            return true;
        };

        if(e.button == 1){
            if(action == "start")
                V.set(this.last, e.pos);

            stack.offset.x += (e.pos.x - this.last.x) / stack.zoom;
            stack.offset.y += (e.pos.y - this.last.y) / stack.zoom;

            V.set(this.last, e.pos);
            
            return true;
        }
        console.log(e);
    }
})