RenJS.transitions = {
    CUT: function(from,to,position,scaleX){
        if (from){
            from.alpha = 0;
        }
        if (to) {
            to.alpha = 1;
            setNewProperties(to,position,scaleX);
        }
        RenJS.resolve();
    },
    FADE: function(from,to,position,scaleX){
        if (!from){
            RenJS.transitions.FADEIN(to,position,scaleX);
            return;
        } 
        if (!to){
            RenJS.transitions.FADEOUT(from);
            return;
        }
        RenJS.tweenManager.chain([
            {sprite:from,tweenables:{alpha:0},callback:function(){
                setNewProperties(to,position,scaleX);
            }},
            {sprite:to,tweenables:{alpha:1},callback:RenJS.resolve}
        ],config.fadetime);               
    },
    FADEOUT: function(from){
        RenJS.tweenManager.tween(from,{ alpha: 0 },RenJS.resolve,config.fadetime,true);
    },
    FADEIN: function(to,position,scaleX){
        setNewProperties(to,position,scaleX);
        RenJS.tweenManager.tween(to,{ alpha: 1 },RenJS.resolve,config.fadetime,true);        
    },
    FUSION: function(from,to,position,scaleX,group){
        if (!from || !to){
            RenJS.transitions.FADE(from,to,position);
            return;
        }   
        if (group) {
            group.bringToTop(to);
        }
        setNewProperties(to,position,scaleX);
        RenJS.tweenManager.tween(to,{ alpha: 1 },function(){
            from.alpha = 0;
            RenJS.resolve();
        },config.fadetime,true);
        // RenJS.tweenManager.parallel([
        //     {sprite:from,tweenables:{alpha:0}},
        //     {sprite:to,tweenables:{alpha:1},callback:RenJS.resolve}
        // ],config.fadetime);
    },
    MOVE: function(from,to,position,scaleX){
        if (!from || !to){
            RenJS.transitions.CUT(from,to,position);
            return;
        } 
        RenJS.tweenManager.tween(from,{ x:position.x,y:position.y },function(){
            setNewProperties(to,position,scaleX);
            from.alpha = 0;
            to.alpha = 1;
            RenJS.resolve();
        },config.fadetime,true);
    },

    FADETOCOLOUR: function(from,to,position,scaleX,colour){
        var spr_bg = game.add.graphics(0, 0);
        // this.fadeColor = fadeColor ? fadeColor : 0x000000;
        spr_bg.beginFill(colour, 1);
        spr_bg.drawRect(0, 0, phaserConfig.w, phaserConfig.h);
        spr_bg.alpha = 0;
        spr_bg.endFill();
        RenJS.tweenManager.chain([
            {sprite:spr_bg,tweenables:{alpha:1},callback:function(){
                if (from){
                    from.alpha = 0;
                }
                if (to) {
                    setNewProperties(to,position,scaleX);
                    to.alpha = 1;
                }
            }},
            {sprite:spr_bg,tweenables:{alpha:0},callback:function() {
                spr_bg.destroy();
                RenJS.resolve();
            }}
        ],config.fadetime);
    },
    FADETOBLACK: function(from,to,position){
        RenJS.transitions.FADETOCOLOUR(from,to,position,0x000000)
    },
    FADETOWHITE: function(from,to,position){
        RenJS.transitions.FADETOCOLOUR(from,to,position,0xFFFFFF)
    }
}

function setNewProperties(sprite,position,scaleX){
    sprite.x = position.x;
    sprite.y = position.y;
    if (scaleX!=null && scaleX!=undefined){
        sprite.scale.x = scaleX;
    }
}

