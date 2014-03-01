var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
                           { preload: preload, create: create, update: update });

var player, rocks
 
function preload() {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('bg', 'assets/spacebg.png');
}
 
function create() {
    game.world.setBounds(0,0,10000, 10000);
    var background = game.add.tileSprite(0,0,game.world.width,game.world.height, 'bg');
    player = game.add.sprite(100, 100, 'ship');
    player.anchor.setTo(0.5, 0.5);
    player.body.collideWorldBounds = true;
    game.camera.follow(player);
    
}
 
function update() {
    if (game.input.keyboard.isDown(Phaser.Keyboard.W)){
        thrust(10);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.S)){
        thrust(-5);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.A)){
        player.rotation += 0.05;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D)){
        player.rotation -= 0.05;
    }
}


function thrust(dv){
    console.log("Thrusting");
    Phaser.Point.add(
        player.body.velocity,
        game.physics.velocityFromRotation(player.rotation - Math.PI/2, dv),
        player.body.velocity // Store it here
    );
}
