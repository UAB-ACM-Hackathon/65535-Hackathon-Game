var SHIPFRAMES = {
    NORMAL: 0,
    THRUSTING: 1,
    FIRING: 2,
}


var game = new Phaser.Game(1000, 600, Phaser.AUTO, '',
                           { preload: preload, create: create, update: update });

var player, rocks, bullets, enemies, enemyBullets;

var timeLastFired = 0;
var enemyTimeLastFired = 0;
var enemyFireDelay = 500;
var fireDelay = 40;
function preload() {
    game.load.image('bg', 'assets/spacebg.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemy1', 'assets/enemy1.png');
    // game.load.tilesheet DOES NOT EXIST anymore.
    game.load.spritesheet('rocks', 'assets/rocksheet.png', 64, 64);
    game.load.spritesheet('ship', 'assets/shipset.png', 32, 32);
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
    player = game.add.sprite(100, 100, 'ship', SHIPFRAMES.NORMAL);
    player.anchor.setTo(0.5, 0.5);
    player.body.collideWorldBounds = true;
    game.camera.follow(player);

    // Rocks
    rocks = game.add.group();
    makeRocks();

    // Enemies
    enemies = game.add.group();
    makeEnemy(200, 100);
    // Enemy Bullets
    enemyBullets = game.add.group();
    enemyBullets.createMultiple(50, 'bullet');
    enemyBullets.setAll('outOfBoundsKill', true);
    /*var health_hud = game.add.text(20, 20, "This is a test", {fill: "#FFFFFF"});
    health_hud.fixedToCamera = true;
    health_hud.cameraOffset.setTo(20,20);*/
}
 
function update() {
    player.frame = SHIPFRAMES.NORMAL;
    
    game.physics.collide(player, rocks);
    game.physics.collide(bullets, rocks, onBulletHitsRock);
    game.physics.collide(bullets, enemies);
    game.physics.collide(enemyBullets, rocks, function (ebullet, rock){ebullet.kill();});

    enemies.forEachAlive(function (enemy){
        fireAtPlayer(enemy);
    }, this);
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.W)){
        player.frame = SHIPFRAMES.THRUSTING;
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
        player.frame = SHIPFRAMES.FIRING
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

    bullet.x = player.body.x + player.body.width/2;
    bullet.y = player.body.y + player.body.height/2;

    bullet.body.velocity.x = 0
    bullet.body.velocity.y= 0
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
                var rock = rocks.create(i, j, 'rocks',0);
                rock.body.immovable = true;
                rock.health = 4;
            }
        }
    }
}

function onBulletHitsRock(bullet, rock){
    bullet.kill();
    rock.health -= 1;
    if (rock.health === 3){
        rock.frame = 1;
    } else if (rock.health === 2){
        rock.frame = 2;
    } else if (rock.health === 1){
        rock.frame = 3;
    }

    if (rock.health <= 0){
        rock.destroy();
    }
}

    
function makeEnemy(x, y){
    var e = enemies.create(x, y, 'enemy1');
}


function fireAtPlayer(enemy){
    if (enemyTimeLastFired + enemyFireDelay > game.time.now) return;
    var bullet = enemyBullets.getFirstDead();
    if (!bullet){
        return;
    }
    bullet.revive();

    bullet.x = enemy.body.x + enemy.body.width/2;
    bullet.y = enemy.body.y + enemy.body.height/2;

    bullet.body.velocity.x = 0
    bullet.body.velocity.y = 0

    Phaser.Point.add(
        enemy.body.velocity,
        game.physics.velocityFromRotation(
            game.physics.angleToXY(enemy,
                                   player.body.x + player.body.width/2,
                                   player.body.y + player.body.height/2),
            200),
        bullet.body.velocity // Store it here
    );

    bullet.lifespan = 5000;

    enemyTimeLastFired = game.time.now;
}
