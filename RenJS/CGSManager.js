function CGSManager(){
    this.cgs = {};
    this.current = {};

    this.set = function (current) {
        this.hideAll();
        this.current = current;
        _.each(this.current, function (props,name) {
           this.show(name,RenJS.transitions.CUT,props)
        },this);
    }

    this.show = function(name,transition,props){
        // console.log(name);
        // console.log(transition);
        // console.log(props);
        var position = props.position ? props.position : {x:game.world.centerX,y:game.world.centerY};
        
        this.cgs[name] = RenJS.storyManager.cgsSprites.create(position.x,position.y,name);            
        this.cgs[name].anchor.set(0.5);        
        this.cgs[name].alpha = 0;
        if (props.zoom){
            this.cgs[name].scale.set(props.zoom);    
        }        
        if (props.angle){
            this.cgs[name].angle = props.angle;
        }        
        this.current[name] = {name:name, position: position, zoom:props.zoom,angle: props.angle};
        transition(null,this.cgs[name],position);
    }

    this.animate = function(name,toTween,time){
        // debugger;
        var tweenables = {};
        if (toTween.alpha != undefined && toTween.alpha != null) {
            tweenables.alpha = toTween.alpha;
        }
        if (toTween.angle != undefined && toTween.angle != null) {
            tweenables.angle = toTween.angle;
        }
        if (toTween.position != undefined && toTween.position != null) {
            tweenables.x = toTween.position.x;
            tweenables.y = toTween.position.y;
        }
        this.current[name] = _.union(this.current[name],toTween);
        if (toTween.zoom != undefined && toTween.zoom != null) {
            RenJS.tweenManager.parallel([
                {sprite:this.cgs[name],tweenables:tweenables},
                {sprite:this.cgs[name].scale,tweenables:{x:toTween.zoom,y:toTween.zoom},callback:RenJS.resolve},
            ],time);
        } else {
            RenJS.tweenManager.tween(this.cgs[name],tweenables,RenJS.resolve,time,true);
        }
    }

    this.hide = function(name,transition){
        if (this.cgs[name]){
            RenJS.control.doBeforeResolve = function(){
                RenJS.cgsManager.cgs[name].destroy();
                delete RenJS.cgsManager.cgs[name];
                delete RenJS.cgsManager.current[name];
            }
            transition(this.cgs[name],null);
        } else {
            RenJS.resolve();
        }
    }

    this.hideAll = function(){
        RenJS.storyManager.cgsSprites.removeAll(true);
        this.cgs = {};
        this.current = {};
    }
}

