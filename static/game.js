var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
                           { preload: preload, create: create, update: update });

var player, rocks
 
function preload() {
    game.load.image('ship', 'assets/ship.png');
}
 
function create() {
    player = game.add.sprite(100, 100, 'ship');
}
 
function update() {
    
}
