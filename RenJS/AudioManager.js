function AudioManager(){
    this.musicList = {};
    this.sfx = {};

    // this.muted = false;
    this.audioLoaded = false;

    this.current = {
        bgm : null,
        bgs : null
    }

    this.init = function(callback){
        var audioList = [];
        _.each(RenJS.story.setup.music,function(filename,key){
            this.musicList[key] = game.add.audio(key);
            audioList.push(this.musicList[key]);
            // music.onDecoded.add(function(){
            //     console.log("adding music");
            //     console.log(key);
            //     console.log(music);
            //     this.musicList[key] = music;
            // }, this);
        },this);
        
        _.each(RenJS.story.setup.sfx,function(filename,key){
            this.sfx[key] = game.add.audio(key);            
            audioList.push(this.sfx[key]);
        },this);
        game.sound.setDecodedCallback(audioList, function(){
            console.log("Audio loaded");
            this.audioLoaded = true;
            callback();
        }, this);
    }

    this.mute = function(){
        if (config.settings.muted){
            if (this.current.bgm) {
                this.musicList[this.current.bgm].play("",0,1,true);
            }
            if (this.current.bgs) {
                this.musicList[this.current.bgs].play("",0,1,true);
            }
        } else {
            if (this.current.bgm) {
                this.musicList[this.current.bgm].stop();
            }
            if (this.current.bgs) {
                this.musicList[this.current.bgs].stop();
            }
        }
        config.settings.muted = !config.settings.muted;
        
        // RenJS.resolve();
    }

    this.changeVolume = function(type,volume){
        console.log("changing value to "+volume);
        game.sound.volume = volume;
    }

    this.set = function (current) {
        if (current.bgm){
            this.play(current.bgm,"bgm",true,"FADE");
        }
        if (current.bgm){
            this.play(current.bgs,"bgs",true,"FADE");
        }

    }

    this.play = function(key,type,looped,transition){
        // debugger;
        if (looped == undefined){
            looped = true;
        }
        var oldAudio = this.musicList[this.current[type]];
        this.current[type] = key;
        if (!config.settings.muted && this.current[type]) {
            if (transition == "FADE") {
                this.musicList[key].fadeIn(1500,looped);
                if (oldAudio) {
                    oldAudio.fadeOut(1500);
                };
            } else {
                if (oldAudio) {
                    oldAudio.stop();
                }
                this.musicList[key].play("",0,1,looped);
            }
        }
        if (type == "bgm") {
            RenJS.resolve();    
        }
    }

    this.stopAll = function(){
        this.stop("bgs","FADE");
        this.stop("bgm","FADE");
    }

    this.stop = function(type, transition){
        if (!this.current[type]){
            return;
        }
        var oldAudio = this.musicList[this.current[type]];
        this.current[type] = null;
        if (!config.settings.muted) {
            if (transition == "FADE") {
                oldAudio.fadeOut(1500);
            } else {
                oldAudio.stop();
            }
        }
        if (type == "bgm") {
            RenJS.resolve();    
        }
    }

    this.playSFX = function(key){
        if (this.audioLoaded && !config.settings.muted){
            // debugger;
            this.sfx[key].volume = config.settings.sfxv;
            this.sfx[key].play();    

        }
        
        // var fx = game.add.audio(key);
        // fx.onStop.add(function(){
        //     RenJS.resolve();
        // });
    }
}

