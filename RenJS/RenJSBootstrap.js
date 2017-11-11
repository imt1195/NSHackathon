var phaserConfig = {
  w:800,
  h:600,
  mode: "AUTO",
  splash: "assets/gui/splash.png", //splash background
  loading: "assets/gui/loadingbar.png", //loading bar image
  loadingPosition: [111,462], //loading bar size
  storyFiles: [
        "Story/YourStory.yaml",
        "Story/GUI.yaml",
        "Story/Setup.yaml",

    ],
}
var game = new Phaser.Game(phaserConfig.w, phaserConfig.h, Phaser[phaserConfig.mode], "RenJS");

var bootstrap = {

  preload: function () {
    game.load.image('loading',  phaserConfig.loading);
    game.load.image('splash',  phaserConfig.splash);
    game.load.script('preload',  'RenJS/Preload.js');
  },

  create: function () {
    game.state.add('preload', preload);
    game.state.start('preload');
  }

};

game.state.add('bootstrap', bootstrap);
game.state.start('bootstrap');