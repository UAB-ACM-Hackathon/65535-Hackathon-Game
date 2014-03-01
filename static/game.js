var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
                           { preload: preload, create: create, update: update });

var player, rocks, bullets;

var timeLastFired = 0;
var fireDelay = 40;
function preload() {
    game.load.image('ship', 'assets/ship.png');
    game.load.image('bg', 'assets/spacebg.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('rock1', 'assets/rock1.png');
    game.load.tileset('rocks', 'assets/rocksheet.png', 64, 64);
}
 
function create() {
    game.world.setBounds(0,0,5000, 5000);
    var background = game.add.tileSprite(0,0,game.world.width,game.world.height, 'bg');

     // Bullets
    bullets = game.add.group();
    bullets.createMultiple(100, 'bullet');
    bullets.setAll('outOfBoundsKill', true);
    //bullets.setAll('body.immovable', true);

    //bullets.setAll('lifespan', 1000);
    bullets.callAll('anchor.setTo', null, 0.5, 0.5);
    
    // Player
    player = game.add.sprite(100, 100, 'ship');
    player.anchor.setTo(0.5, 0.5);
    player.body.collideWorldBounds = true;
    game.camera.follow(player);

    // Rocks
    rocks = game.add.group();
    makeRocks();
    

}
 
function update() {
    game.physics.collide(player, rocks);
    game.physics.collide(bullets, rocks, onBulletHitsRock);
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.W)){
        thrust(10);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.S)){
        thrust(-5);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.A)){
        player.rotation += 0.2;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D)){
        player.rotation -= 0.2;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        fire();
    }
}


function thrust(dv, obj){
    if (obj === undefined){
        obj = player;
    }
    Phaser.Point.add(
        obj.body.velocity,
        game.physics.velocityFromRotation(obj.rotation - Math.PI/2, dv),
        obj.body.velocity // Store it here
    );
}

function fire(){
    if (timeLastFired + fireDelay > game.time.now) return;
    
    var bullet = bullets.getFirstDead();
    if (!bullet){
        console.log("No bullets left!");
        return;
    }

    bullet.revive();
    /*bullet.centerOn(player.body.x+ player.body.width/2,
                    player.body.y + player.body.height/2);*/

    bullet.x = player.body.x + player.body.width/2;
    bullet.y = player.body.y + player.body.height/2;

    //bullet.body.velocity = game.physics.velocityFromRotation(player.rotation - Math.PI/2, 10);
    Phaser.Point.add(
        player.body.velocity,
        game.physics.velocityFromRotation(player.rotation - Math.PI/2, 200),
        bullet.body.velocity // Store it here
    );

    bullet.lifespan = 5000;
    timeLastFired = game.time.now;
}

function makeRocks(){
    for (var i=0; i < game.world.width; i += 64){
        for (var j=0; j < game.world.height; j += 64){
            if (Math.random() > 0.95){
                var rock = rocks.create(i, j, 'rock1');
                rock.body.immovable = true;
                
            }
        }
    }
}
                
        
function onBulletHitsRock(bullet, rock){
    bullet.kill();
    rock.destroy();
}
