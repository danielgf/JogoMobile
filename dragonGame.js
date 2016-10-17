// Variáveis do Canvas
var canvas;
var context;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

// Variáveis de atualização
var frames = 0;
var holdTouch = false;
var touchY;
var selectedState;
var states = {
	menu: 0,
	play: 1,
	lose: 2
};
// Sons/Musicas  
var menuMusic = new Audio("Dragon Ball Z Theme 20.mp3");
var playMusic = new Audio("Dragon Ball Z Freeza Theme.mp3");
var gameoverMusic = new Audio("Dragon Ball Original Soundtrack - Makafushigi Adventure Instrumental HQ.mp3");
var hitSound = new Audio("DBZ Medium Punch Sound effect.mp3");

// Images
var bg = new Image();
bg.src = "bg.jpg";
var menuBG = new Image();
menuBG.src = "menuBG.jpg";
var gameoverImage = new Image();
gameoverImage.src = "gameover.png";

var background = {
	x: 0,
	y: 0,
	width: SCREEN_WIDTH,
	heigt: SCREEN_HEIGHT,
	
	update: function(){
		context.drawImage(bg, this.x--, 0, SCREEN_WIDTH * 3, SCREEN_HEIGHT);
		if(this.x <= -SCREEN_WIDTH * 2){
			this.x = 0;
		}
	},
	
	draw: function(){
		context.save();
		context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		this.update();
		context.restore();
	}
	
}

// Entidades do jogo
var playerImage = new Image();
playerImage.src = "frieza.png";
var player = {
	width: 48,
	height: 60,
	x: 30,
	y: SCREEN_HEIGHT / 2 - 30,
	speed: 2,
	dragonBalls: 0,
	life: 2,
	invencible: false,
	wishes: 0,
	// Animação
	shift: 0,
	frameWidth: 48,
	frameHeight: 60,
	totalFrames: 4,
	currentFrame: 0,
	auxFrame: 1,
	
	draw: function(){
		//context.fillStyle = this.color;
		//context.fillRect(this.x, this.y, this.width, this.height);
		
		context.drawImage(playerImage, this.shift, 0, this.frameWidth, this.frameHeight,
							this.x, this.y, this.frameWidth, this.frameHeight);
							
							
		if(Math.floor(this.currentFrame) == this.auxFrame){
			this.auxFrame++;
			this.shift += this.frameWidth;
		}
		
		
		// Recomeça caso chegue no fim
		if(this.auxFrame == this.totalFrames){
			this.shift = 0;
			this.currentFrame = 0;
			this.auxFrame = 0;
		}
		
		this.currentFrame += 0.1;											
	},
	
	move: function(){
		// Verifica se a posição é par ou impár
		var evenNumber = touchY % 2;
		var even;
		if(evenNumber == 0){
			even = true;
		}else{
			even = false;
		}
		// Pega a metade da tela e garante que a posição tocada seja par para evitar flickering
		var middleScreen = window.innerHeight / 2;
		if(!even && touchY < middleScreen){
			touchY += 1;
		}else if(!even && touchY > middleScreen){
			touchY -= 1;
		}
		// Atualiza a posição do player
		if(holdTouch && touchY > this.y + this.height / 2 && this.y < SCREEN_HEIGHT){
			this.y += this.speed;
		}else if(holdTouch && touchY < this.y + this.height / 2 && this.y > 0){
			this.y -= this.speed;
		}
		//console.log("player y = "+this.y);
		//console.log("touched y = "+touchY);
	},
	reset: function(){
		this.dragonBalls = 0;
		this.life = 2;
		this.wishes = 0;
		this.y = SCREEN_HEIGHT / 2 - 30;
		this.invencible = false;
	}
};

var ballImage = new Image();
ballImage.src = "dragonBall.png";
var dragonBalls = {
	allBalls: [],
	speed: 8,
	timer: 0,
	width: 20,
	height: 20,
	
	addBall: function(){
		this.allBalls.push({
			x: SCREEN_WIDTH,
			y: Math.floor(Math.random() * SCREEN_HEIGHT + 50)
		});
		
		this.timer = 80 + Math.floor(Math.random() * 81);
	},
	
	update: function(){
		if(this.timer == 0){
			this.addBall();
		}else{
			this.timer--;
		}
		for(var i = 0, size = this.allBalls.length; i < size; i++){
			var ball = this.allBalls[i];
			ball.x -= this.speed;
			if((ball.x >= player.x && ball.x <= player.x + player.width
				&& ball.y >= player.y && ball.y <= player.y + player.height
				|| ball.x + this.width >= player.x && ball.x + this.width <= player.x + player.width
				&& ball.y >= player.y && ball.y <= player.y + player.height
				|| ball.x >= player.x && ball.x <= player.x + player.width
				&& ball.y + this.height >= player.y && ball.y + this.height <= player.y + player.height
				|| ball.x + this.width >= player.x && ball.x + this.width <= player.x + player.width
				&& ball.y + this.height >= player.y && ball.y + this.height <= player.y + player.height)&& !player.invencible){
				
				player.dragonBalls++;
				if(player.dragonBalls == 7){
					player.dragonBalls = 0;
					player.life++;
					player.wishes++;
					console.log("GANHOU VIDA =" + player.life);
				}
				console.log("PEGOU UMA DRAGON BALL");
				this.allBalls.splice(i, 1);
				size--;
				i--;
				//setTimeout(player.invencible = false, 2000);
			}else if(ball.x <= -this.width){
				this.allBalls.splice(i, 1);
				size--;
				i--;
			}
		}
	},
	draw: function(){
		for(var i = 0, size = this.allBalls.length; i < size; i++){
			var ball = this.allBalls[i];
			context.drawImage(ballImage, ball.x, ball.y, this.width, this.height);
		}
	},
	
	clearBalls: function(){
		this.allBalls = [];
	}
};

var enemyImage = new Image();
enemyImage.src = "piccolo.png";
var enemies = {
	allEnemies: [],
	speed: 6,
	timer: 0,
	width: 70,
	height: 60,
	// Animação
	shift: 0,
	frameWidth: 70,
	frameHeight: 60,
	totalFrames: 4,
	currentFrame: 0,
	auxFrame: 1,
	
	addEnemy: function(){
		this.allEnemies.push({
			x: SCREEN_WIDTH,
			y: Math.floor(Math.random() * SCREEN_HEIGHT + 50)
		});
		this.timer =30 + Math.floor(Math.random() * 31);
	},
	
	update: function(){
		if(this.timer == 0){
			this.addEnemy();
		}else{
			this.timer--;
		}
		for(var i = 0, size = this.allEnemies.length; i < size; i++){
			var enemy = this.allEnemies[i];
			enemy.x -= this.speed;
			if((player.x >= enemy.x && player.x <= enemy.x + this.width
				&& player.y >= enemy.y && player.y <= enemy.y + this.height
				|| player.x + player.width >= enemy.x && player.x + player.width <= enemy.x + this.width
				&& player.y >= enemy.y && player.y <= enemy.y + this.height
				|| player.x >= enemy.x && player.x <= enemy.x + this.width
				&& player.y + player.height >= enemy.y && player.y + player.height <= enemy.y + this.height
				|| player.x + player.width >= enemy.x && player.x + player.width <= enemy.x + this.width
				&& player.y + player.height >= enemy.y && player.y + player.height <= enemy.y + this.height) && !player.invencible){
				
				hitSound.play();
				player.invencible = true;
				console.log(player.life);
				player.life--;
				if(player.life == 0){
					selectedState = states.lose;
					playMusic.pause();
					gameoverMusic.currentTime = 0;
					gameoverMusic.play();
					gameoverMusic.loop = true;
				}
				setTimeout(this.change, 2000);
				
			}else if(enemy.x <= -this.width){
				this.allEnemies.splice(i, 1);
				size--;
				i--;
			}
		}
	},
	
	change: function(){
		player.invencible = false
	},
	
	draw: function(){
		for(var i = 0, size = this.allEnemies.length; i < size; i++){
			var enemy = this.allEnemies[i];
			//context.fillStyle = "#ff4e4e";
			//context.fillRect(enemy.x, enemy.y, this.width, this.height);
			context.drawImage(enemyImage, this.shift, 0, this.frameWidth, this.frameHeight,
							enemy.x, enemy.y, this.frameWidth, this.frameHeight);
							
							
			if(Math.floor(this.currentFrame) == this.auxFrame){
				this.auxFrame++;
				this.shift += this.frameWidth;
			}
		
		
			// Recomeça caso chegue no fim
			if(this.auxFrame == this.totalFrames){
				this.shift = 0;
				this.currentFrame = 0;
				this.auxFrame = 0;
			}
		
			this.currentFrame += 0.1;
		}
	},
	
	clearEnemies: function(){
		this.allEnemies = [];
	}
};

// Funções de toque
function touchStart(event){ 
	if(selectedState == states.play){
		holdTouch = true;
		touchY = Math.floor(event.touches[0].clientY);
	}else if(selectedState == states.menu){
		menuMusic.pause();
		playMusic.currentTime = 0;
		playMusic.play();
		playMusic.loop = true;
		selectedState = states.play;
	}else if(selectedState == states.lose){
		gameoverMusic.pause();
		menuMusic.currentTime = 0;
		menuMusic.play();
		menuMusic.loop = true;
		enemies.clearEnemies();
		dragonBalls.clearBalls();
		player.reset();
		selectedState = states.menu;
	}
	
}
function touchEnd(event){ 
	holdTouch = false;
}

function run(){
	update();
	draw();
	window.requestAnimationFrame(run);
}
function update(){
	frames++;
	//console.log(frames);
	player.move();
	if(selectedState == states.play){
		enemies.update();
		dragonBalls.update();
	}
	
}
function draw(){
	context.fillStyle = "#50beff";
	context.fillRect(0, 0, window.innerWidth, window.innerHeight);
	
	if(selectedState == states.menu){
		context.drawImage(menuBG, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		//context.fillStyle = "green";
		//context.fillRect(SCREEN_WIDTH / 2 - 50, SCREEN_HEIGHT / 2 - 50, 100, 100);
		context.fillStyle = "black";
		context.font = "50px Arial";
		context.fillText("Tap to Start", SCREEN_WIDTH / 2 - 130, SCREEN_HEIGHT / 2);
	}else if(selectedState == states.play){
		background.draw();
		
		context.fillStyle = "#fff";
		context.font = "50px Arial";
		context.fillText("Whishes made:" + player.wishes, 20, 50);
		context.fillText("Lifes:" + player.life, 20, 100);
		
		enemies.draw();
		dragonBalls.draw();
		
		// Efeito de dano
		var frequency = 200;
		if (!player.invencible || Math.floor(Date.now() / frequency) % 2) {
			player.draw();
		}
		
	}else if(selectedState == states.lose){
		//context.fillStyle = "red";
		//context.fillRect(SCREEN_WIDTH / 2 - 50, SCREEN_HEIGHT / 2 - 50, 100, 100);
		context.drawImage(gameoverImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		context.fillStyle = "#fff";
		//context.font = "10px Arial";
		context.fillText("You did " + player.wishes + " wishes!", SCREEN_WIDTH / 2 - 200, SCREEN_HEIGHT / 2);
		context.fillText("Tap to restart!", SCREEN_WIDTH / 2 - 160, SCREEN_HEIGHT / 2 + 50);
	}
}

function initCanvas(){
	// Cria o canvas e atribui suas dimensões
	canvas = document.createElement("canvas");
	canvas.setAttribute("id","screen");
	canvas.setAttribute("width", SCREEN_WIDTH);
	canvas.setAttribute("height",window.innerHeight);
	canvas.style.border = "1px solid #000";
	// Centraliza o canvas na tela
	canvas.style.position = "absolute";
	canvas.style.top = "0px";
	canvas.style.bottom = "0px";
	canvas.style.left = "0px";
	canvas.style.right = "0px";
	canvas.style.margin = "auto";
	// Pega o contexto e adiciona o canvas na tela
	context = canvas.getContext("2d");
	document.body.appendChild(canvas);
	// Adiciona o evento de clique no jogo
	document.addEventListener("touchstart", touchStart);
	document.addEventListener("touchmove", touchStart);
	document.addEventListener("touchend", touchEnd);
	
}

function main(){
	initCanvas();
	selectedState = states.menu;
	menuMusic.play();
	menuMusic.loop = true;
	run();
}

//start game
window.addEventListener("load", main);