function HUDStack(){
    this.name = "";
    this.owner = null;
    this.touches = {};
    this.huds = [];
    this.offset = {x:0, y:0};
    this.zoom = 1.0;
}

HUDStack.methods({
    render : function(ctx){
        var r = 40;
        if(main.controls.control)
            r = r + Math.sin(((new Date())-1)/300)*20;

        for(var n in this.touches){
            if(this.touches.hasOwnProperty(n)){
                var touch = this.touches[n];
                ctx.beginPath();
                ctx.fillStyle = touch.color;
                ctx.arc(touch.x, touch.y, r, 0, Math.PI*2, false);
                ctx.fill();
            }
        }

        for(var i = 0; i < this.huds.length; i += 1){
            this.huds[i].render(ctx);
        }
    },
    touch : function(action, e){
        if(!this.touches[e.identifier])
            this.touches[e.identifier] = {x:e.cx, y:e.cy, color:"#f00"};
        this.touches[e.identifier].x = e.cx;
        this.touches[e.identifier].y = e.cy;

        if(action == "start"){
            this.touches[e.identifier].color = '#'+Math.floor(Math.random()*16777215).toString(16);
        }

        if((action == "end") || (action == "cancel"))
            delete this.touches[e.identifier];

        for(var i = 0; i < this.huds.length; i += 1){
            this.huds[i].touch(action, e);
        }
    },
    add : function(hud){
        this.huds.push(hud);
    }
});
