function TextManager(){

    this.show = function(text,title,colour){
        var t = RenJS.logicManager.parseVars(text);
        RenJS.gui.showText(t,title,colour,function(){
            console.log("Waiting for click")
            RenJS.waitForClick(RenJS.textManager.hide);
        });
    };

    this.hide = function(){
        RenJS.gui.hideText();
        RenJS.resolve();
    }

    this.say = function(name,text){
        var character = RenJS.chManager.characters[name];
        this.show(text,character.name,character.speechColour);
    }
}

