var defaults = {
    //name of the game
    name: "RenJS-GAME",
    
    defaultTextStyle: {
        font: "bold 16pt Arial",
        fill: "#FFFFFF",
        align: "left"
    },
    settings: {
        textSpeed: 50,
        autoSpeed: 150,
        bgmv: 1,
        sfxv: 1,
        muted: false
    },

    limits: {
        textSpeed: [10,150],
        autoSpeed: [50,300],
        bgmv: [0,1],
        sfxv: [0,1]
    },

    positions : {
        LEFT: {x:phaserConfig.w/6,y:phaserConfig.h},
        OUTLEFT: {x:-(phaserConfig.w/6),y:phaserConfig.h},
        CENTER: {x:phaserConfig.w/2,y:phaserConfig.h},
        RIGHT: {x:(phaserConfig.w/6)*5,y:phaserConfig.h},
        OUTRIGHT: {x:(phaserConfig.w/6)*7,y:phaserConfig.h}
    },

    //miliseconds for fade transitions
    fadetime : 750,
    skiptime: 50,
    //miliseconds to wait before continuing
    timeout : 5000,
    //avoid continuous clicking by waiting a few miliseconds before accepting new "clicks"
    clickCooldown: 200,

    transitions: {
        ch: "CUT",
        bg: "FADE",
        cgs: "FADE",
        bgm: "FADE"
    }

}
