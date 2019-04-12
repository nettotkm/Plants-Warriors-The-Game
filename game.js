//class
class Entity {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.dx = 0;
    this.dy = 0;
  }
  currentX() {
    return this.x + this.dx;
  }
  currentY() {
    return this.y + this.dy;
  }
}

class LivingBeing extends Entity {
  constructor(x, y, color, health) {
    super(x, y, color);
    this.health = health;
    this.dead = false;
  }

  receiveDamage(damage) { // recebendo dano
    if (damage !== 0) {
      this.health = this.health - damage;
    }if(game.points > 100) {
      this.health = this.health - damage * 10;
    }
  }

  died() {
    return this.health < 0;
  }
}

class Bullet extends Entity {
  constructor(plant) {
    super(plant.x, plant.y, "#00FF00");
    this.width = 5;
    this.height = 5;
  }

  fly(dx, dy) {
    this.dx += dx;
    this.dy += dy;
  }
}

// make plant
class Plant extends LivingBeing { //germinate
  constructor(x, y, color) {
    super(x, y, color, 10);
    this.width = 100;
    this.height = 100;
    this.imgPlant = new Image();
    this.imgPlant.src = "./image/plant_sprite100.png";
    this.frameIndex = 0;
    this.tickCount = 0;
    this.ticksPerFrame = 2;
  }
  updateImageP() { //
    this.tickCount += 1;
    if (this.tickCount > this.ticksPerFrame) {
      this.tickCount = 0;
      this.frameIndex += 1;
      if (this.frameIndex >= 31) {
        this.frameIndex = 5;
      }
    }
  }
  frameXP() {
    return this.frameIndex * this.width;
  }
  frameYP() {
    return 0;
  }
  spitBullet() { //atacando
    return new Bullet(this);
  }
  collidedWithZombie(zombie) {
    let px = this.x + this.width/2;
    let zx = zombie.currentX() - zombie.width/2;
    let zy = zombie.currentY();

    return (!zombie.dead && zx < px && (zy < this.y + this.height/2) && (zy > this.y - this.height/2));
  }
}

class Zombie extends LivingBeing {
  constructor(x, y, color, health, speedX) {
    super(x, y, color, health);
    this.width   = 100;
    this.height  = 100;
    this.speedX  = speedX;
    this.dead    = false;
    this.img     = new Image();
    this.img.src = "./image/zombie_sprite100.png";
    this.frameIndex = 0;
    this.tickCount = 0;
    this.ticksPerFrame = 4;
  }

  move(dx,dy) {
       this.dx -= this.speedX;
       this.dy += dy;
  }

  collidedWithBullet(bullet) {
    let bx = bullet.currentX();
    let by = bullet.currentY();

    return (bx > this.currentX() - this.width/2 && bx < this.currentX() + this.width/2) && (by > this.currentY() - this.height/2 && by < this.currentY() + this.height/2);
  }
  //image animation
  updateImage() {
    this.tickCount += 1;
    if(this.tickCount > this.ticksPerFrame) {
      this.tickCount = 0;
      this.frameIndex += 1;
      if(this.frameIndex >= 12) {
        this.frameIndex = 0;
      }
    }
  }
  frameX() {
    return this.frameIndex * this.width;
  }
  frameY() {
    return 0;
  }
}
//class
class Game {
  constructor(id) {
    this.canvas  = document.getElementById(id);
    this.ctx     = this.canvas.getContext("2d");
    this.over    = false;
    this.debug   = false;
    this.pressed = false;
    this.started = false;
    this.plants  = [];
    this.zombies = [];
    this.bullets = [];
    this.points  = 0;
    this.speedX  = 0;
    this.setup();
    this.currentPlant = this.plants[0];
    this.zombieAudioMorte = new Audio ();
    this.zombieAudioMorte.src = "./som/Zombie Kill You-SoundBible.com-1719975566.mp3";
    this.zombieAudioMove = new Audio();
    this.zombieAudioMove.src = "./som/gargantudeath.wav";
    this.bulletsAudio = new Audio();
    this.bulletsAudio.src = "./som/juicy.wav";
    this.deadPlantAudio = new Audio();
    this.deadPlantAudio.src = "./som/losemusic.wav";
  }

  setup() {
    this.plants.push(new Plant(300, 50, "blue"));
    this.plants.push(new Plant(300, 137.5, "blue"));
    this.plants.push(new Plant(300, 225, "blue"));
    this.plants.push(new Plant(300, 312.5, "blue"));
    this.plants.push(new Plant(300, 400, "blue"));
    this.spawnZombie();
  }

  spitBullets() {
    if (!this.pressed) {
      return;
    }

    if(!this.currentPlant.dead) {
      this.bullets.push(this.currentPlant.spitBullet());
    }
  }

  spawnZombie() {

    let that = this;
    // seconds
    let min = 1;
    let max = 3;
    let rand = Math.floor(Math.random() * (max - min + 1) + min);
    // position
    let minP  = 1;
    let maxP  = 4;
    let randP = Math.floor(Math.random() * (maxP - minP + 1) + minP);
    if(game.points > 100){
      this.zombies.push(new Zombie(this.canvas.width - 100, 50 + randP * 87.5, "red", 30, 2));
    } if(game.points > 200) {
      this.zombies.push(new Zombie(this.canvas.width - 100, 50 + randP * 87.5, "red", 30, 2.5));
    } if(game.points > 300) {
      this.zombies.push(new Zombie(this.canvas.width - 100, 50 + randP * 87.5, "red", 20, 3));
    } if(game.points > 300) {
      this.zombies.push(new Zombie(this.canvas.width - 100, 50 + randP * 87.5, "red", 20, 3.5));
    } else {
      this.zombies.push(new Zombie(this.canvas.width - 100, 50 + randP * 87.5, "red", 30, 1));
    }
    setTimeout(function() { that.spawnZombie(); }, rand*1000);
  }
  //plant
  drawPlant(plant) {
    if (!plant.dead) {
      plant.updateImageP();
      this.ctx.beginPath();
      this.ctx.drawImage( plant.imgPlant, plant.frameXP(), plant.frameYP(), plant.width, plant.height, plant.x - plant.width/2, plant.y - plant.width/2, plant.width, plant.height);
      this.ctx.fillStyle = plant.color;
      this.ctx.fill();
      if(this.debug) {
        this.ctx.textAlign = "center";
        this.ctx.strokeText(`x: ${plant.currentX()}, y: ${plant.currentY()}`, plant.currentX(), plant.currentY());
      }
      this.ctx.closePath();
    }
  }
  // zombie
  drawZombie(zombie) {
    if(!zombie.dead) {
      this.zombieAudioMove.play();
      zombie.updateImage();
      this.ctx.beginPath();
      this.ctx.drawImage(zombie.img, zombie.frameX(), zombie.frameY(), zombie.width, zombie.height, zombie.x - zombie.width/2 + zombie.dx, zombie.y - zombie.height/2 + zombie.dy, zombie.width, zombie.height);
      this.ctx.fillStyle = zombie.color;
      this.ctx.fill();
      if(this.debug){
        this.ctx.textAlign = "center";
        this.ctx.strokeText(`x: ${zombie.currentX()}, y: ${zombie.currentY()}`, zombie.currentX(), zombie.currentY());
      }
      this.ctx.closePath();
    }
  }

  drawBullet(bullet) {
    if (!bullet.invisible) {
      this.ctx.beginPath();
      this.ctx.arc(bullet.x - bullet.width/2 + bullet.dx, bullet.y - bullet.height/2 + bullet.dy, bullet.width, bullet.height, 15, 0, Math.PI * 2);
      this.ctx.fillStyle = bullet.color;
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  onKeyDown(e) {
    if ( e.key == " " ) {
      this.pressed = true;
    }
  }

  onKeyUp(e) {
    if ( e.key == " " ) {
      this.pressed = false;
    }

    if ( e.key == "1" || e.key == "2" || e.key == "3" || e.key == "4" || e.key == "5" ) {
      this.currentPlant = this.plants[parseInt(e.key) - 1];
    }
  }

  onGameOver(callback) {
    this.gameOverCallback = callback;
  }

  runGameOverCallback() {
    this.gameOverCallback();
  }

  main(){
    let zombieDied = false;
    for (let zi = 0; zi < this.zombies.length; zi++) {
      const zombie = this.zombies[zi];
      zombie.move(-1,0);
      this.drawZombie(zombie);
    }
    for (let pi = 0; pi < this.plants.length; pi++) {
      const plant = this.plants[pi];
      this.drawPlant(plant);
      for (let zi = 0; zi < this.zombies.length && !this.over; zi++) {
        const zombie = this.zombies[zi];
        if (!plant.dead && plant.collidedWithZombie(zombie)){
          plant.receiveDamage(1);

          if (plant.died()) {
            plant.dead = true;
            this.over = true;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          }
        }
      }
    }
    if (this.over) {
      return this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    for (let bi = 0; bi < this.bullets.length; bi++) {
      const bullet = this.bullets[bi];
      bullet.fly(3, 0);
      this.drawBullet(bullet);
      for (let zi = 0; zi < this.zombies.length; zi++) {
        const zombie = this.zombies[zi];
        if(!zombie.dead && zombie.collidedWithBullet(bullet) && !bullet.invisible) {
          this.bulletsAudio.play();
          bullet.invisible = true
          zombie.receiveDamage(10);
          if(zombie.died()) {

            this.zombieAudioMorte.play();
            zombie.dead = true
            this.pointsView=document.getElementById("points-value");
            this.points += 10;
            this.pointsView.innerHTML = this.points;
          }
        }
      }
    }
  }
  //motor
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.points = 0;
    this.main();
    if(this.over) {
      this.runGameOverCallback();
      cancelAnimationFrame(this.animationId);
    } else {
      this.animationId = requestAnimationFrame(() => this.draw());
    }
  }

  run() {
    let that = this;
    this.started = true;
    document.addEventListener("keydown", function(e){ that.onKeyDown(e) },false);
    document.addEventListener("keyup", function(e){ that.onKeyUp(e) },false);
    this.animationId = requestAnimationFrame(() => this.draw());
    this.bulletsInterval = setInterval(function(){ that.spitBullets() }, 300);
  }
}

// tela de inicio
// se iniciar fazer:
game     = new Game("game");
startBtn = document.getElementById("start-button");
gameOver = function() {
  this.deadPlantAudio.play();
  this.ctx.font = "50px Verdana";
  this.ctx.fillStyle = "red";
  this.ctx.fillText(`Game Over Você fez ${game.points} points`,this.canvas.width/2 - 300, this.canvas.height/2);
  // alert(`GAME OVER ${game.points} points`);
  game.points = 0;
  startBtn.disabled = false;
}
game.onGameOver(gameOver);
startBtn.onclick = function() {
  if (game.over) {
    game = new Game("game");
    game.onGameOver(gameOver);
  }
  if(!game.started) {
    game.run();
    game.points = 0;
    game.pointsView = document.getElementById("points-value");
    game.pointsView.innerHTML = game.points;
    startBtn.disabled = true;
  }
}