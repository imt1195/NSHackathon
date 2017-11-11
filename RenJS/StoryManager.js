function StoryManager(){

    this.setupStory = function(){        
        //load backgrounds
        this.backgroundSprites = game.add.group();
        _.each(RenJS.story.setup.backgrounds,function(filename,background){
            RenJS.bgManager.add(background,background);
        });
        //load characters
        this.behindCharactersSprites = game.add.group();
        this.characterSprites = game.add.group();
        _.each(RenJS.story.setup.characters,function(character,name){
            var displayName = character.displayName ? character.displayName : name;
            RenJS.chManager.add(name,displayName,character.speechColour,character.looks);
        });
        this.cgsSprites = game.add.group();
    }

    this.startScene = function(name){
        RenJS.control.execStack = [{c:-1,scene:name}];
        RenJS.logicManager.clearChoices(); //For any interrup still showing
        RenJS.chManager.hideAll();
        // RenJS.bgManager.hide();
        RenJS.cgsManager.hideAll();
        // RenJS.audioManager.stop();
        this.currentScene = _.clone(RenJS.story[name]);
        
        RenJS.resolve();
        // this.interpretScene();        
    }

    this.getActorType = function(actor){
        // is actor background or character
        if (!actor) {
            return null;
        }
        if (_.has(RenJS.chManager.characters,actor)){
            return "ch";
        }
        if (_.has(RenJS.bgManager.backgrounds,actor)){
            return "bg";
        }
        if (_.has(RenJS.audioManager.musicList,actor)){
            return "bgm";
        }
        if (_.has(RenJS.audioManager.sfx,actor)){
            return "sfx";
        }
        return "cgs";
    }

    this.interpretAction = function(action){
        // var availableActions = {
        //     "show":["ch","bg"],
        //     "hide":["ch","bg"],
        //     "say":["ch"],
        //     "choice":[]
        // };
        var actionParams = {
            withTransition: ["show","hide","play","stop"],
            withPosition: ["show"]
        }
        function getKey(act){
            return _.keys(act)[0];
        }
        return new Promise(function(resolve, reject) {
            RenJS.control.resolve = resolve;
            var key = getKey(action);
            var str = key.split(" ");
            var mainAction,actor;
            if (str[1] == "says") {
                mainAction = "say";
                actor = str[0];
            } else {
                mainAction = str[0];
                actor = str[1];
            }            
            var actorType = RenJS.storyManager.getActorType(actor);
            //parse WITH and AT
            var params = action[key];
            if (_.contains(actionParams.withTransition,mainAction)){
                str = params ? params.split(" ") : [];
                if (str.indexOf("WITH")!=-1){
                    action.transitionName = str[str.indexOf("WITH")+1];                    
                } else {
                    action.transitionName = config.transitions[actorType];
                }                
                action.transition = RenJS.transitions[action.transitionName];
            }
            if (params && _.contains(actionParams.withPosition,mainAction)){
                str = params ? params.split(" ") : [];
                if (str.indexOf("AT")!=-1){
                    action.position = str[str.indexOf("AT")+1];
                    if (_.has(config.positions,action.position)){
                        action.position = config.positions[action.position];
                    } else {
                        var coords = action.position.split(",");
                        action.position = {x:parseInt(coords[0]),y:parseInt(coords[1])};
                    }
                }
                if (str.length>0 && str[0]!="AT" && str[0]!="WITH"){
                    action.look = str[0];
                }
            }
            action.manager = RenJS[actorType+"Manager"];
            RenJS.control.action = mainAction; 
            RenJS.control.wholeAction = params; 
            RenJS.control.nextAction = null; 
            console.log("Doing "+RenJS.control.action);
            switch(RenJS.control.action){
                // case "custom": RenJS.control.action = "Custom fct"; action.execute(); break;
                case "var" :
                    RenJS.logicManager.setVar(actor,params);
                    break;
                case "if" :
                    var condition = key.substr(key.indexOf("("));
                    var branches = {
                        ISTRUE: action[key]
                    };
                    var next = _.first(RenJS.storyManager.currentScene);
                    if (next && getKey(next) == "else"){
                        branches.ISFALSE = next.else;
                        RenJS.storyManager.currentScene.shift();
                    }
                    RenJS.logicManager.branch(condition,branches);
                    break;
                case "else" :
                    RenJS.resolve();
                    break;
                case "show" :                     
                    action.manager.show(actor,action.transition,action);
                    break;
                case "hide" : 
                    action.manager.hide(actor,action.transition);
                    break;
                case "say" : 
                    RenJS.textManager.say(actor,params);
                    break;
                case "wait" : 
                    if (params == "click"){
                        RenJS.waitForClick();
                    } else {
                        RenJS.waitTimeout(parseInt(params));
                    }
                    break;
                case "animate" :
                    console.log(action);
                    RenJS.cgsManager.animate(actor,action,action.time)
                    break;
                case "choice" : 
                    // debugger;
                    RenJS.control.skipping = false;
                    RenJS.logicManager.showChoices(_.clone(params));
                    break;
                case "visualchoice" :
                    RenJS.control.skipping = false;
                    RenJS.logicManager.showVisualChoices(_.clone(params));
                    break;
                case "interrupt" : 
                    RenJS.logicManager.interrupt(actor,_.clone(params));
                    // debugger;
                    // if (params == "stop"){
                    //     // console.log("interrupting");
                    //     RenJS.logicManager.interrupting = false;
                    //     RenJS.logicManager.choose();
                    // } else {
                    //     RenJS.logicManager.interrupting = true;
                    //     RenJS.logicManager.showChoices(_.clone(params));
                    // }
                    break;
                case "text" :
                    RenJS.textManager.show(params);
                    break;
                case "play" :
                    // debugger;
                    if (actorType == "bgm"){
                        RenJS.audioManager.play(actor, "bgm", action.looped, action.transitionName);
                    } else {
                        RenJS.audioManager.playSFX(actor);
                        RenJS.resolve();
                    }
                    break;
                case "stop" :
                    RenJS.audioManager.stop("bgm",action.transitionName);
                case "effect" :
                    RenJS.effects[actor](action);
                    break;
                case "ambient" :
                    RenJS.ambient[actor](action.sfx);
                    break;
                case "scene" :
                    RenJS.storyManager.startScene(params);
                    break;
                case "call" :
                    RenJS.customContent[actor](params);
                    break;
                case "jsScript" :
                    params();
                    break;
            }
            
        }); 
    }

    this.interpret = function() {
        return new Promise(function(resolve, reject) {
            if (RenJS.storyManager.currentScene.length == 0 || RenJS.control.paused){
                // console.log("Resolving something here");
                resolve();
            } else {
                var action = RenJS.storyManager.currentScene.shift();
                _.each(RenJS.onInterpretActions,function(additionalAction){
                    //does extra stuff on every step
                    //like updating the execution stack
                    //or counting the interruption steps
                    additionalAction(action);
                });
                console.log("About to do");
                console.log(action);
                RenJS.storyManager.interpretAction(action).then(function(){
                    console.log("Done with last action "+_.keys(action)[0]);
                    return RenJS.storyManager.interpret();
                }).then(function(){
                    resolve();
                });
            };         
        }); 
    }

}