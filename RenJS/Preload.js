var preload = {

  init: function () {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh(); 
    this.splash = game.add.sprite(game.world.centerX, game.world.centerY, 'splash');
    this.splash.anchor.set(0.5);
    this.loadingBar = game.add.sprite(phaserConfig.loadingPosition[0],phaserConfig.loadingPosition[1] , "loading");
  },

  preload: function () {
    this.load.setPreloadSprite(this.loadingBar);
    //load external libraries
    game.load.script('esprima',  'libs/esprima.js');
    game.load.script('yaml',  'libs/js-yaml.min.js');
    game.load.script('underscore',  'libs/underscore-min.js');
    //load RenJS
    game.load.script('Defaults',  'RenJS/Defaults.js');
    game.load.script('SimpleGUI',  'RenJS/SimpleGUI.js');
    game.load.script('AudioManager',  'RenJS/AudioManager.js');
    game.load.script('BackgroundManager',  'RenJS/BackgroundManager.js');
    game.load.script('CGSManager',  'RenJS/CGSManager.js');
    game.load.script('CharactersManager',  'RenJS/CharactersManager.js');
    game.load.script('LogicManager',  'RenJS/LogicManager.js');
    game.load.script('TextManager',  'RenJS/TextManager.js');
    game.load.script('TweenManager',  'RenJS/TweenManager.js');
    game.load.script('StoryManager',  'RenJS/StoryManager.js');
    game.load.script('RenJS',  'RenJS/RenJS.js');
    game.load.script('Effects',  'RenJS/Effects.js');
    game.load.script('Ambient',  'RenJS/Ambient.js');
    game.load.script('Transitions',  'RenJS/Transitions.js');
    game.load.script('CustomContent',  'RenJS/CustomContent.js');
    //load Story Files
    for (var i = phaserConfig.storyFiles.length - 1; i >= 0; i--) {
      game.load.text("story"+i, phaserConfig.storyFiles[i]);
    };

    
  },

  create: function () {
    //load the story text
    var story = {};
    _.each(phaserConfig.storyFiles,function (file,index) {
        var text = jsyaml.load(game.cache.getText("story"+index));
        story = _.extend(story,text);
    });
    RenJS.story = story;
    if (story.simpleGUI){
        RenJS.gui = new SimpleGUI(story.simpleGUI);    
    } else {
        // this.gui = new RenJS.story.gui.customGUI();
    }    
    //preload the fonts by adding text, else they wont be fully loaded :\
    _.each(story.simpleGUI.assets.fonts,function(font){
        // console.log("loading" + font)
        game.add.text(20, 20, font, {font: '42px '+font});
    });
    //start preloading story
    game.state.add('preloadStory', preloadStory);
    game.state.start('preloadStory');
  }
}

var preloadStory = {
  init: function () {
    this.splash = game.add.sprite(game.world.centerX, game.world.centerY, 'splash');
    this.splash.anchor.set(0.5);
    this.loadingBar = game.add.sprite(phaserConfig.loadingPosition[0],phaserConfig.loadingPosition[1] , "loading");
    
  },

  preload: function () {
    this.load.setPreloadSprite(this.loadingBar);
    //preload gui
    _.each(RenJS.gui.getAssets(),function(asset){
        // console.log(asset);
        if (asset.type == "spritesheet"){
            game.load.spritesheet(asset.key, asset.file, asset.w, asset.h);
        } else {
            game.load[asset.type](asset.key, asset.file);
        }
    });

    //preload backgrounds
    _.each(RenJS.story.setup.backgrounds,function(filename,background){
        game.load.image(background, filename);
    });
    //preload cgs
    _.each(RenJS.story.setup.cgs,function(filename,background){
        game.load.image(background, filename);
    });
    // preload background music
    _.each(RenJS.story.setup.music,function(filename,music){
        game.load.audio(music, filename);
    });
    //preload sfx
    _.each(RenJS.story.setup.sfx,function(filename,key){
        game.load.audio(key, filename);
    },this);
    //preload characters
    _.each(RenJS.story.setup.characters,function(character,name){
        _.each(character.looks,function(filename,look){
            game.load.image(name+"_"+look, filename);
        });
    });
    if (RenJS.story.setup.extra){
        _.each(RenJS.story.setup.extra,function(assets,type){
            if (type=="spritesheets"){
                _.each(assets,function(file,key){
                    var str = file.split(" ");
                    game.load.spritesheet(key, str[0], parseInt(str[1]),parseInt(str[2]));
                });
            } else {
                _.each(assets,function(file,key){
                    // console.log("loading "+key+ " "+file+" of type "+type);
                    game.load[type](key, file);
                });
            }
        });
        
        
    }
    
  },

  create: function() {
    //init game and start main menu
    game.state.add('init', init);
    game.state.start('init');
  }
}

var init = {
  create:function(){            
    RenJS.storyManager.setupStory();
    RenJS.gui.init();
    RenJS.initInput();
    RenJS.audioManager.init(function(){
        RenJS.gui.showMenu("main");    
    });
  },

  render: function() {
    // if (RenJS.gui && RenJS.gui.hud && RenJS.gui.hud.area){
    //     _.each(RenJS.gui.hud.area,function(area){
    //         game.debug.rectangle(area);
    //     });
    // }
  }
}