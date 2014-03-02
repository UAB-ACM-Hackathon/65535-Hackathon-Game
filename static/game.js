var SHIPFRAMES = {
    NORMAL: 0,
    THRUSTING: 1,
    FIRING: 2,
}

var MAX_HEALTH = 5;

var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'phaserdiv',
                           { preload: preload, create: create, update: update });

var player, rocks, bullets, enemies, enemyBullets, healthPacks;

var timeLastFired = 0;
var enemyTimeLastFired = 0;
var enemyFireDelay = 500;
var fireDelay = 40;
function preload() {
    game.load.image('bg', 'assets/spacebg.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('ebullet', 'assets/ebullet.png');
    game.load.image('enemy1', 'assets/enemy1.png');
    game.load.image('health', 'assets/health.png');
    game.load.image('rockparticle', 'assets/rockparticle.png');
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
    player.events.onKilled.add(onPlayerKilled);
    player.health = MAX_HEALTH;
    player.immovable = true;
    updateHealthBox();
    
    // Rocks
    rocks = game.add.group();
    makeRocks();
    rocks.forEach(function (rock){
        rock.events.onKilled.add(onRockKilled);
    });

    // Enemies
    enemies = game.add.group();
    makeEnemies(20);
    enemyTimeLastFired = game.time.now
    updateEnemyCountBox();
    // Enemy Bullets
    enemyBullets = game.add.group();
    enemyBullets.createMultiple(50, 'ebullet');
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('immovable', true);

    // Health packs
    healthPacks = game.add.group();

}
 
function update() {
    //console.log("Player health: " + player.health);
    player.frame = SHIPFRAMES.NORMAL;
    
    game.physics.collide(player, rocks);
    game.physics.collide(bullets, rocks, onBulletHitsRock);
    game.physics.collide(bullets, enemies, function(bullet, enemy){
        bullet.kill();
        enemy.damage(1);
    });
    game.physics.collide(enemyBullets, rocks, function (ebullet, rock){ebullet.kill();});
    game.physics.overlap(enemyBullets, player, function (player, ebullet){
        player.damage(1);
        ebullet.kill();
        updateHealthBox();
    });
        
    game.physics.collide(enemies, rocks);


    game.physics.overlap(player, healthPacks, function(player, pack){
        if (player.health < MAX_HEALTH){
            player.health += 1;
            pack.destroy();
        }
        updateHealthBox();
    });

    enemies.forEachAlive(function (enemy){
        enemyMove(enemy);
        
    }, this);
    
    if (enemyTimeLastFired + enemyFireDelay < game.time.now){
        enemies.forEachAlive(function (enemy){
            fireAtPlayer(enemy);
        }, this);
        enemyTimeLastFired = game.time.now;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.W)){
        player.frame = SHIPFRAMES.THRUSTING;
        thrust(10);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.S)){
        thrust(-5);
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.A)){
        player.rotation -= 0.2;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.D)){
        player.rotation += 0.2;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
        player.frame = SHIPFRAMES.FIRING;
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

function onPlayerKilled(player){
    console.log("The player has been killed!");
    var goverText = game.add.text(20, 20, "Game Over!", {fill: "#FFFFFF", size: "100px"});
    goverText.fixedToCamera = true;
    goverText.cameraOffset.setTo(20,20);
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
    rock.damage(1);
    if (rock.health === 3){
        rock.frame = 1;
    } else if (rock.health === 2){
        rock.frame = 2;
    } else if (rock.health === 1){
        rock.frame = 3;
    }


}

    
function makeEnemy(x, y){
    var e = enemies.create(x, y, 'enemy1');
    e.body.collideWorldBounds = true;
    e.health = 5;
    e.events.onKilled.add(onEnemyKilled);
    
}

function makeEnemies(num){
    for (var i = 0; i < num; i++){
        makeEnemy(game.world.randomX, game.world.randomY);
    }
}
function enemyMove(enemy){
    enemy.body.velocity.x += (Math.random() - 0.5) * 10;
    enemy.body.velocity.y += (Math.random() - 0.5)* 10;
}

function fireAtPlayer(enemy){
    
    if (Phaser.Point.distance(enemy.body, player.body) > 1000) return;
    var bullet = enemyBullets.getFirstDead();
    if (!bullet){
        console.log("Enemy out of bullets!");
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

    //enemyTimeLastFired = game.time.now;
}

function updateHealthBox(){
    document.getElementById("healthbox").innerHTML = player.health;
}

function onRockKilled(rock){
    console.log("Rock is dying");
    var midx = rock.body.x + rock.body.width/2;
    var midy = rock.body.y + rock.body.height/2;
    makeHealthPack(midx, midy);
    emitRockParticles(midx, midy);
    updateHealthBox();
}

function makeHealthPack(x, y){
    healthPacks.create(x, y, 'health');
}

function onEnemyKilled(enemy){
    updateEnemyCountBox();
}

function updateEnemyCountBox(){
    document.getElementById("enemycountbox").innerHTML = enemies.countLiving()
}

function emitRockParticles(x, y){
    var emitter = game.add.emitter(x, y, 50);
    emitter.gravity = 0;
    emitter.makeParticles('rockparticle');
    emitter.start(true, 1000, 10, 20);
    
    // Currently the emitter is left behind.
    // This is a memory leak. But I don't have time to fix this,
    // Since it's a hackathon. Fix later. It shouldn't be a problem on a sane
    // map.
    //emitter.destroy();
}
    
