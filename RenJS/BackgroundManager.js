function BackgroundManager(){

    this.backgrounds = {};
    this.current = null;

    this.add = function(name,image){
        this.backgrounds[name] = RenJS.storyManager.backgroundSprites.create(game.world.centerX,game.world.centerY,(image ? image : name));
        this.backgrounds[name].name = name;
        this.backgrounds[name].anchor.set(0.5);
        this.backgrounds[name].alpha = 0;
    }

    this.set = function (name) {
        if (this.current){
            this.current.alpha = 0;
        }
        this.current = this.backgrounds[name];
        this.current.alpha = 1;
    }

    this.show = function(name,transition){   
        var oldBg = this.current;
        this.current = name ? this.backgrounds[name] : null;
        // console.log("showing bg "+name);
        // debugger;
        transition(oldBg,this.current,{x:game.world.centerX,y:game.world.centerY},1,RenJS.storyManager.backgroundSprites);        
    }

    this.hide = function(bg,transition){   
        this.show(null,transition ? transition : RenJS.transitions.FADEOUT);
    }
}

