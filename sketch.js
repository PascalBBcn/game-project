
/*
/////////////////////////GAME PROJECT PART 7 (FINAL)///////////////////
*/
var floorPos_y;
var cameraPosX;
var gameChar_world_x;

var gameChar_x;
var gameChar_y;
var isLeft;
var isRight;
var isPlummeting;
var isFalling;

var collectables;
var canyons;
var trees;
var clouds;
var mountains;
var platforms;
var flagpole;

var lives;
var livesTokens;
var game_score;

var enemies;
var emit;

var jumpSound;
var fallSound;
var collectableSound;
var flagpoleSound;
var gruntSound;
var backgroundSound;

//before setup is called, preload loads up any assets we may have in our sketch (sounds, images).
function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here (loaded relative to sketch file directory. no need for tracing back to home).
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    
    fallSound = loadSound('assets/scream.mp3');
    fallSound.setVolume(0.2);
    
    collectableSound = loadSound('assets/collectable.wav');
    collectableSound.setVolume(0.3);
    
    flagpoleSound = loadSound('assets/flagpole.wav');
    flagpoleSound.setVolume(0.3);
    
    backgroundSound = loadSound('assets/background.mp3');
    backgroundSound.setVolume(0.1);
    
    gruntSound = loadSound('assets/grunt.wav');
    gruntSound.setVolume(0.2);
}

function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
    lives = 3;
    
    startGame();
}

function draw()
{
    //Position character in center of camera
    cameraPosX = gameChar_x - width/2;
    gameChar_world_x = gameChar_x;

	///////////DRAWING CODE//////////

    //fill the sky blue
	background(100,155,255); 

    //draw some green ground
	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height - floorPos_y);
    
    //parallax scrolling effects
    push();
    translate(-cameraPosX * 0.25, 0)
    drawClouds();
    pop();
    
    push();
    translate(-cameraPosX * 0.5, 0)
    drawMountains();
    pop();
    
    //sidescrolling translate function
    push();
    translate(-cameraPosX, 0);
    
    //drawMountains();
    drawTrees();
    
    //draw platforms
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
    
    //draw canyon
    for(var i = 0; i < canyons.length; i++)
    {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }
    
    //draw collectables and collectables interaction
    for(var i = 0; i < collectables.length; i++)
    {
        if(!collectables[i].isFound)
        {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        }
        else if(collectables[i].isFound)
        {
            emit.updateParticles();
        }
    }
   
    //draw flagpole
    renderFlagpole();
    
    //draw enemies
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw();
        
        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        
        if(isContact)
        {
            gruntSound.play();
            
            if(lives > 0)
            {
                startGame();
                lives -= 1;
                break;
            }
        }
    }
    
    checkPlayerDie();
    
	//draw the game character
    drawPlayer();
	
    pop();
    
    //Score counter
    fill(255);
    textSize(20);
    noStroke();
    text("Score: " + game_score, 20, 20);
    
    //Lives counter and render
    for(var i = 1; i <= lives; i++)
    {
        strokeWeight(0.8);
        stroke(0);
        fill(240, 240, 217);
        ellipse(livesTokens.x_pos + i*22, livesTokens.y_pos, 20, 22);
        fill(0);
        ellipse(livesTokens.x_pos - 3 + i*22, livesTokens.y_pos - 2, 2, 2);
        ellipse(livesTokens.x_pos + 3 + i*22, livesTokens.y_pos - 2, 2, 2);
    }
    
    //display gameover
    if(lives < 1)
    {
        fill(0);
        stroke(0);
        strokeWeight(2);
        textStyle(BOLD);
        textSize(45);
        text("Game over. Press space to continue.", 20, 200);
        return;
    }
    //display level complete
    if(flagpole.isReached == true)
    {
        fill(0);
        stroke(0);
        strokeWeight(2);
        textStyle(BOLD);
        textSize(45);
        text("Level complete. Press space to continue.", 20, 200);
        isFalling = true;
        gameChar_y = floorPos_y;
        return;
    }
	///////////INTERACTION CODE//////////
	//Put conditional statements to move the game character below here
    if(!isPlummeting)
    {
        if(isLeft == true)
        {
            gameChar_x -= 4;
        }
         if(isRight == true)
        {
            gameChar_x += 4;
        }
        if(gameChar_y < floorPos_y)
        {
            var isContact = false;
            for(var i = 0; i < platforms.length; i++)
            {
                if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
                {
                    isContact = true;
                    isFalling = false;
                    break;
                }
            }
            if(isContact == false)
            {
                gameChar_y += 3;
                isFalling = true;
            }
            
        }
        else 
        {
            isFalling = false;
        }
    }
    
    //Set plummeting speed faster than falling speed.
    if(isPlummeting == true)
    {
        gameChar_y += 5;
        fallSound.play();
    }   
    
    //check if flagpole is reached
    if(flagpole.isReached == false)
    {
        checkFlagpole();
    }
    
    //Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - cameraPosX;
}

///////////////KEY CONTROL FUNCTIONS//////////////

function keyPressed()
{
	//control the animation of the character when keys are pressed.
    
        if(keyCode == 37)
        {
            isLeft = true;
        }
        else if(keyCode == 39)
        {
            isRight = true;
        }
        if(keyCode == 38 && isFalling == false && isPlummeting == false)
        {
            gameChar_y -= 110;
            jumpSound.play();
        }
        //spacebar to restart game
        if(keyCode == 32)
        {
            startGame();
            lives = 3;
        }
}

function keyReleased()
{
	//control the animation of the character when keys are released.
    
     if(keyCode == 37)
    {
        isLeft = false;
    }
    else if(keyCode == 39)
    {
        isRight = false;
    }
  
}

//////////////FUNCTIONS TO CREATE SCENERY///////////

function drawClouds()
{
    for(var i = 0; i < clouds.length; i++)
    {   
        noStroke();
        fill(255, 255, 255);
        ellipse(clouds[i].x_pos, clouds[i].y_pos, clouds[i].size*80, clouds[i].size*80);
        ellipse(clouds[i].x_pos-50 *clouds[i].size, clouds[i].y_pos-25 *clouds[i].size, clouds[i].size*65, clouds[i].size*65);
        ellipse(clouds[i].x_pos-60 *clouds[i].size, clouds[i].y_pos+20 *clouds[i].size, clouds[i].size*80, clouds[i].size*80);
        ellipse(clouds[i].x_pos-20 *clouds[i].size, clouds[i].y_pos+20 *clouds[i].size, clouds[i].size*80, clouds[i].size*80);
        ellipse(clouds[i].x_pos-100 *clouds[i].size, clouds[i].y_pos, clouds[i].size*60, clouds[i].size*60);
    }
    
}

function drawMountains()
{
    for(var i = 0; i < mountains.length; i++)
    { 
        fill(100, 100, 100);
        triangle(mountains[i].size*mountains[i].x_pos, mountains[i].size*mountains[i].y_pos,
        mountains[i].size*(mountains[i].x_pos-175), mountains[i].size*(mountains[i].y_pos+247),
        mountains[i].size*(mountains[i].x_pos+127), mountains[i].size*(mountains[i].y_pos+247));
        triangle(mountains[i].size*(mountains[i].x_pos-55), mountains[i].size*(mountains[i].y_pos-25),
        mountains[i].size*(mountains[i].x_pos-175), mountains[i].size*(mountains[i].y_pos+247),
        mountains[i].size*(mountains[i].x_pos+105), mountains[i].size*(mountains[i].y_pos+247)); 
    }
}

function drawTrees()
{
    for(var i = 0; i < trees.length; i++)
    {
        fill(101, 67, 33);
        rect(trees[i].x_pos, trees[i].y_pos, 20, 145); 
        strokeWeight(3);
        stroke(0, 100, 0);
        fill(0, 155, 0);
        triangle(trees[i].x_pos + 10, trees[i].y_pos - 37, trees[i].x_pos - 30, trees[i].y_pos + 13, trees[i].x_pos + 50, trees[i].y_pos + 13);
        triangle(trees[i].x_pos + 10, trees[i].y_pos - 67, trees[i].x_pos - 30, trees[i].y_pos - 17, trees[i].x_pos + 50, trees[i].y_pos - 17);
    }
}

function drawCollectable(t_collectable)
{
    if(t_collectable.isFound == false)
    {
        stroke(0);
        strokeWeight(3 * t_collectable.size);
        fill(101, 67, 33);
        rect(t_collectable.x_pos -15 * t_collectable.size, t_collectable.y_pos, t_collectable.size *30, t_collectable.size *20);
        rect(t_collectable.x_pos -15 * t_collectable.size, t_collectable.y_pos -10 * t_collectable.size, t_collectable.size *30, t_collectable.size *10);
        noStroke();
        fill(255, 223, 0);
        ellipse(t_collectable.x_pos, t_collectable.y_pos +1 * t_collectable.size, t_collectable.size * 6, t_collectable.size * 8);
        fill(0, 0, 0);
        ellipse(t_collectable.x_pos, t_collectable.y_pos +1 * t_collectable.size, t_collectable.size * 3, t_collectable.size * 5);
    }
}

function checkCollectable(t_collectable)
{
    if(dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 30)
    {
        t_collectable.isFound = true;
        emit = new Emitter(t_collectable.x_pos - 15, t_collectable.y_pos, 0, -0.3);
        emit.startEmitter(6, 30);
        game_score += 1;
        collectableSound.play();
    }
}

function drawCanyon(t_canyon)
{
    noStroke();
    fill(98, 74, 46);
    rect(t_canyon.x_pos, floorPos_y, t_canyon.width, height - floorPos_y)
}

function drawPlayer()
{
    if(isLeft && isFalling)
	{
		// add your jumping-left code
        strokeWeight(0.8);
        stroke(0);
        fill(240, 240, 217);
        ellipse(gameChar_x, gameChar_y - 55, 20, 22);
        fill(0);
        ellipse(gameChar_x - 6, gameChar_y - 57, 2, 2);
        fill(55, 87, 70);
        rect(gameChar_x - 6, gameChar_y - 44, 12, 25);
        rect(gameChar_x - 12, gameChar_y - 44, 12, 6);
        fill(240, 240, 217);
        rect(gameChar_x - 18, gameChar_y - 44, 5, 6);
        fill(55, 87, 70);
        rect(gameChar_x - 3, gameChar_y - 19, 6, 12);

        }
	else if(isRight && isFalling)
	{
		// add your jumping-right code
        strokeWeight(0.8);
        stroke(0);
        fill(240, 240, 217);
        ellipse(gameChar_x, gameChar_y - 55, 20, 22);
        fill(0);
        ellipse(gameChar_x + 6, gameChar_y - 57, 2, 2);
        fill(55, 87, 70);
        rect(gameChar_x - 6, gameChar_y - 44, 12, 25);
        rect(gameChar_x, gameChar_y - 44, 12, 6);
        fill(240, 240, 217);
        rect(gameChar_x + 13, gameChar_y - 44, 5, 6);
        fill(55, 87, 70);
        rect(gameChar_x - 3, gameChar_y - 19, 6, 12)
        
	}
	else if(isLeft)
	{
        strokeWeight(0.8);
        stroke(0);
        fill(240, 240, 217);
        ellipse(gameChar_x, gameChar_y - 55, 20, 22);
        fill(0);
        ellipse(gameChar_x - 6, gameChar_y - 57, 2, 2);
        fill(55, 87, 70);
        rect(gameChar_x - 6, gameChar_y - 44, 12, 25);
        rect(gameChar_x - 3, gameChar_y - 44, 6, 16);
        fill(240, 240, 217);
        rect(gameChar_x - 3, gameChar_y - 28, 6, 5);
        fill(55, 87, 70);
        rect(gameChar_x - 3, gameChar_y - 19, 6, 20);
	}
	else if(isRight)
	{
        strokeWeight(0.8);
        stroke(0);
        fill(240, 240, 217);
        ellipse(gameChar_x, gameChar_y - 55, 20, 22);
        fill(0);
        ellipse(gameChar_x + 6, gameChar_y - 57, 2, 2);
        fill(55, 87, 70);
        rect(gameChar_x - 6, gameChar_y - 44, 12, 25);
        rect(gameChar_x - 3, gameChar_y - 44, 6, 16);
        fill(240, 240, 217);
        rect(gameChar_x - 3, gameChar_y - 28, 6, 5);
        fill(55, 87, 70);
        rect(gameChar_x - 3, gameChar_y - 19, 6, 20);
        
	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
        strokeWeight(0.8);
        stroke(0);
        fill(240, 240, 217);
        ellipse(gameChar_x, gameChar_y - 55, 20, 22);
        fill(0);
        ellipse(gameChar_x - 3, gameChar_y - 57, 2, 2);
        ellipse(gameChar_x + 3, gameChar_y - 57, 2, 2);
        fill(55, 87, 70);
        rect(gameChar_x - 8, gameChar_y - 44, 16, 25);
        rect(gameChar_x - 14, gameChar_y - 44, 6, 8);
        rect(gameChar_x + 8, gameChar_y - 44, 6, 8);
        fill(240, 240, 217);
        rect(gameChar_x -14, gameChar_y - 35, 5, 5);
        rect(gameChar_x +9, gameChar_y - 35, 5, 5);
        fill(55, 87, 70);
        rect(gameChar_x + 2, gameChar_y - 19, 6, 12);
        rect(gameChar_x - 8, gameChar_y - 19, 6, 12);

	}
	else
	{
		// add your standing front facing code
        strokeWeight(0.8);
        stroke(0);
        fill(240, 240, 217);
        ellipse(gameChar_x, gameChar_y - 55, 20, 22);
        fill(0);
        ellipse(gameChar_x - 3, gameChar_y - 57, 2, 2);
        ellipse(gameChar_x + 3, gameChar_y - 57, 2, 2);
        fill(55, 87, 70);
        rect(gameChar_x - 8, gameChar_y - 44, 16, 25);
        rect(gameChar_x - 14, gameChar_y - 44, 6, 16);
        rect(gameChar_x + 8, gameChar_y - 44, 6, 16);
        fill(240, 240, 217);
        rect(gameChar_x -14, gameChar_y - 28, 5, 5);
        rect(gameChar_x +9, gameChar_y - 28, 5, 5);
        fill(55, 87, 70);
        rect(gameChar_x + 2, gameChar_y - 19, 6, 20);
        rect(gameChar_x - 8, gameChar_y - 19, 6, 20);
    }
}

function checkCanyon(t_canyon)
{
    if(gameChar_x > t_canyon.x_pos+10 && gameChar_x < t_canyon.x_pos + t_canyon.width && gameChar_y >= floorPos_y)
    {
        isPlummeting = true;
    }
}


function renderFlagpole()
{
    push();
    strokeWeight(5);
    stroke(200);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
    fill(255, 0, 255);
    noStroke();
    if(flagpole.isReached)
    {
        rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
    }
    else
    {
        rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
    }
    
    pop();
}

function checkFlagpole()
{
    var d = abs(gameChar_world_x - flagpole.x_pos);
    
    if(d < 10)
    {
        flagpole.isReached = true;
        backgroundSound.pause();
        flagpoleSound.play();
    }
}

function checkPlayerDie()
{
    if(gameChar_y - 65 > height)
    {
        lives -=1;
        
        if(lives > 0)
        {
            startGame();
        }
    }
   
}

function startGame()
{
    backgroundSound.play();
    gameChar_x = width/6;
	gameChar_y = floorPos_y;
    
    isLeft = false;
    isRight = false;
    isPlummeting = false;
    isFalling = false;
    
    cameraPosX = 0;
    game_score = 0;
    
    //lives token object
    livesTokens = {x_pos: 5, y_pos: 40};
    
    //variable to store real position of gameChar in the game.
    // Needed for collision detection
    gameChar_world_x = gameChar_x;
    
    collectables = [
        {x_pos: 750, y_pos: floorPos_y - 20, size: 1.0, isFound: false},
        {x_pos: 1000, y_pos: floorPos_y - 20, size: 1.0, isFound: false},
        {x_pos: 1400, y_pos: floorPos_y - 20, size: 1.0, isFound: false},
        {x_pos: 620, y_pos: floorPos_y - 180, size: 1.0, isFound: false},
        {x_pos: 655, y_pos: floorPos_y - 180, size: 1.0, isFound: false},
        {x_pos: 690, y_pos: floorPos_y - 180, size: 1.0, isFound: false},
        {x_pos: 725, y_pos: floorPos_y - 180, size: 1.0, isFound: false},
        {x_pos: 760, y_pos: floorPos_y - 180, size: 1.0, isFound: false}
    ];
    
    canyons = [
        {x_pos: -800, width: 700},
        {x_pos: 500, width: 120},
        {x_pos: 850, width: 130},
        {x_pos: 1200, width: 137},
        {x_pos: 1650, width: 600},
        {x_pos: 2500, width: 300}
    ];
    
    clouds = [
        {x_pos: 225, y_pos: 140, size: 1.0},
        {x_pos: 475, y_pos: 185, size: 1.0},
        {x_pos: 825, y_pos: 100, size: 1.0},
        {x_pos: 1300, y_pos: 110, size: 1.0},
        {x_pos: 1705, y_pos: 100, size: 1.25},
        {x_pos: 1900, y_pos: 90, size: 0.75},
        {x_pos: 2500, y_pos: 130, size: 1.0}
    ];

    mountains = [
        {x_pos:570, y_pos: height-391, size: 1.0},
        {x_pos:370, y_pos: height-391, size: 1.0},
        {x_pos:930, y_pos: height-391, size: 1.0},
        { x_pos:1200, y_pos: height-391, size: 1.0}
    ];
    
    trees = [
        {x_pos: 300, y_pos: height/2},
        {x_pos: 650, y_pos: height/2},
        {x_pos: 1100, y_pos: height/2},
        {x_pos: 1400, y_pos: height/2}
    ];
    
    flagpole = {isReached: false, x_pos: 3200};
    
    platforms = [];
    platforms.push(createPlatforms(600, floorPos_y - 160, 600));
    platforms.push(createPlatforms(1250, floorPos_y - 120, 75));
    platforms.push(createPlatforms(1400, floorPos_y - 80, 100));
    platforms.push(createPlatforms(1700, floorPos_y - 55, 100));
    platforms.push(createPlatforms(1850, floorPos_y - 80, 125));
    platforms.push(createPlatforms(2050, floorPos_y - 100, 75));
    platforms.push(createPlatforms(2200, floorPos_y - 120, 75));
    platforms.push(createPlatforms(2350, floorPos_y - 140, 125));
    
    enemies = [];
    enemies.push(new Enemy(300, floorPos_y - 20, 100));
    enemies.push(new Enemy(800, floorPos_y - 180, 75));
    enemies.push(new Enemy(950, floorPos_y - 180, 75));
    enemies.push(new Enemy(3000, floorPos_y - 20, 75));
}

function createPlatforms(x, y, length)
{
    var p = 
    {
        x_pos: x,
        y_pos: y,
        length: length,
        draw: function()
        {
            fill(0, 50, 0);
            rect(this.x_pos, this.y_pos, this.length, 15);
        },
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x_pos && gc_x < this.x_pos + this.length)
            {
                var d = this.y_pos - gc_y;
                if(d >= 0 && d < 5)
                {
                    return true;
                }
            }
            return false;
        }
        
    };
    return p;
}

function Enemy(x, y, range)
{
    this.x = x;
    this.y = y; 
    this.range = range;
    
    this.currentX = x;
    this.incr = 1;
    
    this.update = function()
    {
        this.currentX += this.incr;
        
        if(this.currentX >= this.x + this.range)
        {
            this.incr = random(-1, -0.7);
        }
        else if(this.currentX < this.x)
        {
            this.incr = random(1, 0.5);
        }
    }
    
    this.draw = function()
    {
        this.update();
        fill(255, 0, 150);
        ellipse(this.currentX, this.y, random(40, 34), 40);
        fill(0);
        ellipse(this.currentX, this.y + 8, 4, 4);
        ellipse(this.currentX - 6, this.y - 5, 5, 11);
        ellipse(this.currentX + 6, this.y - 5, 5, 11);
        fill(255);
        ellipse(this.currentX - 6, this.y - 6, 4, 6);
        ellipse(this.currentX + 6, this.y - 6, 4, 6);
        fill(255, 0, 25);
        ellipse(this.currentX - 12, this.y + 2, 6, 4);
        ellipse(this.currentX + 12, this.y + 2, 6, 4);
        
    }
    
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        if(d < 30)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}

function Particle(x, y, xSpeed, ySpeed)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.age = 0;
    
    this.drawParticle = function()
    {
        fill(255, 215,0);
        strokeWeight(0.15);
        stroke(255);
        beginShape();
            vertex(this.x, this.y);
            vertex(this.x + 5, this.y);
            vertex(this.x + 3, this.y - 5);
            vertex(this.x + 3, this.y);
        endShape(CLOSE);
    }
    
    this.updateParticle = function()
    {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.age ++;
    }
}

function Emitter(x, y, xSpeed, ySpeed)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    
    this.startParticles = 0;
    this.lifetime = 0;
    
    this.particles = [];
    
    this.addParticle = function()
    {
         var p = new Particle(random(this.x-10, this.x+10),
                             random(this.y-10, this.y+10),
                             random(this.xSpeed-1, this.xSpeed+1),
                             random(this.ySpeed-1, this.ySpeed+1))
        return p;
    }
    
    this.startEmitter = function(startParticles, lifetime)
    {
        this.startParticles = startParticles;
        this.lifetime = lifetime;
        
        //start emitter with initial particles
        for(var i = 0; i < startParticles; i++)
        {
            this.particles.push(this.addParticle());
        }
    }
    
    this.updateParticles = function()
    {
        //iterate through particles and draw to the screen
        //we iterate in reverse, so that we can avoid skipping over elements that were shifted after splicing 
        var deadParticles = 0;
        for(var i = this.particles.length - 1; i >= 0; i--)
        {
            this.particles[i].drawParticle();
            this.particles[i].updateParticle();
            if(this.particles[i].age > this.lifetime)
            {
                //remove the ith element, and remove onnly this 1 element
                this.particles.splice(i, 1);
                deadParticles ++;
            }
        }
    }
}



