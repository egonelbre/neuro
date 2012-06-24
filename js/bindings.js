var mouseDown = false;
var mouseBinding = function(action){
    return function(e){
        if(action == "start"){
            mouseDown = true;
        } else if (action == "end"){
            mouseDown = false;
        }
        if(!mouseDown && (action == "move")) return;

        var touch = e;
        touch.pos = { x: touch.offsetX,
                      y: touch.offsetY}
        touch.identifier = "mouse";
        main.touch(action, touch);

        e.preventDefault();
    }
};

canvas.onmousemove=mouseBinding("move");
canvas.onmousedown=mouseBinding("start");
canvas.onmouseup=mouseBinding("end");
canvas.onmousewheel=mouseBinding("wheel");

var keyBinding = function(action){
    return function(e){
        main.key(action, e);
    }
};

document.onkeydown=keyBinding("down");
document.onkeypress=keyBinding("press");
document.onkeyup=keyBinding("up");

var touchBinding = function(action){
    return function(e){
        e.preventDefault();

        for(var i = 0; i < e.changedTouches.length; i += 1){
            var touch = e.changedTouches[i];
            touch.pos = { x: touch.offsetX,
                          y: touch.offsetY}
            main.touch(action, touch);
        }
    }
};

canvas.addEventListener("touchstart",  touchBinding("start"));
canvas.addEventListener("touchend",    touchBinding("end"));
canvas.addEventListener("touchcancel", touchBinding("cancel"));
canvas.addEventListener("touchmove",   touchBinding("move"));
