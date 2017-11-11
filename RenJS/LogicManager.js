function LogicManager(){

    this.vars = {};
    this.currentChoices = [];

    this.set = function(vars){
        this.vars = vars;
        this.currentChoices = [];
        this.interrupting = false;
        if (this.visualChoices){
            this.visualChoices.destroy();
        }
    }
    
    this.setVar = function(name,value){
        value = value+"";
        value = this.parseVars(value);
        try {
           var val = eval(value);
           this.vars[name] = val;
        } catch(e) {
            this.vars[name] = value;
        }
        RenJS.resolve();
    }

    this.evalExpression = function(expression){
        expression = expression+"";
        expression = this.parseVars(expression);
        try {
            return eval(expression);
        } catch(e) {
            console.log("couldn-t eval");
            return false;
        }
    }

    this.branch = function(expression,branches){
        var val = this.evalExpression(expression);
            // debugger;
        var actions;
        if (val && branches.ISTRUE){
            actions = branches.ISTRUE;
        } 
        if (!val && branches.ISFALSE){
            RenJS.control.execStack[0].c++;
            actions = branches.ISFALSE;
        }
        if(actions){
            RenJS.storyManager.currentScene = _.union(actions,RenJS.storyManager.currentScene);
            RenJS.control.execStack.unshift({c:-1,total: actions.length, action: "if"});
        }
        
        RenJS.resolve();
    }

    this.parseVars = function(text){
        var vars = text.match(/\{(.*?)\}/g);
        if (vars) {
            _.each(vars,function(v){
                var varName = v.substring(1,v.length-1);this.evalExpression
                text = text.replace(v,this.vars[varName]);
            },this);
        }
        return text;
    }

    this.evalChoice = function(choice){
        var choiceText = _.keys(choice)[0];
        choice.choiceId = "Choice"+Date.now();
        choice.choiceText = choiceText;
        var params = choiceText.split("!if");
        if (params.length > 1){
            var val = RenJS.logicManager.evalExpression(params[1]);
            if (val) {
                var next = choice[choiceText];
                delete choice[choiceText];
                choice.choiceText = params[0];
                choice[params[0]] = next;
            }
            return val;
        }
        return true; //unconditional choice
    }

    this.showVisualChoices = function(choices){
        var ch = _.map(choices,_.clone);
        ch = _.filter(ch,this.evalChoice);
        this.visualChoices = game.add.group();
        this.currentChoices = ch;
        _. each(ch, function(choice,index){
            
            var key = _.keys(choice)[0];
            var str = key.split(" ");
            var pos = str[2].split(",");
            var position = {x:parseInt(pos[0]),y:parseInt(pos[1])};
            var button = game.add.button(position.x,position.y,str[0],function(){
                RenJS.logicManager.choose(index,key);
            },RenJS.logicManager,0,0,0,0,this.visualChoices);
            button.anchor.set(0.5);
        },this);
        // debugger;
    }

    this.showChoices = function(choices){
        var ch = _.map(choices,_.clone);
        ch = _.filter(ch,this.evalChoice);
        // debugger;
        RenJS.logicManager.currentChoices = RenJS.logicManager.currentChoices.concat(ch);     
        RenJS.gui.showChoices(RenJS.logicManager.currentChoices); 
        if (RenJS.logicManager.interrupting){
            RenJS.control.execStack[0].interrupting = RenJS.control.execStack[0].c;
            RenJS.resolve();
        }
    }

    this.interrupt = function(steps,choices){
        this.interrupting = true;
        var s = parseInt(steps);
        if (!isNaN(s) && s>0){
            _.each(choices,function(choice){
                // choice.startingStep = RenJS.control.globalCounter;
                choice.remainingSteps = s+1;
                choice.interrupt = true;
            });
            RenJS.onInterpretActions.interruptAction = function(){
                RenJS.logicManager.currentChoices = _.filter(RenJS.logicManager.currentChoices,function(choice){
                    if (choice.remainingSteps) {
                        choice.remainingSteps--;
                        if (choice.remainingSteps==1){
                            RenJS.gui.changeToLastInterrupt(choice.choiceId); 
                        } else if (choice.remainingSteps==0){
                            RenJS.gui.hideChoice(choice.choiceId); 
                            return false;
                        }
                    }
                    return true;
                });
                if (RenJS.logicManager.currentChoices.length == 0){
                    delete RenJS.onInterpretActions.interruptAction;
                }
            }    
        }
        
        this.showChoices(choices);
    }

    this.clearChoices = function(){
        RenJS.gui.hideChoices();
        RenJS.logicManager.currentChoices = [];
        RenJS.logicManager.interrupting = false;
        if (RenJS.logicManager.visualChoices){
            RenJS.logicManager.visualChoices.destroy();
        }
    }

    this.choose = function(index,chosenOption){
        RenJS.gui.hideChoices();
        if (RenJS.logicManager.visualChoices){
            RenJS.logicManager.visualChoices.destroy();
        }
        if (chosenOption){
            var actions = RenJS.logicManager.currentChoices[index][chosenOption];
            RenJS.storyManager.currentScene = _.union(actions,RenJS.storyManager.currentScene);
            RenJS.control.execStack.unshift({c:-1,index:index,op:chosenOption,total:actions.length,action:"choice"});
        }
        RenJS.logicManager.currentChoices = [];
        if (RenJS.logicManager.interrupting){
            RenJS.control.execStack[0].action = "interrupt";
            RenJS.logicManager.interrupting = false;
        } else {
            RenJS.resolve();
        }
    }
}

