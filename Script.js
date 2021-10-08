// --------------------- CHESTII DE INCPUT DOAR ---------------------

let Viewport;
let Context;

var lastUpdate = Date.now();
var Loop = setInterval(MainLoop, 0);
var deltaTime = 0;

const GAME_STATE = {
    RUNNING : 1,
    PAUSED : 2,
    FINISH : 3,
}

let gameState = GAME_STATE.PAUSED;
let Score = 0;

function MainLoop() 
{
    Context.clearRect(0, 0, Viewport.width, Viewport.height);
    var now = new Date().getTime();
    deltaTime = (now - lastUpdate) / 1000;
    
    switch(gameState)  
    {
        case GAME_STATE.RUNNING: Update(); break;
        case GAME_STATE.PAUSED: 
            Context.font = "30px Arcade";
            Context.fillStyle = "white";
            Context.textAlign = "center";
            Context.textAlign = "center";
            Context.fillText("Pause", GAME_WIDTH / 2, GAME_HEIGHT / 2);
            break;
        case GAME_STATE.FINISH:
            Context.font = "30px Arcade";
            Context.fillStyle = "white";
            Context.textAlign = "center";
            Context.fillText("Press R", GAME_WIDTH / 2, GAME_HEIGHT / 2);
            break;
        

    }


    lastUpdate = now;
}

const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;







// --------------------- FUNCTII ---------------------

function drawImage(img, x, y, width, height, flip, flop) 
{
    Context.save();

    Context.translate(x + width/2, y + height/2);

    if(flip) 
        flipScale = -1; 
    else 
        flipScale = 1;
    
    if(flop) 
        flopScale = -1; 
    else 
        flopScale = 1;

    Context.scale(flipScale, flopScale);
    Context.drawImage(img, -width/2, -height/2, width, height);

    Context.restore();
}

function Collision(left, right)
    {
        if(left.x < right.x + right.width &&
            left.x + left.width > right.x &&
            left.y < right.y + right.height &&
            left.y + left.height > right.y)
            return true;
    
        return false;
    }








// --------------------- CLASE ---------------------
class Entity
{
    constructor(sprite, posX, posY, width, height)
    {
        this.image = [];
        this.image.push(document.getElementById(sprite));
        this.x = posX;
        this.y = posY;
        this.width = width;
        this.height = height;
    }

    addAnimationSprite(name)
    {
        this.image.push(document.getElementById(name));
    }
}

class Bullet extends Entity
{
    constructor(sprite, posX, posY, width, height)
    {
        super(sprite, posX, posY, width, height);
        this.speed = 350;
        this.direction = 0;
        this.alive = true;

        this.flipCooldown = 0.25;
        this.lastFlip = 0.0;
        this.flip = true;
    }

    Update()
    {
        drawImage(this.image[0], this.x, this.y, this.width, this.height, this.flip);

        this.y += this.speed * deltaTime * this.direction;

        if (this.y < 0 || this.y > GAME_HEIGHT - 50 - this.height)
            this.alive = false;


        if (this.lastFlip > this.flipCooldown)
        {
            this.flip = !this.flip;
            this.lastFlip = 0;
        }
        this.lastFlip += deltaTime;
    }

    setDirection(dir)
    {
        this.direction = dir;
    }
}

class Player extends Entity
{
    constructor(sprite, posX, posY, width, height)
    {
        super(sprite, posX, posY, width, height);
        this.speed = 200;
        this.direction = 0;
        this.bullets = [];
        this.canShoot = false;
        this.health = 3;

        this.shotCooldown = 0.6;
        this.lastShot = 0;
    }

    Update()
    {
        Context.drawImage(this.image[0], this.x, this.y, this.width, this.height);
        var vel = (this.direction * deltaTime * this.speed);

        if (this.x + this.width + vel < GAME_WIDTH && this.x + vel > 0)
            this.x += vel;

        
        for(let i = 0; i < this.bullets.length; i++)
        {
            this.bullets[i].Update();
            for(let y = 0; y < enemyBullets.length; y++)
                if (Collision(this.bullets[i], enemyBullets[y]))
                {
                    this.bullets[i].alive = false;
                    enemyBullets[y].alive = false;
                }

            if(this.bullets[i].alive == false)
                this.bullets.splice(i, 1);
        }

        this.lastShot += deltaTime;

        if (this.health <= 0)
            gameState = GAME_STATE.FINISH;

    }

    Move(dir)
    {
        this.direction = dir;
    }

    Shoot(shoot)
    {
        if (shoot != this.canShoot && shoot == true && this.lastShot > this.shotCooldown)
        {
            let newBullet = new Bullet ("BulletPlayer", this.x + this.width / 2, 
            this.y - this.height + 10, 3, 15);
            newBullet.setDirection(-1);
            this.bullets.push(newBullet);
            this.canShoot = true;
            this.lastShot = 0;
        }
        else if(shoot == false) this.canShoot = false;
    }
}

class Enemy extends Entity
{
    constructor(sprite, posX, posY, width, height)
    {
        super(sprite, posX, posY, width, height);
        this.speed = 15;
        this.direction = 1;

        this.frameInterval = 0.8;
        this.lastFrame = 0.0;
        this.currentFrame = 0;

        this.health = 3;
        this.score = 0;
    }

    Update()
    {
        Context.drawImage(this.image[this.currentFrame], this.x, this.y, this.width, this.height);

        if (this.lastFrame > this.frameInterval)
        {
            this.lastFrame = 0;
            this.currentFrame++;
            this.currentFrame %= this.image.length;
        }

        this.lastFrame += deltaTime;

        this.x += this.direction * this.speed * deltaTime;
    }

    switchDirection()
    {
        this.direction = -this.direction;
    }
}

class Block extends Entity
{
    constructor(sprite, posX, posY, width, height)
    {
        super(sprite, posX, posY, width, height);
        this.health = 100;
        this.currentFrame = 0;
        this.alive = true;
    }

    Update()
    {
        Context.drawImage(this.image[this.currentFrame], this.x, this.y, this.width, this.height);

        if (this.health < 75 && this.health > 30)
            this.currentFrame = 1;
        else if(this.health <= 30 && this.health > 0)
            this.currentFrame = 2;
        else if (this.health <= 0)
            this.alive = false;
    }
}










// --------------------- OBIECTE ---------------------
let player;
let enemies = [];
let blocks = [];
let enemyBullets = [];










// --------------------- START ---------------------
function Initialize()
{
    Score = 0;
    player = new Player("Player", 10, GAME_HEIGHT - 85, 25, 20);
    enemies = [];
    blocks = [];
    enemyBullets = [];

    for(let y = 0; y < 2; y++)
        for(let x = 0; x < 5; x++)
        {
            if (y == 1 && x >= 1 && x <= 3) continue;

            let block1 = new Block("Block1", 30 + x * 10,  470 + y * 10, 10, 10);
            block1.addAnimationSprite("Block2");
            block1.addAnimationSprite("Block3");

            let block2 = new Block("Block1", (GAME_WIDTH - 30 - 6 * 10) + x * 10,  470 + y * 10, 10, 10);
            block2.addAnimationSprite("Block2");
            block2.addAnimationSprite("Block3");

            let block3 = new Block("Block1", (GAME_WIDTH / 2 - 3 * 10) + x * 10,  470 + y * 10, 10, 10);
            block3.addAnimationSprite("Block2");
            block3.addAnimationSprite("Block3");

            blocks.push(block1);
            blocks.push(block2);
            blocks.push(block3);
        }



    Viewport = document.getElementById('GameViewport');
    Context = Viewport.getContext('2d');

    for(let i = 0; i < 5; i++)
    for(let y = 0; y < 9; y++)
    {
        let enemy;
        if (i < 2)
        {
            enemy = new Enemy("EnemyA1", y * 47 + 10, i * 35 + 50, 25, 20);
            enemy.score = 30;
            enemy.addAnimationSprite("EnemyA2");
        }
        else if (i < 4 && i >= 2)
        {    
            enemy = new Enemy("EnemyB1", y * 47 + 10, i * 35 + 50, 25, 20);
            enemy.score = 20;
            enemy.addAnimationSprite("EnemyB2");
        }
        else 
        {
            enemy = new Enemy("EnemyC1", y * 47 + 10, i * 35 + 50, 25, 20);
            enemy.score = 10;
            enemy.addAnimationSprite("EnemyC2");
        }

        enemies.push(enemy);
    }
}

var shotCooldown = 1.0;
var lastShot = 0;







// --------------------- UPDATE ---------------------
function Update()
{
    Context.strokeStyle = "#00ff00";
    Context.lineWidth = 4;

    Context.beginPath();
    Context.moveTo(0, GAME_HEIGHT - 50);
    Context.lineTo(GAME_WIDTH, GAME_HEIGHT - 50);
    Context.stroke();

    player.Update();
    
    if (lastShot > shotCooldown)
    {
        lastShot = 0;
        var index = Math.floor(Math.random() * enemies.length);

        let newBullet = new Bullet ("BulletEnemy", enemies[index].x + enemies[index].width / 2 - 5, 
        enemies[index].y + enemies[index].width, 7, 21);
        newBullet.setDirection(1);
        newBullet.speed = 100;
        enemyBullets.push(newBullet);
    }
    lastShot += deltaTime;

    if (enemies.length > 0)
    {
        for(let i = 0; i < enemies.length - 1; i++)
            for(let y = i + 1; y < enemies.length; y++)
            {
                if (enemies[i].x > enemies[y].x)
                {
                    let aux = enemies[i];
                    enemies[i] = enemies[y];
                    enemies[y] = aux;
                }
                if (enemies[i].y > GAME_HEIGHT - 130 || enemies[y].y > GAME_HEIGHT - 130)
                    gameState = GAME_STATE.FINISH;
            }
        
        if (enemies[0].x < 0 && enemies[0].direction == -1)
            for(let i = 0; i < enemies.length; i++)
            {
                enemies[i].switchDirection();
                enemies[i].y += 20;
            }
        else if (enemies[enemies.length - 1].x + enemies[enemies.length - 1].width > GAME_WIDTH && 
            enemies[enemies.length - 1].direction == 1)
            for(let i = 0; i < enemies.length; i++)
            {
                enemies[i].switchDirection();
                enemies[i].y += 20;
            }
        
        for(let i = 0; i < enemies.length; i++)
        {
            enemies[i].Update();
            for(let bullet = 0; bullet < player.bullets.length; bullet++)
                if(Collision(enemies[i], player.bullets[bullet]) == true)
                {
                    player.bullets[bullet].alive = false;
                    enemies[i].health -= 3;
                }
            
            if (enemies[i].health <= 0)
            {
                Score += enemies[i].score;
                enemies.splice(i, 1);
            }
        }
    }
    else 
    gameState = GAME_STATE.FINISH;


    for(let i = 0; i < blocks.length; i++)
    {
        blocks[i].Update();
        let collide = false;

        for(let y = 0; y < player.bullets.length; y++)
            if (Collision(blocks[i], player.bullets[y]))
            {
                blocks[i].health -= 45;
                player.bullets[y].alive = false;
                collide = true;
            }
        
            if (collide) continue;

        for(let y = 0; y < enemyBullets.length; y++)
            if (Collision(blocks[i], enemyBullets[y]))
            {                
                blocks[i].health -= 45;
                enemyBullets[y].alive = false;
            }

        if (blocks[i].alive == false)
            blocks.splice(i, 1);
    }

    for(let i = 0; i < enemyBullets.length; i++)
    {
        enemyBullets[i].Update();
        if (Collision(enemyBullets[i], player))
        {
            player.health -= 1;
            enemyBullets[i].alive = false;
        }

        if(enemyBullets[i].alive == false)
            enemyBullets.splice(i, 1);
    }

    for(let i = 0; i < player.health; i++)
        Context.drawImage(player.image[0], 10 + i * 30, GAME_HEIGHT - 30, 
            player.width - 1, player.height - 1);

     Context.font = "20px Arcade";
     Context.fillStyle = "white";
     Context.textAlign = "center";
     Context.fillText("Score: " + Score.toString(), 300, GAME_HEIGHT - 10);
    
}










// --------------------- EVENTS ---------------------
window.onblur = function() 
{
    gameState = GAME_STATE.PAUSED;
};

document.addEventListener('DOMContentLoaded', Initialize);

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) 
    {
        player.Move(-1);
    }
    else if(event.keyCode == 39) 
    {
        player.Move(1);
    }
    else if(event.keyCode == 69) // E
    {
        player.Shoot(true);
    }

    else if (event.keyCode == 82) // r
    {
        if (gameState == GAME_STATE.FINISH)
        {
            Initialize();
            gameState = GAME_STATE.RUNNING;
        }
    }

    else if (event.keyCode == 27) // esc
    {
        if (gameState == GAME_STATE.PAUSED)
            gameState = GAME_STATE.RUNNING;
        else if (gameState == GAME_STATE.RUNNING)
            gameState = GAME_STATE.PAUSED;
    }


}, false);

document.addEventListener('keyup', function(event) {
    if(event.keyCode == 37) 
    {
        if (player.direction == -1)
            player.Move(0);
    }
    else if(event.keyCode == 39) 
    {
        if (player.direction == 1)
            player.Move(0);
    }
    else if(event.keyCode == 69)
    {
        player.Shoot(false);
    }
}, false);