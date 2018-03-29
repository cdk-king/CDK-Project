var SnailBait = function() {
	this.canvas = document.getElementById("snailbait-game-canvas");
	this.context = this.canvas.getContext('2d');
	this.background = new Image();
	this.runnerImage = new Image();
	this.spritesheet = new Image();
	
	this.BACKGROUND_WIDTH = 800;
	this.BACKGROUND_HEIGHT = 400;
	
	this.timeSystem = new TimeSystem();
	this.timeRate = 1.0;
	this.initialCursor = this.canvas.style.cursor;
	//this.spritesheet.src = 'img/spritesheet1.png';
	this.fpsElement = document.getElementById("snailbait-fps");
	this.scoreElement = document.getElementById("snailbait-score");
	this.musicElement = document.getElementById('snailbait-music');
	this.musicCheckboxElement = document.getElementById('snailbait-music-checkbox');
	this.musicElement.volume = 0.1;
	this.musicOn = this.musicCheckboxElement.checked;
	this.soundCheckboxElement = document.getElementById('snailbait-sound-checkbox');
	this.soundOn = this.soundCheckboxElement.checked;
	this.score = 0;
	this.fps = '0';
	this.backgroundOffset = 0;
	this.STARTING_BACKGROUND_OFFSET = 0;
	this.STARTING_SPRITE_OFFSET = 0;
	this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET;
	this.spriteOffset = this.STARTING_SPRITE_OFFSET;
	this.BACKGROUND_VELOCITY = 25;
	this.bgVelocity = this.BACKGROUND_VELOCITY;
	this.lastAnimationFrameTime = 0;
	this.lastFpsUpdateTime = 0;
	this.platformOffset = 0;
	this.PLATFORM_VELOCITY_MULTIPLIER = 3.0;
	this.platformVelocity = 0;
	this.RUNNER_LEFT = 100;
	this.PLATFROM_HEIGHT = 10;
	this.TRACK_0_BASELINE = 423;
	this.TRACK_1_BASELINE = 323;
	this.TRACK_2_BASELINE = 223;
	this.TRACK_3_BASELINE = 123;
	this.playing = false;
	this.paused = false;
	this.PAUSED_CHECK_INTERVAL = 200;
	this.pauseStartTime = 0;
	this.DEFAULT_TOAST_TIME = 3000;
	this.toast = document.getElementById('snailbait-toast');
	this.windowHasFocus = true;
	this.countdownInProgress = false;
	
	
	this.livesElement = document.getElementById('snailbait-lives');
	this.lifeIconLeft = document.getElementById('snailbait-life-icon-left');
	this.lifeIconMiddle = document.getElementById('snailbait-life-icon-middle');
	this.lifeIconRight = document.getElementById('snailbait-life-icon-right');
	
	this.creditsElement = document.getElementById('snailbait-credits');
	this.playAgainLink = document.getElementById('snailbait-play-again-link');
	
	this.rulerCanvas = document.getElementById("snailbait-ruler-canvas");
	this.rulerContext = this.rulerCanvas.getContext('2d');
	this.developerBackdoorElement = document.getElementById('snailbait-developer-backdoor');
	this.developerBackdoorVisible = false;
	this.collisionRectanglesCheckboxElement = document.getElementById('snailbait-collision-rectangles-checkbox');
	this.smokingHolesCheckboxElement = document.getElementById('snailbait-smoking-holes-checkbox');
	this.showSmokingHoles = true;
	
	this.soundAndMusicElement = document.getElementById('snailbait-sound-and-music');
	this.soundCheckboxElement = document.getElementById('snailbait-sound-checkbox');
	this.musicCheckboxElement = document.getElementById('snailbait-music-checkbox');
	this.instructionsElement = document.getElementById('snailbait-instructions');
	this.copyrightElement = document.getElementById('snailbait-copyright');
	this.OPAQUE = 1.0;
	this.SHORT_DELAY = 50;
	this.TRANSPARENT = 0;
	this.gameStarted = false;
	this.loadingElement = document.getElementById('snailbait-loading');
	this.loadingTitleElement = document.getElementById('snailbait-loading-title');
	this.loadingAnimatedGIFElement = document.getElementById("snailbait-loading-animated-gif");
	this.RUN_ANIMATION_RATE = 30;
	this.LEFT = 1;
	this.RIGHT = 2;
	this.BUTTON_CELLS_HEIGHT = 20;
	this.BUTTON_CELLS_WIDTH = 31;
	this.BUTTON_PACE_VELOCITY = 80;
	this.RUBY_CELLS_HEIGHT = 30;
	this.RUBY_CELLS_WIDTH = 35;
	this.COIN_CELLS_HEIGHT = 30;
	this.COIN_CELLS_WIDTH = 30;
	this.SNAIL_CELLS_HEIGHT = 34;
	this.SNAIL_CELLS_WIDTH = 64;
	this.SNAIL_PACE_VELOCITY = 50;
	this.SNAIL_BOMB_CELLS_HEIGHT = 20;
	this.SNAIL_BOMB_CELLS_WIDTH = 20;
	
	this.GRAVITY_FORCE = 9.81;
	this.CANVAS_WIDTH_IN_METERS = 13;
	this.PIXELS_PER_METER = this.canvas.width / this.CANVAS_WIDTH_IN_METERS;
	
	
	
	//this.RUNNER_EXPLOSION_DURATION = 500;
	this.MAX_NUMBER_OF_LIVES = 3;
	this.lives = this.MAX_NUMBER_OF_LIVES;
	
	this.BAD_GUYS_EXPLOSION_DURATION = 2500
	
	this.cannonSound = { position: 7.7, duration: 1031, volume: 0.5 };
	this.coinSound = { position: 7.1, duration: 588, volume: 0.5 };
	this.electricityFlowingSound = { position: 1.03, duration: 1753, volume: 0.5 };
	this.explosionSound = { position: 4.3, duration: 760, volume: 1 };
	this.pianoSound = { position: 5.6, duration: 395, volume: 0.5 };
	this.thudSound = { position: 3.1, duration: 809, volume: 1 };
	
	this.audioSprites = document.getElementById('snailbait-audio-sprites');
	this.audioChannels = [
	{playing:false,audio:this.audioSprites,},
	{playing:false,audio:null,},
	{playing:false,audio:null,},
	{playing:false,audio:null,},
	];
	
	this.audioSpriteCountdown = this.audioChannels.length - 1;
	this.graphicsReady = false;
	
	this.isShoot = false;
	
	
	this.platformArtist = {
		draw:function(sprite,context){
			var PLATFORM_STROKE_WIDTH = 100;
			var PLATFORM_STROKE_STYLE = 'black';
			var top;
			top = snailBait.calculatePlatformTop(sprite.track);
			context.lineWidh = PLATFORM_STROKE_WIDTH;
			context.strokeStyle = PLATFORM_STROKE_STYLE;
			context.fillStyle = sprite.fillStyle;
			context.globalAlpha = sprite.opacity;
	
			context.strokeRect(sprite.left, top, sprite.width, sprite.height);
			context.fillRect(sprite.left, top, sprite.width, sprite.height);
		}
		
	}
	this.runnerArtist = {
		//暂无使用此Artist
		draw:function(sprite,context){
			snailBait.context.drawImage(snailBait.runnerImage,sprite.left,sprite.top);
		}
	}
	
	
	this.platformData = [{
			left: 430,
			width: 230,
			height: this.PLATFROM_HEIGHT,
			fillStyle: 'rgb(250,250,0)',
			opacity: 0.5,
			track: 1,
			pulsate: true
		},
		{
			left: 730,
			width: 230,
			height: this.PLATFROM_HEIGHT,
			fillStyle: 'rgb(250,250,0)',
			opacity: 0.5,
			track: 2,
			pulsate: true
		},
		{
			left: 1030,
			width: 230,
			height: this.PLATFROM_HEIGHT,
			fillStyle: 'rgb(250,250,0)',
			opacity: 0.5,
			track: 3,
			pulsate: false
		}
		,
		{
			left: 1290,
			width: 230,
			height: this.PLATFROM_HEIGHT,
			fillStyle: 'rgb(250,250,0)',
			opacity: 0.5,
			track: 2,
			pulsate: false
		}
		,
		{
			left: 1560,
			width: 230,
			height: this.PLATFROM_HEIGHT,
			fillStyle: 'rgb(250,250,0)',
			opacity: 0.5,
			track: 1,
			pulsate: false
		}
		,
		{
			left: 1880,
			width: 230,
			height: this.PLATFROM_HEIGHT,
			fillStyle: 'rgb(250,250,0)',
			opacity: 0.5,
			track: 1,
			pulsate: false
		}
		,
		{
			left: 2130,
			width: 230,
			height: this.PLATFROM_HEIGHT,
			fillStyle: 'rgb(250,250,0)',
			opacity: 0.5,
			track: 2,
			pulsate: false
		}
	];


	this.BAT_CELLS_HEIGHT = 34;
	this.BEE_CELLS_HEIGHT = 50;
	this.BEE_CELLS_WIDTH = 50;
	this.RUNNER_CELLS_WIDTH = 50;
	this.RUNNER_CELLS_HEIGHT = 52;
	this.SNAIL_CELLS_HEIGHT = 34;
	this.SNAIL_CELLS_WIDTH = 64;
	
	
	
	this.batCells = [
	
	{left:3,top:0,width:44,height:this.BAT_CELLS_HEIGHT},
	{left:41,top:0,width:46,height:this.BAT_CELLS_HEIGHT},
	{left:93,top:0,width:36,height:this.BAT_CELLS_HEIGHT},
	{left:132,top:0,width:46,height:this.BAT_CELLS_HEIGHT}
	];
	
	this.beeCells = [
	{left:5,top:234,width:this.BEE_CELLS_WIDTH,height:this.BEE_CELLS_HEIGHT},
	{left:75,top:234,width:this.BEE_CELLS_WIDTH,height:this.BEE_CELLS_HEIGHT},
	{left:145,top:234,width:this.BEE_CELLS_WIDTH,height:this.BEE_CELLS_HEIGHT}
	];
	
	this.snailCells = [
	{left:142,top:466,width:this.SNAIL_CELLS_WIDTH,height:this.SNAIL_CELLS_HEIGHT},
	{left:75,top:466,width:this.SNAIL_CELLS_WIDTH,height:this.SNAIL_CELLS_HEIGHT},
	{left:2,top:466,width:this.SNAIL_CELLS_WIDTH,height:this.SNAIL_CELLS_HEIGHT}
	];
	
	this.runnerCellsRight = [
	{ left: 414, top: 385, width: 47, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 362, top: 385, width: 44, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 314, top: 385, width: 39, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 265, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 205, top: 385, width: 49, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 150, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 96, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 45, top: 385, width: 35, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 0, top: 385, width: 35, height: this.RUNNER_CELLS_HEIGHT }
	];
	
	this.runnerCellsLeft = [
	{ left: 0, top: 305, width: 47, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 55, top: 305, width: 44, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 107, top: 305, width: 39, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 152, top: 305, width: 46, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 208, top: 305, width: 49, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 265, top: 305, width: 46, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 320, top: 305, width: 42, height: this.RUNNER_CELLS_HEIGHT },
	{ left: 380, top: 305, width: 35, height: this.RUNNER_CELLS_HEIGHT }, 
	{ left: 425, top: 305, width: 35, height: this.RUNNER_CELLS_HEIGHT }
	];
	
	this.blueButtonCells = [
	{ 
		left: 10,
		top: 192,
		width: this.BUTTON_CELLS_WIDTH,
		height: this.BUTTON_CELLS_HEIGHT
	},
	{ 
		left: 53,
		top: 192, 
		width: this.BUTTON_CELLS_WIDTH,
		height: this.BUTTON_CELLS_HEIGHT
	}
	];
	this.goldButtonCells = [
	{ 
		left: 90,
		top: 190, 
		width: this.BUTTON_CELLS_WIDTH,
		height: this.BUTTON_CELLS_HEIGHT 
	},
	{ left: 132,
		top: 190,
		width: this.BUTTON_CELLS_WIDTH,
		height: this.BUTTON_CELLS_HEIGHT 
	}];
	
	this.rubyCells = [
	{ 
		left: 185,
		top: 138,
		width: this.RUBY_CELLS_WIDTH,
		height: this.RUBY_CELLS_HEIGHT 
	},
	{ 
		left: 220,
		top: 138,
		width: this.RUBY_CELLS_WIDTH,
		height: this.RUBY_CELLS_HEIGHT
	}, 
	{ 
		left: 258,
		top: 138,
		width: this.RUBY_CELLS_WIDTH,
		height: this.RUBY_CELLS_HEIGHT
	}, 
	{ 
		left: 294,
		top: 138,
		width: this.RUBY_CELLS_WIDTH,
		height: this.RUBY_CELLS_HEIGHT
	}, 
	{
		left: 331,
		top: 138,
		width: this.RUBY_CELLS_WIDTH,
		height: this.RUBY_CELLS_HEIGHT
	}
	];
	
	this.blueCoinCells = [
	{ left: 5, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT },
	{ left: 5 + this.COIN_CELLS_WIDTH, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }];
	
	this.goldCoinCells = [
	{ left: 65, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }, 
	{ left: 96, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT },
	{ left: 128, top: 540, width: this.COIN_CELLS_WIDTH, height: this.COIN_CELLS_HEIGHT }];
	
	this.snailCells = [{ left: 142, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT }, { left: 75, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT }, { left: 2, top: 466, width: this.SNAIL_CELLS_WIDTH, height: this.SNAIL_CELLS_HEIGHT }];
	
	this.snailBombCells = [{ left: 40, top: 512, width: 30, height: 20 }, { left: 2, top: 512, width: 30, height: 20 }];
	
	this.RUNNER_EXPLOSION_DURATION = 500;
	this.EXPLOSION_CELLS_HEIGHT = 62;
	this.explosionCells = [{ left: 3, top: 48, width: 52, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 63, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 146, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 233, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 308, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 392, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }, { left: 473, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT }];
	
	
	this.bats = [];
	this.bees = [];
	this.buttons = [];
	this.coins = [];
	this.platforms = [];
	this.rubies = [];
	this.sapphires = [];
	this.snails = [];
	this.sprites = [];
	
	this.batData = [
	{
		left:760,top:this.TRACK_1_BASELINE 
	},
	{
		left:850,top:this.TRACK_1_BASELINE
	},
	{
		left:980,top:this.TRACK_1_BASELINE 
	},
	{
		left:1150,top:this.TRACK_3_BASELINE - 2* this.BAT_CELLS_HEIGHT
	},
	{
		left:1330,top:this.TRACK_2_BASELINE - 2* this.BAT_CELLS_HEIGHT
	},
	{
		left:1560,top:this.TRACK_1_BASELINE - this.BAT_CELLS_HEIGHT
	},
	{
		left:1900,top:this.TRACK_2_BASELINE - this.BAT_CELLS_HEIGHT
	},
	{
		left:1680,top:this.TRACK_3_BASELINE - 1* this.BAT_CELLS_HEIGHT
	}
	];
	
	this.beeData = [
	{
		left:420,
		top:this.TRACK_2_BASELINE - 1*this.BEE_CELLS_HEIGHT
	},
	{
		left:500,
		top:this.TRACK_2_BASELINE - 1*this.BEE_CELLS_HEIGHT
	},
	{
		left:580,
		top:this.TRACK_2_BASELINE - this.BEE_CELLS_HEIGHT
	},
	{
		left:830,
		top:this.TRACK_2_BASELINE - 1.5*this.BEE_CELLS_HEIGHT
	},
	{
		left:980,
		top:this.TRACK_2_BASELINE - 1.5*this.BEE_CELLS_HEIGHT
	},
	{left:1100,top:215},
	{left:1200,top:215},
	{left:1300,top:275},
	{left:1500,top:275},
	{left:1700,top:275}
	];
	
	this.buttonData = [
		{
			platformIndex:1
		},
//		{
//			platformIndex:2
//		},
//		{
//			platformIndex:3
//		},
		{
			platformIndex:6
		}
	];
	
	this.snailData = [{ platformIndex: 3 }, ];
	
	this.rubyData = [
	{ 
		left: 690, 
		top: this.TRACK_1_BASELINE - this.RUBY_CELLS_HEIGHT
	},
	{ 
		left: 1700,
		top: this.TRACK_2_BASELINE - this.RUBY_CELLS_HEIGHT
	}, 
	{ 
		left: 2056,
		top: this.TRACK_3_BASELINE - this.RUBY_CELLS_HEIGHT
	}];
	
	this.coinData = [
	{ left: 470, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
	{ left: 570, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
	{ left: 800, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },
	{ left: 933, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },
	{ left: 1050, top: this.TRACK_3_BASELINE - this.COIN_CELLS_HEIGHT }, 
	{ left: 1450, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },
	{ left: 1640, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
	{ left: 1970, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }, 
	{ left: 2030, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }, 
	{ left: 2080, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT }, 
	{ left: 2220, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }, 
	{ left: 2330, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT }];
	
	
	this.smokingHoleData = [
	{ left: 242, top: this.TRACK_2_BASELINE+35},
	{ left: 782, top: this.TRACK_2_BASELINE+35}
	];
	
	this.smokingHoles = [];
	
	
	
	this.runBehavior = {
		lastAdvanceTime:0,
		execute:function(sprite,now,fps,context,lastAnimationFrameTime){
			//console.log("runBehavior");
			//console.log((lastAnimationFrameTime));
			if(sprite.runAnimationRate === 0){
				//return;
			}
			if(this.lastAdvanceTime === 0){
				this.lastAdvanceTime = now;
			}
			else if(now-this.lastAdvanceTime > 1000/sprite.runAnimationRate){
				sprite.artist.advance();
				this.lastAdvanceTime = now;
			}
		}
	};
	
	this.paceBehavior = {
		execute:function(sprite,now,fps,context,lastAnimationFrameTime){
			
			this.setDirection(sprite);
			this.setPosition(sprite,now,lastAnimationFrameTime);
		},
		setDirection:function(sprite){
			//console.log(sprite.type);
			var sRight = sprite.left + sprite.width;
			var pRight = sprite.platform.left + sprite.platform.width;
			//console.log(sprite.left-sprite.platform.left);
			if(sprite.direction === undefined){
				sprite.direction = snailBait.RIGHT;
			}
			
			if(sRight > pRight && sprite.direction === snailBait.RIGHT){
				sprite.direction = snailBait.LEFT;
				
			}
			if(sprite.left < sprite.platform.left && sprite.direction === snailBait.LEFT){
				sprite.direction = snailBait.RIGHT;
				//console.log(sprite.left - sprite.platform.left);
			}
		},
		
		setPosition:function(sprite,now,lastAnimationFrameTime){
			if(lastAnimationFrameTime !=0){
			var pixelsToMove = sprite.velocityX * (now-lastAnimationFrameTime)/1000;
			if(sprite.direction===snailBait.RIGHT){
				
				sprite.left += pixelsToMove;
			}else{
				sprite.left -= pixelsToMove;
			}
			
			}
		}
	}
	
	this.snailShootBehavior = {
		execute: function (sprite,now,fps,context,lastAnimationFrameTime){
			var bomb = sprite.bomb;
			var MOUTH_OPEN_CELL = 2;
			//
			if(! snailBait.isSpriteInView(sprite)){
				//console.log(bomb.visible);
				return;
			}
			//(! bomb.visible &&)
			if( sprite.artist.cellIndex === MOUTH_OPEN_CELL){
				bomb.left = sprite.left+15;
				bomb.visible = true;
			}
		}
	};
	
	this.runnerShootBehavior = {
		execute: function (sprite,now,fps,context,lastAnimationFrameTime){
			var bomb = sprite.bomb;
			var MOUTH_OPEN_CELL = 0;
			
			//if(!snailBait.isSpriteInView(sprite)){
            //	return;
			//}
			//console.log(bomb.left);
			for(var i = 0;i<snailBait.runner.bombs.length;i++){
				bomb = snailBait.runner.bombs[i];
				if( bomb.visible == false ){
					bomb.left = sprite.left+snailBait.spriteOffset+15;
					bomb.top = sprite.top+bomb.height / 2;
					bomb.isShoot = false;
					//console.log(bomb.isShoot);
					//bomb.visible = true;
					//snailBait.isShoot = false;
				}
			}
			this.begainShoot();
		},
		begainShoot:function(){
			if(snailBait.isShoot == true){
				//console.log(snailBait.runner.bombs[0].isShoot);
				for(var i = 0;i<snailBait.runner.bombs.length;i++){
					bomb = snailBait.runner.bombs[i];
					if( bomb.isShoot == false ){
						bomb.isShoot = true;
						bomb.visible = true;
						//console.log(i+"bomb");
						snailBait.isShoot = false;
						return;
					}
				}	
			}
		}
	};
	
	this.snailBombMoveBehavior = { 
		execute: function(sprite,now,fps,context,lastAnimationFrameTime) {
			var SNAIL_BOMB_VELOCITY = 550;
			//？？sprite.left + sprite.width > sprite.hOffset && sprite.left + sprite.width < sprite.hOffset + sprite.width
			if(sprite.left + sprite.width < sprite.hOffset || sprite.left + sprite.width > sprite.hOffset + snailBait.canvas.width)
			{
				
				sprite.visible = false;
				//console.log(sprite.visible);
			} 
			else {
				sprite.left -= SNAIL_BOMB_VELOCITY * ((now - lastAnimationFrameTime) / 1000);
			} 
		} 
	};
	
	this.runnerBombMoveBehavior = {
		execute: function(sprite,now,fps,context,lastAnimationFrameTime) {
			var RUNNER_BOMB_VELOCITY = 550;
			
			//console.log(sprite.left + sprite.width < sprite.hOffset || sprite.left + sprite.width > sprite.hOffset + snailBait.canvas.width);
			
				//sprite = snailBait.runner.bombs[i];
				if(sprite.isShoot){
					if(!(sprite.left + sprite.width > sprite.hOffset && sprite.left + sprite.width < sprite.hOffset + snailBait.canvas.width))
					{
						sprite.visible = false;
						sprite.isShoot = false;
					}
					else {
						sprite.visible = true;
						if(snailBait.runner.direction === snailBait.LEFT){
							sprite.left -= RUNNER_BOMB_VELOCITY * ((now - lastAnimationFrameTime) / 1000);
							
						}else{
							sprite.lastLeft = sprite.left;
							sprite.left += RUNNER_BOMB_VELOCITY * ((now - lastAnimationFrameTime) / 1000);
							//console.log(sprite.left-sprite.lastLeft);
							//sprite.speedX =  
						}
					} 
				//}
			}	
		} 
	};
	
	this.jumpBehavior = {
		isAscending:function(sprite){
			return sprite.ascendTimer.isRunning();
		},
		ascend:function(sprite,now){
			var elapsed = sprite.ascendTimer.getElapsedTime(now);
			var deltaY = elapsed / (sprite.JUMP_DURATION / 2) * sprite.JUMP_HEIGHT;
			sprite.top = sprite.verticalLaunchPosition - deltaY;//向上
			
		},
		isDoneAscending:function(sprite,now){
			//console.log(sprite.type+now);
			//console.log(sprite.ascendTimer.getElapsedTime(now)+"/"+sprite.JUMP_DURATION / 2);
			
			return sprite.ascendTimer.getElapsedTime(now) > sprite.JUMP_DURATION / 2;
		},
		finishAscent:function(sprite,now){
			sprite.jumpApex = sprite.top;
			sprite.ascendTimer.stop(now);
			sprite.descendTimer.start(now);
		},
		isDescending:function(sprite){
			return sprite.descendTimer.isRunning();
		},
		descend:function(sprite,now){
			var elapsed = sprite.descendTimer.getElapsedTime(now);
			var deltaY = elapsed / (sprite.JUMP_DURATION / 2) * sprite.JUMP_HEIGHT;
			sprite.top = sprite.jumpApex + deltaY;//向下
		},
		isDoneDescending:function(sprite,now){
			return sprite.descendTimer.getElapsedTime(now) > sprite.JUMP_DURATION/2;
		},
		finishDescent:function(sprite,now){
			sprite.stopJumping();
			//如果在平台上
			if(snailBait.platformUnderneath(sprite) || sprite.track === 0 ){
				//verticalLaunchPosition初始高度
				sprite.top = sprite.verticalLaunchPosition;
				
			}else{
				//sprite.top = sprite.verticalLaunchPosition;
				sprite.fall(snailBait.GRAVITY_FORCE * 
					(sprite.descendTimer.getElapsedTime(now) / 1000) *
					snailBait.PIXELS_PER_METER);
			}
		},
		pause:function(sprite){
			if(sprite.ascendTimer.isRunning()){
				sprite.ascendTimer.pause();
			}else if(sprite.descendTimer.isRunning()){
				sprite.descendTimer.pause();
			}
		},
		unpause:function(sprite){
			if(sprite.ascendTimer.isRunning()){
				sprite.ascendTimer.unpause();
			}else if(sprite.descendTimer.isRunning()){
				sprite.descendTimer.unpause();
			}
		},
		execute:function(sprite,now,fps,context,lastAnimationFrameTime){
			if(!sprite.jumping || sprite.track === 4){
				return;
			}
			//console.log(sprite.ascendTimer.stopwatch.getElapsedTime(now));
			//console.log(sprite.ascendTimer.stopwatch.running);
			//console.log(this.isAscending(sprite));

			if(this.isAscending(sprite)){
				//上升阶段
				if(!this.isDoneAscending(sprite,now)){	
					//console.log(sprite.ascendTimer.getElapsedTime(now) > sprite.JUMP_DURATION / 2);
					//判断上升是否结束
					this.ascend(sprite,now);				//上升
				}else{

					this.finishAscent(sprite,now);		//结束上升
				}
			}else if(this.isDescending(sprite)){
				//下降阶段
				if(! this.isDoneDescending(sprite,now)){	//判断下降是否结束
					this.descend(sprite,now);				//下降
				}else{
					this.finishDescent(sprite,now);			//下降结束
				}
			}
		}
	}
	
	this.collideBehavior = {
		execute:function(sprite,now,fps,context,lastAnimationFrameTime){
			var otherSprite;
			var r = sprite.calculateCollisionRectangle();
			
			context.beginPath();
			//rect() 方法创建矩形。 提示:请使用 stroke() 或fill() 方法在画布上实际地绘制矩形。
			//context.rect(o.left,o.top,o.right-o.left,o.bottom-o.top);
			context.rect(r.left,r.top,r.right-r.left,r.bottom-r.top);
			//context.fill();
			for(var i = 0; i<snailBait.sprites.length;++i){
				otherSprite = snailBait.sprites[i];
				//是否碰撞候选
				if(this.isCandidateForCollision(sprite,otherSprite)){
					//碰撞判断
					if(this.didCollide(sprite,otherSprite,context)){
						if(sprite.type ==='runner'){
							this.processCollision(sprite,otherSprite);
						}
						if(sprite.type ==='runner bomb'){
							this.processRunnerBombCollision(sprite,otherSprite);
						}
						
					}
				}
			}
		},
		adjustScore:function(sprite){
			if(sprite.value){
				snailBait.score += sprite.value;
				snailBait.updateScoreElement();
			}
		},
		//判断是否是碰撞候选（对象是否可见。。）
		isCandidateForCollision:function(sprite,otherSprite){
			var s;
			var o;
			
			if(! sprite.calculateCollisionRectangle || ! otherSprite.calculateCollisionRectangle){
				return false;				
			}
			
			s= sprite.calculateCollisionRectangle();
			o = otherSprite.calculateCollisionRectangle();
			
			return o.left < s.right &&  sprite !== otherSprite && sprite.visible && otherSprite.visible 
 			&& !sprite.exploding && !otherSprite.exploding;
		},
		//返回碰撞检测结果
		didCollide:function(sprite,otherSprite,context){
			var o = otherSprite.calculateCollisionRectangle();
			var r = sprite.calculateCollisionRectangle();
			
			if(otherSprite.type === 'snail bomb'){
				//return this.didRunnerCollideWithOtherSprite(r,o,context);
				return this.didRunnerCollideWithSnailBomb(r,o,context);
			}else{
				return this.didRunnerCollideWithOtherSprite(r,o,context);
			}	
		},
		didRunnerCollideWithOtherSprite:function(r,o,context){
			context.beginPath();
			//rect() 方法创建矩形。 提示:请使用 stroke() 或fill() 方法在画布上实际地绘制矩形。
			context.rect(o.left,o.top,o.right-o.left,o.bottom-o.top);
			//context.rect(r.left,r.top,r.right-o.left,r.bottom-o.top);
			//console.log(o.hOffset);
			//context.fill();
			//console.log(((r.top > o.bottom )  ||  (r.bottom < o.top) || (r.left > o.right) || (r.right < o.left)));
			//nb
			return !((r.top > o.bottom )  ||  (r.bottom < o.top) || (r.left > o.right) || (r.right < o.left)) ;
			
			//可以添加多个点进行校验
//			return  context.isPointInPath(r.left,r.top) || 
//					context.isPointInPath(r.right,r.top) || 
//					context.isPointInPath(r.centerX,r.centerY) || 
//					context.isPointInPath(r.left,r.bottom) || 
//					context.isPointInPath(r.right,r.bottom);
		},
		didRunnerCollideWithSnailBomb:function(r,o,context){
			context.beginPath();
			context.rect(r.left+snailBait.spriteOffset,r.top,r.right-r.left,r.bottom-r.top);
			//context.fill();
			return context.isPointInPath(o.centerX,o.centerY);
		},
		processCollision:function(sprite,otherSprite){
			if(sprite.jumping && "platform" === otherSprite.type){
				this.processPlatformCollisionDuringJump(sprite,otherSprite);
			}else if(
					'coin' === otherSprite.type ||
					'sapphire' === otherSprite.type ||
					'ruby' === otherSprite.type ||
					'snail' === otherSprite.type){
				this.processAssetCollision(otherSprite);
			}
			
			if(		'bat' === otherSprite.type || 
					'bee' === otherSprite.type ||
					'snail bomb' === otherSprite.type 
			){
				this.processBadGuyCollision(otherSprite);
			}
			if('button' === otherSprite.type){
				if(sprite.jumping && sprite.descendTimer.isRunning() || sprite.falling){
					otherSprite.detonating = true;
				}
			}
		},
		processRunnerBombCollision:function(sprite,otherSprite){
			if("platform" === otherSprite.type){
				sprite.visible = false;
			}else if(
					'coin' === otherSprite.type ||
					'sapphire' === otherSprite.type ||
					'ruby' === otherSprite.type ||
					'snail' === otherSprite.type){
				
			}
			
			if(		'bat' === otherSprite.type || 
					'bee' === otherSprite.type ||
					'snail bomb' === otherSprite.type || 
					'snail' === otherSprite.type
			){
				snailBait.explode(otherSprite);
				//snailBait.shake();
				setTimeout(function(e){
					otherSprite.visible = false;
				},1000);
				
				sprite.visible = false;
			}
			
		},
		processAssetCollision:function(sprite){
			sprite.visible = false;
			if(sprite.type === 'coin'){
				snailBait.playSound(snailBait.coinSound);
			}else{
				snailBait.playSound(snailBait.pianoSound);
			}
			
			
			this.adjustScore(sprite);
		},
		processBadGuyCollision:function(sprite){
			if(sprite.type === 'snail bomb'){
				snailBait.explode(snailBait.runner);
			}
			
			snailBait.explode(sprite);
			//console.log(sprite.exploding)
			//console.log(sprite.type)
			snailBait.shake();
			
			snailBait.loseLife();
		},
		processPlatformCollisionDuringJump:function(sprite,platform){
			var isDescending = sprite.descendTimer.isRunning();
			
			sprite.stopJumping();
			
			if(isDescending){
				snailBait.putSpriteOnTrack(sprite,platform.track);
				//sprite.stopJumping();
				snailBait.playSound(snailBait.thudSound);
			}else{
				sprite.fall();
				snailBait.playSound(snailBait.thudSound);
			}
		}
	};
	this.fallBehavior = {
		pause: function(c, b) { c.fallTimer.pause(b) },
		unpause: function(c, b) { c.fallTimer.unpause(b) },
		isOutOfPlay: function(b) { return b.top > snailBait.canvas.height },
		setSpriteVelocity: function(c, b) {
			
			c.velocityY = c.initialVelocityY + snailBait.GRAVITY_FORCE * (c.fallTimer.getElapsedTime(b) / 1000) * snailBait.PIXELS_PER_METER 
			//console.log(snailBait.PIXELS_PER_METER);
		},
		calculateVerticalDrop: function(d, c, b) {			
			return d.velocityY * (c - b) / 1000;
		},
		willFallBelowCurrentTrack: function(c, b) {
			return c.top + c.height + b > snailBait.calculatePlatformTop(c.track) 
		},
		fallOnPlatform: function(b) {
			b.stopFalling();
			snailBait.putSpriteOnTrack(b, b.track);
			//console.log(b.track);
			if(b.track !== 0){
				snailBait.playSound(snailBait.thudSound);
			}
			//snailBait.playSound(snailBait.thudSound)
		},
		//e sprite | d now | b last
		moveDown: function(e, d, b) {
			var c;
			this.setSpriteVelocity(e, d);
			c = this.calculateVerticalDrop(e, d, b);
			
			if(!this.willFallBelowCurrentTrack(e, c)) {
				e.top += c ;
			} else {
				if(snailBait.platformUnderneath(e) || e.track === 0) {

					this.fallOnPlatform(e);
					e.stopFalling()
				} else {
					
					e.track--;
					e.top += c;
				}
			}
		},
		execute: function(e, c, f, d, b) {
			//console.log(e.track);
			if(e.falling) {
				if(!this.isOutOfPlay(e) && !e.exploding) {
					this.moveDown(e, c, b) 
				} else {
					e.stopFalling();
					if(this.isOutOfPlay(e)) {
						//snailBait.loseLife();
						//snailBait.playSound(snailBait.electricityFlowingSound);
						//snailBait.runner.visible = false
					}
				}
			} else {
				if(!e.jumping && !snailBait.platformUnderneath(e) ) {
					if(e.track !==0){
						//e.falling = true;
						//console.log(e.track);
						//console.log(snailBait.platformUnderneath(e));
						//e.fall(600) 
						e.fall(); 
					}
					
				} 
			}
		}
	};
	this.runnerExplodeBehavior = new CellSwitchBehavior(this.explosionCells,this.RUNNER_EXPLOSION_DURATION,
	function(sprite,now,fps,lastAnimationFrameTime){
		return sprite.exploding;
	},
	function(sprite,animator){
		sprite.exploding = false;
		//sprite.visible = false;
		//snailBait.runner.visible = false;
	}
	);
	
	this.blueButtonDetonateBehavior = {
		execute:function(sprite,now,fps,lastAnimationFrameTime){
			var BUTTON_REBOUND_DELAY = 1000;
			var SECOND_BEE_EXPLOSION_DELAY = 400;
			
			if(!sprite.detonating){
				return;
			}
			
			sprite.artist.cellIndex = 1;
			
			snailBait.explode(snailBait.bees[3]);
			
			setTimeout(function(){
				snailBait.explode(snailBait.bees[4]);
			},SECOND_BEE_EXPLOSION_DELAY);
			
			sprite.detonating = false;
			
			setTimeout(function(){
				sprite.artist.cellIndex = 0;
				
			},BUTTON_REBOUND_DELAY);
		}
	}
	
	this.goldButtonDetonateBehavior = {
		execute:function(sprite,now,fps,lastAnimationFrameTime){
			var BUTTON_REBOUND_DELAY = 1000;
			//是否下落触发
			if(!sprite.detonating){
				return;
			}
			sprite.artist.cellIndex = 1;//压扁状态
			
			snailBait.revealWinningAnimation();
			sprite.detonating = false;
			
			setTimeout(function(){
				sprite.artist.cellIndex = 0;
			},BUTTON_REBOUND_DELAY);
			
		}
	}
	
	this.slider1 = document.getElementById('cdk-slider1');
	this.cdkslider = document.getElementsByClassName('cdk-slider')[0];
	this.timeRateReadout1 = document.getElementById('snailbait-time-rate-readout1');
	
	
};

SnailBait.prototype = {
	startGame: function() {
		this.timeSystem.start();
		this.playing = true;
		this.startMusic();
		//snailBait.draw(now);
		this.revealGame();
		this.revealInitialToast();
		//this.timeSystem.start();
		requestAnimationFrame(snailBait.animate);
	},
	startMusic:function(){
		var MUSCI_DELAY = 1000;
		//snailBait.musicElement.currentTime = 30;
		setTimeout(function(){
			if(snailBait.musicCheckboxElement.checked){
				snailBait.musicElement.play();
			}
			
			snailBait.pollMusic();
			
		},MUSCI_DELAY);
	},
	//循环播放音乐
	pollMusic:function(){
		var POLL_INTERVAL = 500;
		var SOUNDTRACK_LENGTH = 61;//117单位秒
		var timerID;
		timerID = setInterval(function(){
			//console.log(snailBait.musicElement.currentTime);
			if(snailBait.musicElement.currentTime > SOUNDTRACK_LENGTH){
				
				clearInterval(timerID);
				snailBait.restartMusic();
			}
		},POLL_INTERVAL);
	},
	restartMusic:function(){
		//console.log(snailBait.musicElement.currentTime);
		//重新加载音频元素。
		snailBait.musicElement.load();
		//下边设置currentTime无效
		//snailBait.musicElement.currentTime = 0;
		snailBait.startMusic();
	},
	createAudioChannels:function(){
		var channel;
		
		for(var i = 0;i<this.audioChannels.length;++i){
			channel = this.audioChannels[i];
			
			if(i!==0){
				channel.audio = document.createElement('audio');
				channel.audio.src = this.audioSprites.currentSrc;
				
				channel.audio.addEventListener('loadeddata',this.soundLoaded,false);
				
				channel.audio.autobuffer = true;
			}
		}
	},
	soundLoaded:function(){
		snailBait.audioSpriteCountdown--;
		if(snailBait.audioSpriteCountdown === 0){
			if(!snailBait.gameStarted && snailBait.graphicsReady){
				snailBait.startGame();
			}
		}
		
	},
	spritesheetLoaded:function(){
		var LOADING_SCREEN_TRSNSITION_DURATION = 2000;
		this.graphicsReady = true;
		
		this.fadeOutElements(this.loadingElement,LOADING_SCREEN_TRSNSITION_DURATION);
		
		setTimeout(function(){
			if(!snailBait.gameStarted && snailBait.audioSpriteCountdown === 0){
				snailBait.startGame();	
			}
		},LOADING_SCREEN_TRSNSITION_DURATION);
	},
	playSound:function(sound){
		var channel;
		var audio;
		if(this.soundOn){
			channel = this.getFirstAvailableAudioChannel();
			
			if(channel == null){
				if(console){
					console.warn("声道很忙，无法播放音效");
				}
			}else{
				audio = channel.audio;//对象
				//console.log(audio);
				audio.volume = sound.volume;//音量
				this.seekAudio(sound,audio);
				this.playAudio(audio,channel);
				
				setTimeout(function(){
					channel.playing = false;
					snailBait.seekAudio(sound,audio);
					
				},sound.duration);
			}
			
			
		}
	},
	getFirstAvailableAudioChannel:function(){
		//console.log(this.audioChannels.length);
		for(var i = 0;i< this.audioChannels.length;++i){
			
			if(!this.audioChannels[i].playing){
				console.log(i+"声道||");
				return this.audioChannels[i];
			}
		}
		
		return null;
	},
	seekAudio:function(sound,audio){
		try{
			audio.pause();
			//谷歌浏览器无效
			//每次播放前都会重置时间
			audio.currentTime = sound.position;
		}catch(e){
			console.log("找不到音效");
		}
	},
	playAudio:function(audio,channel){
		try{
			audio.play();
			channel.playing = true;
		}catch(e){
			console.log("不能播放音效");
		}
	},
	initializeImages: function() {
		this.spritesheet.src = 'img/spritesheet1.png';
		this.background.src = 'img/background.png';
		this.runnerImage.src = 'img/runner.png';
		this.loadingAnimatedGIFElement.src = "img/loading.gif";
		this.background.onload = function(e) {
			//snailBait.backgroundLoaded();
		};
		this.spritesheet.onload = function(e) {
			snailBait.backgroundLoaded();
		};
		this.loadingAnimatedGIFElement.onload = function(){
			snailBait.loadingAnimationLoaded();
		}

	},
	draw: function(now) {

		this.setPlatformVelocity(now);
		this.setOffsets(now);
		//setBackgroundOffset(now);
		this.drawBackground();
		//
		//this.drawRunner();
		//this.drawPlatforms();
		
		this.updateSprites(now);
		this.drawSprites();
		if(this.developerBackdoorVisible){
			this.eraseRuler();
			this.drawRuler();
		}
	},
	setOffsets: function(now) {
		snailBait.setBackgroundOffset(now);
		snailBait.setSpriteOffsets(now);
		//snailBait.setPlatformOffset(now);
	},
	//已作废
	setPlatformOffset: function(now) {
		this.platformOffset += this.platformVelocity * (now - this.lastAnimationFrameTime) / 1000;

	},
	setBackgroundOffset: function(now) {

		this.backgroundOffset += this.bgVelocity * (now - this.lastAnimationFrameTime) / 1000;

		if(this.backgroundOffset < 0 || this.backgroundOffset > this.background.width) {
			
			//console.log(this.spriteOffset);
			if(this.spriteOffset < 10){
				this.backgroundOffset = 0;
				this.spriteOffset = 0
			}
			if(this.backgroundOffset > this.background.width){
				this.backgroundOffset = 0;
			}
			if(this.backgroundOffset < 0){
				this.backgroundOffset = this.background.width;
			}
			
			//this.platformOffset = 0; 
		}
	},
	setSpriteOffsets: function(now) {
//		console.log(this.spriteOffset);
//		if(this.spriteOffset < 0){
//			this.spriteOffset = 0;
//		}
		var sprite;
		this.spriteOffset += this.platformVelocity * (now - this.lastAnimationFrameTime) / 1000;
		//console.log(this.sprites[0].hOffset);
		for(var i = 0; i<this.sprites.length; ++i){
			sprite = this.sprites[i];
			if("smoking hole" === sprite.type) {
				sprite.hOffset = this.backgroundOffset 
			}else if('runner' !== sprite.type){
				sprite.hOffset = this.spriteOffset;
			}
		}
	},
	turnLeft: function() {
		this.bgVelocity = -this.BACKGROUND_VELOCITY;
	},
	turnRight: function() {
		this.bgVelocity = this.BACKGROUND_VELOCITY;
	},
	//这里不能用this，因为调用animate（）的requestAnimationFrame是全局函数
	animate: function(now) {
		now = snailBait.timeSystem.calculateGameTime();
		//console.log(now);
		if(snailBait.paused) {
			setTimeout(function() {
				//console.log("paused");
				requestAnimationFrame(snailBait.animate);
			}, snailBait.PAUSED_CHECK_INTERVAL);
		} else {
			snailBait.draw(now);
			snailBait.fps = snailBait.calculateFps(now);
			snailBait.lastAnimationFrameTime = now;
			requestAnimationFrame(snailBait.animate); //再次调用animate（）函数
		}
	},
	drawBackground: function() {
		//偏移坐标系
		this.context.translate(-this.backgroundOffset, 0);
		this.context.drawImage(this.background, 0, 0);
		this.context.drawImage(this.background, this.background.width, 0);
		//恢复坐标系
		this.context.translate(this.backgroundOffset, 0);
	},
	calculateFps: function(now) {
		this.fps = 1 / (now - this.lastAnimationFrameTime) * 1000 * this.timeRate;
		//console.log(now - this.lastAnimationFrameTime);
		if(now - this.lastFpsUpdateTime > 1000) {
			this.lastFpsUpdateTime = now;
			this.fpsElement.innerHTML = this.fps.toFixed(0) + ' fps';
			//console.log(fps.toFixed(0));
		}
		return this.fps;
	},
	drawRunner: function() {
		this.context.drawImage(
			this.runnerImage,
			this.RUNNER_LEFT,
			430 - this.runnerImage.height);
	},
	calculatePlatformTop: function(track) {
		if(track === 1) {
			return this.TRACK_1_BASELINE;
		} else if(track === 2) {
			return this.TRACK_2_BASELINE;
		} else if(track === 3) {
			return this.TRACK_3_BASELINE;
		}else if(track === 0) {
			return this.TRACK_0_BASELINE;
		}
	},
	//已作废
	drawPlatform: function(data) {
		var platformTop = this.calculatePlatformTop(data.track);

		this.context.lineWidh = 100;
		this.context.strokeStyle = 'red';
		this.context.fillStyle = data.fillStyle;
		this.context.globalAlpha = data.opacity;

		this.context.strokeRect(data.left, platformTop, data.width, data.height);
		this.context.fillRect(data.left, platformTop, data.width, data.height);
	},
	//已作废
	drawPlatforms: function() {
		var index;
		this.context.translate(-this.platformOffset, 0);
		for(index = 0; index < this.platformData.length; ++index) {
			this.drawPlatform(this.platformData[index]);
		}
		this.context.translate(this.platformOffset, 0);
	},
	setPlatformVelocity: function() {
		this.platformVelocity = this.bgVelocity * this.PLATFORM_VELOCITY_MULTIPLIER;
	},
	togglePausedStateOfAllBehaviors: function(b) {
		var behavior;
		for(var c = 0; c < this.sprites.length; ++c) 
		{ 
			sprite = this.sprites[c];
			for(var a = 0;a < sprite.behaviors.length; ++a) { 
					behavior = sprite.behaviors[a];
					if(this.paused) { 
						if(behavior.pause) {
							behavior.pause(sprite, b) 
						} 
					} else {
						if(behavior.unpause) {
							behavior.unpause(sprite, b)
						} 
					} 
			} 
		} 
	},

	togglePaused: function() {
		var now = this.timeSystem.calculateGameTime();
		this.paused = !this.paused;

		this.togglePausedStateOfAllBehaviors();
		
		if(this.paused) {
			this.pauseStartTime = now;
		} else {
			this.lastAnimationFrameTime += (now - this.pauseStartTime);
		}
		
		if(this.musicOn){
			if(this.paused){
				this.musicElement.pause();
			}else{
				this.musicElement.play();
			}
		}
	},
	revealToast: function(text, duration) {
		var DEFAULT_TOAST_DISPLAY_DURATION = 1000;
		duration = duration || DEFAULT_TOAST_DISPLAY_DURATION;
		snailBait.startToastTranstion(text,duration);
		
		setTimeout(function(e) {
			snailBait.hideToast();
		}, duration)
	},
	revealCredits:function(){
		this.fadeInElements(this.creditsElement);
	},
	hideCredits:function(){
		var FADE_DURATION = 1000;
		this.fadeOutElements(this.creditsElement,FADE_DURATION);
	},
	startToastTranstion:function(text){
		this.toast.innerHTML = text;
		this.fadeInElements(this.toast);
	},
	hideToast:function(){
		var TOAST_TRANSITION_DURATION = 1000;
		this.fadeOutElements(this.toast,TOAST_TRANSITION_DURATION);
		
	},
	//
	fadeInElements:function(){
		var args = arguments;
		for (var i = 0;i<args.length;i++) {
			args[i].style.display = 'block';
		}
		
		setTimeout(function(){
			for (var i = 0;i<args.length;i++) {
			args[i].style.opacity = snailBait.OPAQUE;
		}
		},this.SHORT_DELAY)
	},
	fadeOutElements:function(){
		var args = arguments;
		//最后一个参数
		var fadeDuration = args[args.length-1];
		//
		//待处理
		setTimeout(function(){
			for (var i = 0;i<args.length-1;i++) {
			args[i].style.opacity = snailBait.TRANSPARENT;
			
			}
		},fadeDuration);
		setTimeout(function(){
			for (var i = 0;i<args.length-1;i++) {
			args[i].style.display = 'none';
		}
		},fadeDuration);
	},
	backgroundLoaded:function(){
		var LOADING_SCREEN_TRANSITION_DURATION = 3000;
		this.fadeOutElements(this.loadingElement,LOADING_SCREEN_TRANSITION_DURATION);
		setTimeout(function(){
			snailBait.startGame();
			snailBait.gameStarted = true;
			
		},LOADING_SCREEN_TRANSITION_DURATION);
	},
	loadingAnimationLoaded:function(){
		if(!this.gameStarted){
			this.fadeInElements(this.loadingAnimatedGIFElement,this.loadingTitleElement);
		} 
	},
	revealGame:function(){
		var DIM_CONTROLS_DELAY = 5000;
		this.revealTopChromeDimmed();
		this.revealCanvas();
		this.revealBottomChrome();
		
		setTimeout(function(){
			snailBait.dimControls();
			snailBait.revealTopChrome();
		},DIM_CONTROLS_DELAY);
	},
	dimControls:function(){
		var FINAL_OPACITY = 0.5;
		snailBait.instructionsElement.style.opacity = FINAL_OPACITY;
		snailBait.soundAndMusicElement.style.opacity = FINAL_OPACITY;
		snailBait.livesElement.style.opacity = FINAL_OPACITY;
	},
	//展现
	revealCanvas:function(){
	this.fadeInElements(this.canvas);
	},
	revealTopChrome:function(){
		this.fadeInElements(this.fpsElement,this.scoreElement,this.livesElement);
		
	},
	revealBottomChrome:function(){
		this.fadeInElements(this.soundAndMusicElement,
		this.instructionsElement,this.copyrightElement
		);
	},
	revealTopChromeDimmed:function(){
		var DIM = 0.25;
		this.scoreElement.style.display = 'block';
		this.fpsElement.style.display = 'block';
		this.livesElement.style.display = 'block';
		setTimeout(function(){
			snailBait.scoreElement.style.opacity = DIM; 
		snailBait.fpsElement.style.opacity = DIM;
		snailBait.livesElement.style.opacity = DIM;
		},this.SHORT_DELAY);
	},
	revealInitialToast:function(){
		var INITIAL_TOAST_DELAY = 1500;
		var INITIAL_TOAST_DURATION = 3000;
		setTimeout(function(){
			snailBait.revealToast("碰撞硬币珠宝，避免蝙蝠蜜蜂",INITIAL_TOAST_DURATION)
		},INITIAL_TOAST_DELAY);
	},
	//更新行为
	updateSprites:function(now){
		
		var sprite;
		for(var i= 0;i<this.sprites.length;++i){
			sprite = this.sprites[i];
			if(!this.showSmokingHoles && sprite.type === "smoking hole") { continue }
			//if(sprite.visible && this.isSpriteInView(sprite)){
			if(sprite.visible ){
				sprite.update(now,this.fps,this.context,this.lastAnimationFrameTime);
			}
		}
	},
	isSpriteInView:function(sprite){
		return sprite.left + sprite.width > sprite.hOffset &&
		sprite.left < sprite.hOffset + this.canvas.width;
	},
	
	drawSprites:function(){
		var sprite;
		//console.log("drawSprites");
		for(var i= 0;i< this.sprites.length;++i){
			sprite = this.sprites[i];
			if(!this.showSmokingHoles && sprite.type === "smoking hole") { continue }
			if(sprite.visible ){
				this.context.translate(-sprite.hOffset,0);
				//console.log("drawSprites");
				sprite.draw(this.context);
				this.context.translate(sprite.hOffset,0);
			}
		}
	},
	createSprites:function(){
		this.createPlatformSprites();
		this.createBatSprites();
		this.createBeeSprites();
		this.createButtonSprites();
		this.createCoinSprites();
		this.createRunnerSprite();
		this.createRubySprites();
		//this.createSapphireSprites();
		this.createSnailSprites();
		this.createSmokingHoles();
		this.addSpritesToSpriteArray();
		this.initializeSprites();
		
		//this.addSpritesToSpriteArray();
	},
	createSmokingHoles:function(){
		var data;
		var smokingHole;
		var SMOKE_BUBBLE_COUNT = 20;
		var FIRE_PARTICLE_COUNT = 5;
		var SMOKING_HOLE_WIDTH = 20;
		
		for(var i = 0;i<this.smokingHoleData.length;++i){
			data = this.smokingHoleData[i];
			smokingHole = new SmokingHole(SMOKE_BUBBLE_COUNT,
			FIRE_PARTICLE_COUNT,data.left,data.top,SMOKING_HOLE_WIDTH
			);
			
			this.smokingHoles.push(smokingHole);
		}
	},
	createBatSprites:function(){
		var bat;
		var BAT_FLAP_DURATION = 200;
		var BAT_FLAP_INIERVAL = 50;
		
		explodeBehavior = new CellSwitchBehavior(
			this.explosionCells,
			this.BAD_GUYS_EXPLOSION_DURATION,
			function(sprite,now,fps,lastAnimationFrameTime){
				return sprite.exploding;
			},
			function(sprite,animator){
				sprite.exploding = false;
			}
		);
		
		//循环创建bat对象
		for(var i= 0;i<this.batData.length;++i){
			bat = new Sprite('bat',
			new SpriteSheetArtist(this.spritesheet,this.batCells), [new CycleBehavior(BAT_FLAP_DURATION, BAT_FLAP_INIERVAL),explodeBehavior]);
			bat.width = this.batCells[1].width;
			bat.height = this.BAT_CELLS_HEIGHT;
			
			bat.collisionMargin = {
				left:8,top:11,right:4,bottom:8
			};
			
			this.bats.push(bat);
			
		}
	},
	createBeeSprites:function(){
		var bee;
		var BEE_FLAP_DURATION = 200;
		var BEE_FLAP_INIERVAL = 50;
		
		explodeBehavior = new CellSwitchBehavior(
			this.explosionCells,
			this.BAD_GUYS_EXPLOSION_DURATION,
			function(sprite,now,fps,lastAnimationFrameTime){
				return sprite.exploding;
			},
			function(sprite,animator){
				sprite.exploding = false;
			}
		);
		
		//循环创建bee对象
		for(var i= 0;i<this.beeData.length;++i){
			bee = new Sprite('bee',
			new SpriteSheetArtist(this.spritesheet,this.beeCells), [new CycleBehavior(BEE_FLAP_DURATION, BEE_FLAP_INIERVAL),explodeBehavior]);
			bee.width = this.beeCells[1].width;
			bee.height = this.BEE_CELLS_HEIGHT;
			
			bee.collisionMargin = {
				left:16,top:11,right:6,bottom:18
			};
			
			this.bees.push(bee);
			
		}
	},
	createPlatformSprites:function(){
		var sprite;
		var pd;
		var PULSE_DURATION = 800;
		var PULSE_THRESHOLD = 0.1;
		
		for(var i = 0;i<this.platformData.length;++i){
			pd = this.platformData[i];
			sprite = new Sprite('platform',this.platformArtist);
			
			sprite.left = pd.left;
			sprite.width = pd.width;
			sprite.height = pd.height;
			sprite.fillStyle = pd.fillStyle;
			sprite.opacity = pd.opacity;
			sprite.track = pd.track;
			sprite.button = pd.button;
			sprite.pulsate = pd.pulsate;
			
			sprite.top = this.calculatePlatformTop(pd.track);
			sprite.collisionMargin = {
				left:0,top:0,right:0,bottom:0
			};
			if(sprite.pulsate){
				sprite.behaviors = [new PulseBehavior(PULSE_DURATION,PULSE_THRESHOLD)];
				
			}
			this.platforms.push(sprite);
		}
	},
	createButtonSprites:function(){
		var button;
		for(var i= 0;i < this.buttonData.length;++i){
			if(i != this.buttonData.length -1){
				button = new Sprite('button',
				new SpriteSheetArtist(this.spritesheet,this.blueButtonCells),
				[this.paceBehavior,this.blueButtonDetonateBehavior]
				);
			}else{
				button = new Sprite('button',
				new SpriteSheetArtist(this.spritesheet,this.goldButtonCells),
				[this.paceBehavior,this.goldButtonDetonateBehavior]	
				);
			}
		
			button.width = this.BUTTON_CELLS_WIDTH;
			button.height = this.BUTTON_CELLS_HEIGHT;
			button.velocityX = this.BUTTON_PACE_VELOCITY;
			
			this.buttons.push(button);
		}
	},
	createRubySprites:function(){
		var RUBY_SPARKLE_DURATION = 100;
		var RUBY_SPARKLE_INTERVAL = 500;
		var ruby;
		var rubyArtist = new SpriteSheetArtist(this.spritesheet,this.rubyCells);
		
		for(var i = 0;i<this.rubyData.length;++i){
			ruby = new Sprite('ruby',rubyArtist,
			[new CycleBehavior(RUBY_SPARKLE_DURATION,RUBY_SPARKLE_INTERVAL)]);
			ruby.width = this.RUBY_CELLS_WIDTH;
			ruby.height = this.RUBY_CELLS_HEIGHT;
			this.rubies.push(ruby);
		}
	},
	createCoinSprites:function(){
		var BLUE_THROB_DURATION = 100;
		var GOLD_THROB_DURATION = 500;
		var BOUNCE_DURATION = 1000;
		var BOUNCE_HEIGHT = 50;
		
		var coin;
		
		for(var i= 0;i<this.coinData.length;++i){
			if(i%2 === 0){
				coin = new Sprite('coin',
				new SpriteSheetArtist(this.spritesheet,this.goldCoinCells),
				[new BounceBehavior(BOUNCE_DURATION+BOUNCE_DURATION*Math.random(),BOUNCE_HEIGHT+BOUNCE_HEIGHT*Math.random()),
				new CycleBehavior(GOLD_THROB_DURATION)]
				);
			}else{
				coin = new Sprite('coin',
				new SpriteSheetArtist(this.spritesheet,this.blueCoinCells),
				[new BounceBehavior(BOUNCE_DURATION+BOUNCE_DURATION*Math.random(),BOUNCE_HEIGHT+BOUNCE_HEIGHT*Math.random()),
				new CycleBehavior(BLUE_THROB_DURATION)]
				);
			}
			coin.width = this.COIN_CELLS_WIDTH;
			coin.height = this.COIN_CELLS_HEIGHT;
			coin.value = 50;
			
			this.coins.push(coin);
		}
	},
	createSnailSprites: function() {
		var snail, snailArtist = new SpriteSheetArtist(this.spritesheet, this.snailCells),
			SNAIL_CYCLE_DURATION = 1000,
			SNAIL_CYCLE_INTERVAL = 1500;
		for(var i = 0; i < this.snailData.length; ++i) {
			snail = new Sprite("snail", snailArtist, [this.paceBehavior, this.snailShootBehavior, new CycleBehavior(SNAIL_CYCLE_DURATION, SNAIL_CYCLE_INTERVAL)]);
			snail.width = this.SNAIL_CELLS_WIDTH;
			snail.height = this.SNAIL_CELLS_HEIGHT;
			snail.velocityX = snailBait.SNAIL_PACE_VELOCITY;
			this.snails.push(snail);
		}
	},
	createRunnerSprite:function(){
		var RUNNER_LEFT = 50;
		var RUNNER_HEIGHT  = 53;
		var STARTING_RUNNER_TRACK = 0;
		var STARTING_RUN_ANIMATION_RATE = this.RUN_ANIMATION_RATE;
		//,this.jumpBehavior,this.collideBehavior,this.runnerExplodeBehavior
		this.runner = new Sprite('runner',
		new SpriteSheetArtist(this.spritesheet,this.runnerCellsRight),
		[this.runBehavior,this.jumpBehavior,this.collideBehavior, this.fallBehavior,this.runnerExplodeBehavior,this.runnerShootBehavior]
		);
	
		this.runner.runAnimationRate = STARTING_RUN_ANIMATION_RATE;
		this.runner.track = STARTING_RUNNER_TRACK;
		this.runner.left = RUNNER_LEFT;
		
		this.runner.width = this.RUNNER_CELLS_WIDTH;
		this.runner.height = this.RUNNER_CELLS_HEIGHT;
		
		this.putSpriteOnTrack(this.runner,STARTING_RUNNER_TRACK);
		
		this.runner.collisionMargin = {
			left:15,
			top:8,
			right:15,
			bottom:8
		};
		this.sprites.push(this.runner);
	},
	putSpriteOnTrack: function(c, b) {
		var a = 2;
		c.track = b;
		c.top = this.calculatePlatformTop(c.track) - c.height - a
	},
	addSpritesToSpriteArray: function() { 
		for(var a = 0; a < this.smokingHoles.length; ++a) 
		{ 
			snailBait.sprites.push(snailBait.smokingHoles[a]) 
		}
		for(var a = 0; a < this.platforms.length; ++a) 
		{ 
			this.sprites.push(this.platforms[a]) 
		} 
		for(var a = 0; a < this.bats.length; ++a)
		{
			this.sprites.push(this.bats[a]) 
		}
		for(var a = 0; a < this.bees.length; ++a) 
		{
			this.sprites.push(this.bees[a]) 
		} 
		for(var a = 0; a < this.buttons.length; ++a)
		{ 
			this.sprites.push(this.buttons[a]) 
		}
		for(var a = 0; a < this.coins.length; ++a)
		{ 
			this.sprites.push(this.coins[a])
		} 
		for(var a = 0; a < this.rubies.length; ++a) 
		{ 
			this.sprites.push(this.rubies[a]) 
		}
//		for(var a = 0; a < this.sapphires.length; ++a) {
//			this.sprites.push(this.sapphires[a]) 
//		}
		for(var a = 0; a < this.snails.length; ++a) 
		{ 
			this.sprites.push(this.snails[a]) 
		} 
		//this.sprites.push(this.runner) 
	},
	initializeSprites:function(){
		this.positionSprites(this.bats,this.batData);
		this.positionSprites(this.bees,this.beeData);
		this.positionSprites(this.buttons,this.buttonData);
		this.positionSprites(this.coins,this.coinData);
		this.positionSprites(this.rubies,this.rubyData);
//		this.positionSprites(this.sapphires,this.sapphireData);
		this.positionSprites(this.snails,this.snailData);
		
		this.setSpriteValues();
		
		this.armSnails();
		
		this.equipRunner();
	},
	equipRunner:function(){
		this.armRunner();
		this.equipRunnerForJumping();
		this.equipRunnerForFalling();
	},
	equipRunnerForJumping:function(){
		var INITIAL_TRACK = 0;
		
		this.runner.JUMP_HEIGHT = 120;
		this.runner.JUMP_DURATION = 1400;
		
		this.runner.jumping = false;
		this.runner.track = INITIAL_TRACK;
		//上升
		//this.runner.ascendTimer = new Stopwatch();
		//下降
		//this.runner.descendTimer = new Stopwatch();
		
		
		this.runner.ascendTimer = new AnimationTimer(this.runner.JUMP_DURATION / 2, AnimationTimer.makeEaseOutEasingFunction(1.15));
		this.runner.descendTimer = new AnimationTimer(this.runner.JUMP_DURATION / 2, AnimationTimer.makeEaseInEasingFunction(1.15));
		
		
		this.runner.jump = function(){
			//nb，膜拜中
			if(this.jumping){
				return;
			}
			this.jumping = true;
			
			this.runAnimationRate = 0;
			this.verticalLaunchPosition = this.top;
			this.ascendTimer.start(snailBait.timeSystem.calculateGameTime());
			//console.log(snailBait.timeSystem.calculateGameTime());
			//console.log(+new Date());
		};
		this.runner.stopJumping = function(){
			this.ascendTimer.stop(snailBait.timeSystem.calculateGameTime());
			this.descendTimer.stop(snailBait.timeSystem.calculateGameTime());
			this.runAnimationRate = snailBait.RUN_ANIMATION_RATE;
			this.jumping = false;
		}
	},
	//
	equipRunnerForFalling: function() {
		this.runner.fallTimer = new AnimationTimer();
		this.runner.falling = false;
		this.runner.fall = function(a) {
			this.falling = true;
			this.velocityY = a || 0;
			this.initialVelocityY = a || 0;
			this.fallTimer.start(snailBait.timeSystem.calculateGameTime())
		};
		this.runner.stopFalling = function() {
			this.falling = false;
			this.velocityY = 0;
			this.fallTimer.stop(snailBait.timeSystem.calculateGameTime())
		}
	},
	positionSprites:function(sprites,spriteData){
		var sprite;
		//console.log(sprites.length);
		for(var i = 0;i<sprites.length;++i){
			//console.log(i);
			sprite = sprites[i];
			if(spriteData[i].platformIndex){
				this.putSpriteOnPlatform(sprite,this.platforms[spriteData[i].platformIndex]);
			}else{
				sprite.top = spriteData[i].top;
				sprite.left = spriteData[i].left;
			}
		}
		
	},
	putSpriteOnPlatform:function(sprite,platformSprite){
		//console.log(platformSprite);
		sprite.top = platformSprite.top - sprite.height;
		sprite.left = platformSprite.left;
		sprite.platform = platformSprite;
		
	},
	armSnails: function() {
		var snail, snailBomArtist = new SpriteSheetArtist(this.spritesheet, this.snailBombCells);
		for(var i = 0; i < this.snails.length; ++i) {
			snail = this.snails[i];
			snail.bomb = new Sprite("snail bomb", snailBomArtist, [this.snailBombMoveBehavior]);
			snail.bomb.width = snailBait.SNAIL_BOMB_CELLS_WIDTH;
			snail.bomb.height = snailBait.SNAIL_BOMB_CELLS_HEIGHT;
			snail.bomb.top = snail.top + snail.bomb.height / 2;
			snail.bomb.left = snail.left + snail.bomb.width / 2;
			snail.bomb.visible = false;
			snail.bomb.snail = snail;
			this.sprites.push(snail.bomb)
		}
	},
	armRunner: function() {
		var RUNNER_BOM_NUM = 5;
		var runner, runnerBomArtist = new SpriteSheetArtist(this.spritesheet, this.snailBombCells);
		runner = this.runner;
		runner.bombs = [];
		for(var i = 0; i < RUNNER_BOM_NUM; ++i) {
			
			runner.bombs[i] = new Sprite("runner bomb", runnerBomArtist, [this.runnerBombMoveBehavior,this.collideBehavior]);
			runner.bombs[i].width = snailBait.SNAIL_BOMB_CELLS_WIDTH;
			runner.bombs[i].height = snailBait.SNAIL_BOMB_CELLS_HEIGHT;
			runner.bombs[i].top = runner.top + runner.bombs[i].height / 2 ;
			runner.bombs[i].left = runner.left + runner.bombs[i].width / 2 + runner.width ;
			runner.bombs[i].visible = false;
			runner.bombs[i].isShoot = false;
			runner.bombs[i].runner = runner;
			this.sprites.push(runner.bombs[i]);
		}		
	},
	turnLeft:function(){
		this.bgVelocity = -this.BACKGROUND_VELOCITY;
		this.runner.runAnimationRate = this.RUN_ANIMATION_RATE;
		this.runner.artist.cells = this.runnerCellsLeft;

		this.runner.direction = snailBait.LEFT;
	},
	turnRight:function(){
		this.bgVelocity = this.BACKGROUND_VELOCITY;
		this.runner.runAnimationRate = this.RUN_ANIMATION_RATE;
		this.runner.artist.cells = this.runnerCellsRight;
		this.runner.direction = snailBait.RIGHT;
	},
	platformUnderneath: function(d, b) {
		var a, f, e = d.calculateCollisionRectangle(),
			g;
		
		if(b === undefined) {
			b = d.track
		}
		
		//console.log(b);
		//找到当前sprite所在的平台引用
		for(var c = 0; c < snailBait.platforms.length; ++c) {
			a = snailBait.platforms[c];
			g = a.calculateCollisionRectangle();
			//console.log(d.left +"|"+ d.hOffset  +"|"+  d.width  +"|"+  d.collisionMargin.right);
			//console.log(e.right);
			//console.log(snailBait.platforms[0].calculateCollisionRectangle().left+"||"+e.right);
//			if(e.left < g.right){
//				console.log(e.left < g.right);
//			}
			
			if(b === a.track) { 
				
				if(e.right > g.left && e.left < g.right){ 
					//console.log(g.left);
					f = a; 
					break
				} 
			}
		}
		//console.log(f);
		return f
	},
	setTimeRate:function(rate){
		this.timeRate = rate;
		this.timeSystem.setTransducer(function(now){
			return now * snailBait.timeRate;
		});
	},
	explode: function(a) {
		if(!a.exploding) {
			if(a.runAnimationRate === 0) {
				a.runAnimationRate = this.RUN_ANIMATION_RATE 
			} 
			a.exploding = true;
			//console.log("小人爆炸");
			//console.log(a.exploding);
			this.playSound(this.explosionSound);
		}
	},
	shake:function(){
		var NUM_SHAKES = 5
		var SHACK_INTERVAL = 80;
		var v = snailBait.BACKGROUND_VELOCITY * 1.5;
		var originalVelocity = snailBait.bgVelocity;
		var i = 0;
		//this.bgVelocity = - v;
		var a;
		
			a = function(){
				snailBait.bgVelocity = i % 2 ? v : -v;
				if(i > NUM_SHAKES ){
					snailBait.bgVelocity = originalVelocity;
					return;
				}else{
					i++;
				setTimeout(a,SHACK_INTERVAL);
				}
				

			}
		a();
		//console.log(originalVelocity);
		//console.log(snailBait.bgVelocity);
	},
	loseLife:function(){
		var transitionDuration = 3000;
		
		this.lives--;
		
		this.updateLivesElement();
		//console.log(this.runner.exploding);
		if(this.runner.exploding){
			this.startLifeTransition(snailBait.RUNNER_EXPLOSION_DURATION);
			transitionDuration += snailBait.RUNNER_EXPLOSION_DURATION;
		}else{
			this.startLifeTransition();
			//transitionDuration += snailBait.RUNNER_EXPLOSION_DURATION;
		}
		
		setTimeout(function(){
			snailBait.endLifeTransition();
		},transitionDuration);
	},
	startLifeTransition:function(delay){
		var CANVAS_TRANSITION_OPACITY = 0.05;
		var SLOW_MOTION_RATE = 0.1;
		
		if(delay === undefined){
			delay = 0;
		}
		
		this.canvas.style.opacity = CANVAS_TRANSITION_OPACITY;
		this.playing = false;
		
		setTimeout(function(){
			snailBait.setTimeRate(SLOW_MOTION_RATE);
			snailBait.runner.visible = false;
		},delay);
	},
	endLifeTransition:function(){
		var TIME_RESET_DELAY = 1000;
		var RUN_DELAY = 500;
		this.canvas.style.opacity = this.OPAQUE;
		
		if(this.lives === 0){
			this.gameOver();
			//this.restartGame();
		}else{
			this.restartLevel();
		}
		
		setTimeout(function(){
			snailBait.setTimeRate(1.0);
			setTimeout(function(){
				snailBait.runner.runAnimationRate = 0;
			},RUN_DELAY);
			
		},TIME_RESET_DELAY);
	},
	gameOver: function() {
		this.livesElement.style.opacity = 0.2;
		this.scoreElement.style.opacity = 0.2;
		this.fpsElement.style.opacity = 0.2;
		this.instructionsElement.style.opacity = 0.2;
		this.soundAndMusicElement.style.opacity = 0.2;
		this.revealCredits();
		this.bgVelocity = this.BACKGROUND_VELOCITY / 20;
		this.playing = false;//禁止输入
		//if(this.developerBackdoorVisible) { this.hideDeveloperBackdoor() }
		//if(this.serverAvailable) { this.checkHighScores() } else { this.revealCredits() }
	},
	restartGame: function() {
		this.hideCredits();
		this.resetScore();
		this.resetLives();
		this.revealTopChrome();
		this.dimControls();
		this.restartLevel()
	},
	resetScore: function() {
		this.score = 0;
		this.updateScoreElement()
	},
	resetLives: function() {
		this.lives = this.MAX_NUMBER_OF_LIVES;
		this.updateLivesElement()
	},
	restartLevel: function() {
		this.resetOffsets();
		this.resetRunner();
		this.makeAllSpritesVisible();
		this.playing = true
	},
	resetOffsets: function() {
		this.bgVelocity = 0;
		this.backgroundOffset = 0;
		this.platformOffset = 0;
		this.spriteOffset = 0
	},
	resetRunner: function() {
		this.runner.left = snailBait.RUNNER_LEFT;
		this.runner.track = 3;
		this.runner.hOffset = 0;
		this.runner.visible = true;
		this.runner.exploding = false;
		this.runner.jumping = false;
		this.runner.falling = false;
		this.runner.top = this.calculatePlatformTop(3) - this.runner.height;
		this.runner.artist.cells = this.runnerCellsRight;
		this.runner.artist.cellIndex = 0
	},
	makeAllSpritesVisible: function() {
		for(var a = 0; a < this.sprites.length; ++a)
		{ 
			this.sprites[a].visible = true 
		} 
	},
	setSpriteValues:function(){
		var sprite;
		var COIN_VALUE = 100;
		var SAPPHIRE_VALUE = 500;
		var RUBY_VALUE = 1000;
		
		for(var i = 0;i<this.sprites.length;i++){
			sprite = this.sprites[i];
			
			if(sprite.type === 'coin'){
				sprite.value = COIN_VALUE;
			}
			else if(sprite.type === 'ruby'){
				sprite.value = RUBY_VALUE;
			}else if(sprite.type === 'sapphire'){
				sprite.value = SAPPHIRE_VALUE;
			}
		}
	},
	updateScoreElement:function(){
		this.scoreElement.innerHTML = this.score;
	},
	
	updateLivesElement:function(){
		var Liveimgs = this.livesElement.getElementsByTagName('img');
		for(var i = 0;i<Liveimgs.length;i++){
			if(this.lives > i){
				Liveimgs[i].style.opacity = snailBait.OPAQUE;
			}else{
				Liveimgs[i].style.opacity = snailBait.TRANSPARENT;
			}
		}
	},
	gameToast:function(str,duration){
		var body = document.getElementsByTagName('body')[0];
		var node=document.createElement("div"); //创建一个li节点
        node.className = "snailbait-toast";
        node.innerHTML = str;
        body.appendChild(node);
        console.log(str);
        var toast = document.getElementsByClassName('snailbait-toast');
        setTimeout(function(){
        	for(var i = 0;i<toast.length;++i){
        		toast[i].style.opacity = "0";
        		(function(i){
        			setTimeout(function(){
        			body.removeChild(toast[i]);
        		},1000);
        		})(i)
        	}
        },duration);
	},
	revealWinningAnimation:function(){
		var WINNING_ANIMATION_FADE_TIME = 5000;
		var SEMI_TRANSPARENT = 0.25;
		
		this.bgVelocity = 0;
		this.playing = false;
		this.loadingTitleElement.style.display = 'none';
		
		this.fadeInElements(this.loadingAnimatedGIFElement,this.loadingElement);
		
		this.scoreElement.innerHTML = "Winner！";
		this.canvas.style.opacity = SEMI_TRANSPARENT;
		
		setTimeout(function(){
			snailBait.loadingAnimatedGIFElement.style.display = 'none';
			snailBait.fadeInElements(snailBait.canvas);
			snailBait.gameOver();
		},WINNING_ANIMATION_FADE_TIME);
		
	},
	revealDeveloperBackdoor:function(){
		this.fadeInElements(this.developerBackdoorElement,this.rulerCanvas);
		this.updateDeveloperBackdoorCheckboxes();
		this.canvas.style.cursor = 'move';
		this.developerBackdoorVisible = true;
	},
	hideDeveloperBackdoor:function(){
		var DEVELOPER_BACKDOOR_FADE_DURATION = 1000;
		this.fadeOutElements(this.developerBackdoorElement,this.rulerCanvas,DEVELOPER_BACKDOOR_FADE_DURATION);
		this.canvas.style.cursor = 'default';
		this.developerBackdoorVisible = false;
		//document.onmousemove = null;
		//document.onmouseup = null;
	},
	updateDeveloperBackdoorCheckboxes: function() { 
		//this.detectRunningSlowlyCheckboxElement.checked = this.showSlowWarning;
		this.smokingHolesCheckboxElement.checked = this.showSmokingHoles;
	},
	InitDeveloperBackdoor:function(){
		this.ifBool = false;
		this.sliderDisX = 0;
		var percent = 1;
		//console.log(this == snailBait);
		snailBait.slider1.onmousedown = function(e) {
			var e = e || window.event;
			//防止选中元素
			e.preventDefault();
			//获取按下鼠标到div left  top的距离
			//console.log(e.target == snailBait.slider1);
			if(e.target == snailBait.slider1){
				snailBait.sliderDisX = e.clientX -this.offsetLeft - 10;
				//var disY = e.clientY - this.offsetTop;
				snailBait.ifBool = true;
				//console.log(e.clientX);
				//console.log(this.offsetLeft);
				//添加鼠标按下事件
			}
		};
		snailBait.canvas.addEventListener('mousedown',function(e){
			if(snailBait.developerBackdoorVisible){
				snailBait.startDraggingGameCanvas(e);
			}
		});
		snailBait.canvas.addEventListener('mousemove',function(e){
			if(snailBait.developerBackdoorVisible && snailBait.dragging){
				snailBait.dragGameCanvas(e)
			}
		});
		document.onmousemove = function(e) {
			//console.log(percent);
			//console.log(GetPos(snailBait.cdkslider).x);
			//console.log(snailBait.sliderDisX);
			if(snailBait.ifBool) {
			var e = e || window.event;
			if(e.clientX>snailBait.GetPos(snailBait.cdkslider).x+5 && e.clientX < snailBait.GetPos(snailBait.cdkslider).x + snailBait.cdkslider.offsetWidth+5){
				snailBait.slider1.style.left = e.clientX - snailBait.sliderDisX + "px";
				snailBait.percent = (e.clientX - snailBait.sliderDisX)*2/snailBait.cdkslider.offsetWidth;
				snailBait.timeRate = snailBait.percent;
				snailBait.setTimeRate(snailBait.percent);
				snailBait.timeRateReadout1.innerHTML = snailBait.percent.toString();
				}
			}
		};
		document.onmouseup = function(e) {
			//document.onmousemove = null;
			//document.onmouseup = null;
			snailBait.ifBool = false;
			if(snailBait.developerBackdoorVisible){
				snailBait.stopDraggingGameCanvas();
			}
		};
	},
	//获取标签元素的绝对定位
	GetPos:function(obj) {  
            var pos = new Object();  
            pos.x = obj.offsetLeft;  
            pos.y = obj.offsetTop;  
            while (obj = obj.offsetParent) {  
                pos.x += obj.offsetLeft;  
                pos.y += obj.offsetTop;  
            }  
            return pos;  
   },
   drawRuler:function(){
   		var majorTickSpacing = 50;
   		var minorTickSpacing = 10;
   		var TICK_LINE_WINDTH = 0.5;
   		var TICK_FILL_STYLE = 'blue';
   		var i;
   		
   		this.rulerContext.lineWidth = TICK_LINE_WINDTH;
   		this.rulerContext.fillStyle = TICK_FILL_STYLE;
   		
   		for(i = 0;i<this.BACKGROUND_WIDTH;i += minorTickSpacing){
   			if(i === 0){
   				continue;
   			}
   			
   			if(i % majorTickSpacing === 0){
   				this.drawRulerMajorTick(i);
   			}else{
   				this.drawRulerMinorTick(i);
   			}
   			
   		}
   },
   drawRulerMajorTick:function(i){
   		var MAJOR_TICK_BOTTOM = this.rulerCanvas.height;
   		var MAJOR_TICK_TOP = this.rulerCanvas.height/2 +2;
   		var text = (this.spriteOffset + i).toFixed(0);
   		
   		this.rulerContext.beginPath();
   		this.rulerContext.moveTo(i+0.5,MAJOR_TICK_TOP);
   		this.rulerContext.lineTo(i+0.5,MAJOR_TICK_BOTTOM);
   		
   		this.rulerContext.stroke();
   		this.rulerContext.fillText(text,i-10,10);
   },
   drawRulerMinorTick:function(i){
   		var MAJOR_TICK_BOTTOM = this.rulerCanvas.height;
   		var MAJOR_TICK_TOP = 3*this.rulerCanvas.height/4;
   		
   		this.rulerContext.beginPath();
   		this.rulerContext.moveTo(i+0.5,MAJOR_TICK_TOP);
   		this.rulerContext.lineTo(i+0.5,MAJOR_TICK_BOTTOM);
   		
   		this.rulerContext.stroke();
   },
   eraseRuler:function(){
   		this.rulerContext.clearRect(0,0,this.rulerCanvas.width,this.rulerCanvas.height);
   },
   startDraggingGameCanvas:function(e){
   		this.mousedown = {x:e.clientX,y:e.clientY};
   		this.dragging = true;
   		this.runner.visible = false;
   		
   		this.backgroundOffsetWhenDraggingStarted = this.backgroundOffset;
   		this.spriteOffsetWhenDraggingStartedc = this.spriteOffset;
   		
   		e.preventDefault;
   },
   dragGameCanvas:function(e){
   		var deltaX = e.clientX  - this.mousedown.x;
   		this.backgroundOffset = this.backgroundOffsetWhenDraggingStarted - deltaX;
   		this.spriteOffset = this.spriteOffsetWhenDraggingStartedc - deltaX;
   },
   stopDraggingGameCanvas:function(){
   		this.dragging = false;
   		this.runner.visible = true;
   }
	
};

var Sprite = function(type,artist,behaviors){
	var DEFAULT_WIDTH = 10;
	var DEFAULT_HEIGHT = 10;
	var DEFAULT_OPACITY = 1.0;
	
	this.artist = artist;
	this.type = type;
	this.behaviors = behaviors || [];
	
	this.hOffset = 0;
	this.left = 0;
	this.top = 0;
	this.width = DEFAULT_WIDTH;
	this.height = DEFAULT_HEIGHT;
	this.velocityX = 0;
	this.velocityY = 0;
	this.opacity = DEFAULT_OPACITY;
	this.visible = true;
	this.showCollisionRectangle = false;
	
	this.collisionMargin = {
		left:0,
		right:0,
		top:0,
		bottom:0
	};
};

Sprite.prototype = {
	//运行两次？？
	calculateCollisionRectangle: function() {
		//alert(this.collisionMargin.left);
		//替换left，top，返回计算后的json对象
		return {
			left: this.left - this.hOffset + this.collisionMargin.left,
			right: this.left - this.hOffset + this.width - this.collisionMargin.right,
			top: this.top + this.collisionMargin.top,
			bottom: this.top + this.collisionMargin.top + this.height - this.collisionMargin.bottom,
			centerX: this.left + this.width / 2,
			centerY: this.top + this.height / 2 
		}
	},
	drawCollisionRectangle:function(context){
		var COLLISION_RECTANGLE_COLOR = 'white';
		var COLLISION_RECTANGLE_LIFE_WIDTH = 2.0;
		var r = this.calculateCollisionRectangle();
		context.save();
		context.beginPath();
		context.strokeStyle = COLLISION_RECTANGLE_COLOR;
		context.lineWidth = COLLISION_RECTANGLE_LIFE_WIDTH;
		//hOffset:context水平位移量，这里并没有用到
		//console.log(this.hOffset);
		context.strokeRect(r.left+this.hOffset,r.top,r.right-r.left,r.bottom-r.top);
		//context.strokeRect(this.left + this.collisionMargin.left,r.top,r.right-r.left,r.bottom-r.top);
		context.restore();
	},
	draw:function(context){
		//console.log("Sprite.draw");
		//console.log(this.type.toString()+this.behaviors.length.toString());
		context.save();
		context.globalAlpha = this.opacity;
		if(this.visible && this.artist){
			this.artist.draw(this,context);
		}
		if(this.showCollisionRectangle){
			this.drawCollisionRectangle(context);
		}
		context.restore();
	},
	update:function(now,fps,context,lastAnimationFrameTime){
		//console.log(this.type.toString()+this.behaviors.length.toString());
		for(var i = 0;i < this.behaviors.length;++i){
			this.behaviors[i].execute(this,now,fps,context,lastAnimationFrameTime);
		}
	}
}


SpriteSheetArtist = function(spritesheet, cells) { 
	this.cells = cells;
	this.spritesheet = spritesheet;
	this.cellIndex = 0 ;
};
SpriteSheetArtist.prototype = { 
		draw: function(sprite, context) { 
		//console.log(sprite.type);
		var cell = this.cells[this.cellIndex];
		//console.log(sprite.hOffset);
		context.drawImage(this.spritesheet, cell.left, cell.top, cell.width, cell.height, sprite.left, sprite.top, cell.width, cell.height);
		},
		advance: function() {
			if(this.cellIndex === this.cells.length - 1)
			{
				this.cellIndex = 0 ;
			} else {
				this.cellIndex++ ;
			}
		}
};

Stopwatch = function(){
	this.startTime = 0;
	this.running = false;
	this.elapsed = undefined;
	this.paused = false;
	this.startPause = 0;
	this.totalPausedTime = 0;
}
//原型模式
Stopwatch.prototype = {
	start:function(now){
		
		
		this.startTime = now ? now : +new Date();
		//console.log(this.startTime);
		this.elapsedTime = undefined;
		this.running = true;
		this.totalPausedTime = 0;
		this.startPause = 0;
	},
	stop:function(now){
		
		
		if(this.paused){
			this.unpause();
		}
		
		this.elapsed = (now ? now : +new Date()) - this.startTime - this.totalPausedTime;
		this.running = false;
		
	},
	pause:function(now){
		
		
		this.startPause = now ? now : +new Date();
		this.paused = true;
		
	},
	unpause:function(now){
		
		
		if(!this.pause){
			return;
		}
		
		this.totalPausedTime += (now ? now : +new Date()) - this.startPause;
		this.startPause = 0;
		this.paused = false;
	},
	getElapsedTime:function(now){
		
		
		if(this.running){
			//暂停时无法获取当前停止时间
			return (now ? now : +new Date())-this.startTime-this.totalPausedTime;
			
		}else{
			
			return this.elapsed;
		}
	},
	
	isPaused:function(){
		return this.paused;
	},
	
	isRunning:function(){
		return this.running;
	},
	
	reset:function(now){
		
		
		this.elapsed = 0;
		this.startTime = now ? now : +new Date();
		this.running = false;
		this.totalPausedTime = 0;
		this.startPause = 0;
		
	}
}

var AnimationTimer = function(duration,easingFunction){
	this.easingFunction = easingFunction;
	if(duration !== undefined){
		this.duration = duration;
	}else{
		this.duration = 1000;
	}
	this.stopwatch = new Stopwatch();
}

AnimationTimer.prototype = {
	start:function(now){
		this.stopwatch.start(now);
	},
	stop:function(now){
		this.stopwatch.stop(now);
	},
	pause:function(now){
		this.stopwatch.pause(now);
	},
	unpause:function(now){
		this.stopwatch.unpause(now);
	},
	isPaused:function(){
		return this.stopwatch.isPaused();
	},
	isRunning:function(){
		return this.stopwatch.isRunning();
	},
	reset:function(now){
		this.stopwatch.reset(now);
	},
	isExpired:function(now){
		return this.stopwatch.getElapsedTime(now) > this.duration;
	},
	getElapsedTime:function(now){
		var elapsedTime = this.stopwatch.getElapsedTime(now);
		var percentComplete = elapsedTime / this.duration;
		
		if(this.easingFunction === undefined || percentComplete === 0 || percentComplete > 1) {
			return elapsedTime;
		}
		//等价return this.easingFunction(percentComplete) * this.duration;
		return elapsedTime * (this.easingFunction(percentComplete)/percentComplete);
	},
	getRealElapsedTime:function(now){
		return this.stopwatch.getElapsedTime(now);
	}
	
};

AnimationTimer.makeEaseOutEasingFunction = function(a) 
{ 
	return function(b) {
		return 1 - Math.pow(1 - b, a * 2) 
	}
};
AnimationTimer.makeEaseInEasingFunction = function(a) 
{
	return function(b) {
		return Math.pow(b, a * 2)
	}
};
AnimationTimer.makeEaseOutInEasingFunction = function() 
{ 
	return function(a) {
		//return a + Math.sin(a * 2 * Math.PI) / (2 * Math.PI)
		return a + Math.sin(a * 2 * Math.PI) / (2 * Math.PI)
	} 
};
AnimationTimer.makeEaseInOutEasingFunction = function() {
	return function(a) {
		return a - Math.sin(a * 2 * Math.PI) / (2 * Math.PI) 
	} 
};

var TimeSystem = function(){
	this.transducer = function(elapsedTime){
		return elapsedTime*1 ;
	};
	this.timer = new AnimationTimer();
	this.lastTimeTransducerWasSet = 0;
	this.gameTime = 0;
}

TimeSystem.prototype = {
	start:function(){
		this.timer.start();
	},
	reset:function(){
		this.timer.stop();
		this.timer.reset();
		this.timer.start();
		this.lastTimeTransducerWasSet = this.gameTime;
	},
	setTransducer:function(fn,duration){
		var lastTransducer = this.transducer;
		var self = this;
		
		this.calculateGameTime();
		this.reset();
		this.transducer = fn;
		
		if(duration){
			setTimeout(function(e){
				self.setTransducer(lastTransducer);
			},duration);
		}
	},
	calculateGameTime:function(){
		this.gameTime = this.lastTimeTransducerWasSet + 
		this.transducer(this.timer.getElapsedTime());
		this.reset();
		return this.gameTime;
	}
}


CycleBehavior = function(duration,interval){
	this.duration = duration || 1000;
	this.lastAdvance = 0;
	this.interval = interval;
	
};
CycleBehavior.prototype = {
	execute:function(sprite,now,fps,context,lastAnimationFrameTime){
		if(this.lastAdvance === 0){
			this.lastAdvance = now;
		}
		if(this.interval && sprite.artist.cellIndex === 1){
			if(now - this.lastAdvance > this.interval){
				sprite.artist.advance();
				this.lastAdvance = now;
			}
		}
		else if(now - this.lastAdvance > this.duration){
			sprite.artist.advance();
			this.lastAdvance = now;
			
		}
	}
};

var BounceBehavior = function(duration,height){
	this.duration = duration || 1000;
	this.distance = height * 2 || 100;
	this.bouncing = false;
	
	this.timer = new AnimationTimer(this.duration,AnimationTimer.makeEaseOutInEasingFunction());
	
	this.paused = false;
};

BounceBehavior.prototype = {
	execute:function(sprite,now,fps,context,lastAnimationFrameTime){
		var elapsed;
		var deltaY;
		
		if(!this.bouncing){
			this.startBouncing(sprite);
		}
		else{
			elapsed = this.timer.getElapsedTime();
			//判断是否超过时间
			if(this.timer.isExpired()){
				this.resetTimer();
				return;
			}
			
			this.adjustVerticalPosition(sprite,elapsed);
		}
	},
	startBouncing:function(sprite){
		this.baseline = sprite.top;
		this.bouncing = true;
		this.timer.start();
		
	},
	resetTimer:function(){
		this.timer.stop();
		this.timer.reset();
		this.timer.start();
	},
	adjustVerticalPosition:function(sprite,elapsed){
		var rising = false;
		var delarY = this.timer.getElapsedTime() / this.duration * this.distance;

//		var realElapsedTime = this.timer.getRealElapsedTime();
//		if(realElapsedTime < this.duration/2){
//			rising = true;
//		}
//		
//		if(rising){
//			sprite.top = this.baseline - delarY;
//		}else{
//			sprite.top = this.baseline + delarY;
//		}
		if(elapsed < this.duration/2){
			rising = true;
		}
		
		if(rising){
			sprite.top = this.baseline - delarY;
		}else{
			sprite.top = this.baseline -this.distance + delarY;
		}
	},
	pause:function(sprite){
		if(!this.timer.isPaused()){
			this.timer.pause();			
		}
		this.paused = true;
	},
	unpause:function(sprite){
		if(this.timer.isPaused()){
			this.timer.unpause();
		}
		this.paused = false;
	}
};

var PulseBehavior = function(duration,opacityThreshold){
	this.duration = duration || 1000;
	this.opacityThreshold = opacityThreshold || 0;
	//全局变量AnimationTimer（公有变量）
	this.timer = new AnimationTimer(this.duration,AnimationTimer.makeEaseInOutEasingFunction());
	this.paused = false;
	this.pulsating = false;
}
PulseBehavior.prototype = {
	pause:function(sprite,now){
		if(!this.timer.isPaused()){
			this.timer.pause(now);
		}
		this.paused = true;
	},
	unpause:function(sprite,now){
		if(this.timer.isPaused()){
			this.timer.unpause(now);
		}
		this.paused = false;
	},
	dim:function(sprite,elapsed){
		sprite.opacity = 1-( (1 - this.opacityThreshold) * (parseFloat(elapsed)/this.duration));
	},
	brighten:function(sprite,elapsed){
		sprite.opacity +=  (1 - this.opacityThreshold) * (parseFloat(elapsed)/this.duration);
	},
	startPulsing:function(sprite){
		this.pulsating = true;
		this.timer.start();
	},
	resetTimer:function(){
		this.timer.stop();
		this.timer.reset();
		this.timer.start();
	},
	execute:function(sprite,now,fps,context,lastAnimationFrameTime){
		var elapsed;
		if(!this.pulsating){
			this.startPulsing(sprite);
		}else{
			elapsed = this.timer.getElapsedTime();
			
			if(this.timer.isExpired()){
				this.resetTimer();
				return;
			}
			
			if(elapsed < this.duration/2){
				this.dim(sprite,elapsed);
			}else{
				this.brighten(sprite,elapsed);
			}
		}
		
	}
	
};


var CellSwitchBehavior = function(cells,duration,trigger,callback){
	this.cells = cells;
	this.duration = duration || 1000;
	this.trigger = trigger;
	this.callback = callback;
}
CellSwitchBehavior.prototype = {
	execute:function(sprite,now,fps,context,lastAnimationFrameTime){
		if(this.trigger && this.trigger(sprite,now,fps,lastAnimationFrameTime)){
			if(sprite.artist.cells !== this.cells){
				this.switchCells(sprite,now);
			}else if(now - sprite.switchStartTime > this.duration){
				this.revert(sprite,now);
			}
		}
	},
	switchCells:function(sprite,now){
		sprite.originalCells = sprite.artist.cells;
		sprite.originalIndex = sprite.artist.cellIndex;
		sprite.switchStartTime = now;
		sprite.artist.cells = this.cells;
		sprite.artist.cellIndex = 0;
	},
	revert:function(sprite,now){
		sprite.artist.cells = sprite.originalCells;
		sprite.artist.cellIndex = sprite.originalIndex;
		if(this.callback){
			this.callback(sprite,this);
		}
	}
}

var SmokingHole = function(smokeBubbleCount,fireParticleCount,left,top,width){
	this.fireParticles = [];
	this.smokeBubbles = [];
	this.disguiseAsSprite(left,top,width);
	this.createSmokeBubbles(smokeBubbleCount,left,top);
	this.createFireParticles(fireParticleCount,left,top);
	this.smokeBubbleCursor = 0;
};
SmokingHole.prototype = {
	createSmokeBubbles:function(smokeBubbleCount,left,top){
		var smokeBubble;
		
		for(var i = 0;i<smokeBubbleCount;++i){
			if(i%2=== 0 ){
				smokeBubble = this.createBubbleSprite(
					left + Math.random()*3,
					top - Math.random()*3,
					10,
					Math.random()*8,
					Math.random()*5
				);
			}else{
				smokeBubble = this.createBubbleSprite(
					left + Math.random()*10,
					top + Math.random()*6,
					15,
					Math.random()*8,
					Math.random()*5
				);
			}
			
			this.setInitialSmokeBubbleColor(smokeBubble,i);
			
			if(i<smokeBubbleCount/2){
				smokeBubble.dissipatesSlowly = true;
			}
			
			this.smokeBubbles.push(smokeBubble);
		}
	},
	setInitialSmokeBubbleColor:function(smokeBubble,i){
		var ORANGE = 'rgba(255,104,31,0.8)';
		var YELLOW = 'rgba(255,255,0,0.8)';
		var BLACK = 'rgba(0,0,0,0.5)';
		var WHITE = 'rgba(255,255,255,0.8)';
		
		if(i<=5){
			smokeBubble.fillStyle = ORANGE;
		}else if(i<=(i/2)){
			smokeBubble.fillStyle = YELLOW;
		}else if(i<=15){
			smokeBubble.fillStyle = WHITE;
		}else{
			smokeBubble.fillStyle = 'rgb('+(120-Math.random()*35).toFixed(0)+','+
			(220-Math.random()*35).toFixed(0)+','+(220-Math.random()*35).toFixed(0)+',)';
		}
	},
	createBubbleSprite:function(left,top,radius,velocityX,velocityY){
		var DEFAULT_BUBBLE_LIFETIME = 1500;
		var sprite = new Sprite('smoke bubble',this.createBubbleArtist(),
		[this.createDissipateBubbleBehavior()]);
		this.setBubbleSpriteProperties(sprite,left,top,radius,velocityX,velocityY);
		this.createBubbleSpriteTimer(sprite,DEFAULT_BUBBLE_LIFETIME);
		return sprite;
	},
	setBubbleSpriteProperties:function(sprite,left,top,radius,velocityX,velocityY){
		sprite.left = left;
		sprite.top = top;
		sprite.radius = radius;
		
		sprite.originalLeft = left;
		sprite.originalTop = top;
		sprite.originalRadius = radius;
		
		sprite.velocityX = velocityX;
		sprite.velocityY = velocityY;
		
	},
	createBubbleArtist:function(){
		return {
			draw:function(sprite,context){
				var TWO_PI = Math.PI * 2;
				//console.log(sprite.radius);
				if(sprite.radius >0){
					context.save();
					context.beginPath();
					context.fillStyle = sprite.fillStyle;
					context.arc(sprite.left,sprite.top,sprite.radius,0,TWO_PI,false);
					context.fill();
					context.restore();
				}
			}
		};
	},
	createBubbleSpriteTimer:function(sprite,bubbleLifetime){
		sprite.timer = new AnimationTimer(bubbleLifetime,AnimationTimer.makeEaseOutEasingFunction(1.5));
		
		sprite.pause = function(now){
			this.timer.pause(now);
		};
		
		sprite.unpause = function(now){
			this.timer.unpause(now);
		};
	},
	createFireParticles:function(fireParticleCount,left,top){
		var radius;
		var offset;
		
		for(var i = 0;i<fireParticleCount;++i){
			radius = Math.random() * 1.5;
			offset1 = (Math.floor(Math.random()*10)%2==0?-1:1)*Math.random() * (radius * 2);
			offset2 = (Math.floor(Math.random()*10)%2==0?-1:1)*Math.random() * (radius * 2);
			//console.log(offset);
			if(i % 2 === 0){
				var fireParticle = this.createFireParticle(left + offset1,top + offset2,radius);
				
			}else{
				var fireParticle = this.createFireParticle(left + offset1,top + offset2,radius);
			}
			this.fireParticles.push(fireParticle);
		}
	},
	createFireParticle:function(left,top,radius){
		var sprite = new Sprite('fire particle',this.createFireParticleArtist(left,top,radius));
		sprite.left = left;
		sprite.top = top;
		sprite.radius = radius;
		sprite.visible = true;
		
		return sprite;
	},
	createFireParticleArtist:function(left,top,radius){
		var YELLOW_PREAMBLE = 'rgba(255,255,0,';
		return {
			draw:function(sprite,context){
				context.save();
				context.fillStyle = YELLOW_PREAMBLE + Math.random().toFixed(2)+');';
				context.beginPath();
				context.arc(sprite.left,sprite.top,sprite.radius*6.5,0,Math.PI*2,false);
				context.fill();
				context.restore();
			}
		};
	},
	disguiseAsSprite:function(left,top,width){
		this.addSpriteProperties(left,top,width);
		this.addSpriteMethods();
		this.addBehaviors();
	},
	addSpriteProperties:function(left,top,width){
		this.left = left;
		this.top = top;
		this.type = "smoking hole";
		this.width = width;
		this.height = width;
		this.visible = true;
	},
	addSpriteMethods:function(){
		this.draw = function(context){
			this.drawFireParticles(context);
			this.drawSmokeBubbles(context);
		};
		this.update = function(now,fps,context,lastAnimationFrameTime){
			this.updateSmokeBubbles(now,fps,context,lastAnimationFrameTime);
			for(var i = 0;i<this.behaviors.length;++i){
				this.behaviors[i].execute(this,now,fps,context,lastAnimationFrameTime);
			}
		};
	},
	drawSmokeBubbles:function(context){
		for(var i = 0;i<this.smokeBubbles.length;++i){
			this.smokeBubbles[i].draw(context);
		}
	},
	updateSmokeBubbles:function(now,fps,context,lastAnimationFrameTime){
		for(var i = 0;i<this.smokeBubbles.length;++i){
			this.smokeBubbles[i].update(now,fps,context,lastAnimationFrameTime);
		}
	},
	drawFireParticles:function(context){
		
		for(var i = 0;i<this.fireParticles.length;++i){
			this.fireParticles[i].draw(context);
			//console.log(this.fireParticles[i].type);
		}
	},
	addBehaviors:function(){
		this.behaviors = [{
			pause:function(sprite,now){
				for(var i = 0;i<sprite.smokeBubbles.length;++i){
					sprite.smokeBubbles[i].pause(now);
				}
			},
			unpause:function(sprite,now){
				for(var i = 0;i<sprite.smokeBubbles.length;++i){
					sprite.smokeBubbles[i].unpause(now);
				}
			},
			execute:function(sprite,now,fps,context,lastAnimationFrameTime){
				if(sprite.hasMoreSmokeBubbles()){
					sprite.emitSmokeBubble();
					sprite.advanceCursor();
				}
			}
		}];
	},
	hasMoreSmokeBubbles:function(){
		return this.smokeBubbleCursor !== this.smokeBubbles.length -1;
	},
	emitSmokeBubble:function(){
		this.smokeBubbles[this.smokeBubbleCursor].visible = true;
	},
	advanceCursor:function(){
		if(this.smokeBubbleCursor <= this.smokeBubbles.length-1){
			++ this.smokeBubbleCursor;
		}else{
			this.smokeBubbleCursor = 0;
		}
	},
	createDissipateBubbleBehavior:function(){
		return {
			FULLY_OPAQUE:1.0,
			BUBBLE_EXPANSION_RATE:30,
			BUBBLE_SLOW_EXPANSION_RATE:15,
			BUBBLE_X_SPEED_FACTOR:40,
			BUBBLE_Y_SPEED_FACTOR:100,
			execute:function(sprite,now,fps,context,lastAnimationFrameTime){
				if(!sprite.timer.isRunning()){
					sprite.timer.start(now);
				}else if(!sprite.timer.isExpired(now)){
					this.dissipateBubble(sprite,now,fps,lastAnimationFrameTime);
				}else{
					sprite.timer.reset();
					this.resetBubble(sprite,now);
				}
			},
			dissipateBubble:function(sprite,now,fps,lastAnimationFrameTime){
				var elapsedTimer = sprite.timer.getElapsedTime(now);
				var velocityFactor = (now-lastAnimationFrameTime)/1000;
				sprite.left += sprite.velocityX *  velocityFactor;
				sprite.top -= sprite.velocityY * velocityFactor;
				
				sprite.opacity = this.FULLY_OPAQUE - elapsedTimer/sprite.timer.duration;
				
				if(sprite.dissipatesSlowly){
					sprite.radius += this.BUBBLE_SLOW_EXPANSION_RATE * velocityFactor;
				}else{
					sprite.radius += this.BUBBLE_EXPANSION_RATE * velocityFactor;
				}
				
			},
			resetBubble:function(sprite,now){
				sprite.opacity = this.FULLY_OPAQUE;
				sprite.left = sprite.originalLeft;
				sprite.top = sprite.originalTop;
				sprite.radius = sprite.originalRadius;
				
				sprite.velocityX = Math.random()*this.BUBBLE_X_SPEED_FACTOR;
				
				sprite.velocityY = Math.random()*this.BUBBLE_Y_SPEED_FACTOR;
				
				sprite.opacity = 0;
			}
		};
	},
};


//必须小写snailBait
var snailBait = new SnailBait();
snailBait.createSprites();
snailBait.createAudioChannels();
//alert(snailBait.sprites[4].left);
snailBait.initializeImages();

snailBait.playAgainLink.addEventListener('click',function(e){
	snailBait.restartGame();
});
//
snailBait.musicCheckboxElement.addEventListener('change',function(e){
	//每次都检查
	snailBait.musicOn = snailBait.musicCheckboxElement.checked;
	
	if(snailBait.musicOn){
		snailBait.musicElement.play();
	}else{
		snailBait.musicElement.pause();
	}
	
});
snailBait.soundCheckboxElement.addEventListener('change',function(e){
	//每次都检查
	snailBait.soundOn = snailBait.soundCheckboxElement.checked;
	
//	if(snailBait.musicOn){
//		snailBait.musicElement.play();
//	}else{
//		snailBait.musicElement.pause();
//	}
	
});

window.addEventListener('keydown', function(e) {
	var key = e.keyCode;
	
	if(! snailBait.playing || snailBait.runner.exploding){
		return;
	}
	
	if(key === 90 && e.ctrlKey){//ctrl + z
		if(!snailBait.developerBackdoorVisible){
			snailBait.revealDeveloperBackdoor();
			snailBait.InitDeveloperBackdoor();
		}else{
			snailBait.hideDeveloperBackdoor();
		}
		//避免触发其他行为
		return;
	}
	
	if(key === 68 || key === 37) {
		snailBait.turnLeft();
	} else if(key === 75 || key === 39) {
		snailBait.turnRight();
	} else if(key === 80) {
		snailBait.togglePaused();
	}else if(key === 84) {
		snailBait.gameToast("cdk",3000);
	}
	else if(key === 70) {
		snailBait.isShoot = true;
	}
	if(key === 74){
		snailBait.runner.jump();
	}
});

snailBait.collisionRectanglesCheckboxElement.addEventListener('change',function(e){
	var show = snailBait.collisionRectanglesCheckboxElement.checked;
	for(var i = 0;i<snailBait.sprites.length;++i){
		snailBait.sprites[i].showCollisionRectangle = show;
	}
});
snailBait.smokingHolesCheckboxElement.addEventListener('change',function(e){
	snailBait.showSmokingHoles = snailBait.smokingHolesCheckboxElement.checked;
});

window.addEventListener('blur', function(e) {
	snailBait.windowHasFocus = false;
	if(!snailBait.paused) {
		snailBait.togglePaused();
	}
});
//window.addEventListener('focus',function(){
//	if(snailBait.paused){
//		snailBait.togglePaused();
//	}
//});
//window.addEventListener('blur',function(e){
//	if(!snailBait.paused){
//		snailBait.togglePaused();
//	}
//})
window.addEventListener('focus', function(e) {
	var originalFont = snailBait.toast.style.fontSize;
	snailBait.windowHasFocus = true;
	var DIGIT_DISPLAY_DUARTION = 1000;
	var takeAction = function() {
		return snailBait.windowHasFocus && snailBait.countdownInProgress;
	}
		if(!snailBait.playing){
			snailBait.togglePaused();
		}
	if(snailBait.paused) {
		snailBait.countdownInProgress = true;
		snailBait.toast.style.font = "128px fantasy";
		if(takeAction()) {

			snailBait.revealToast('3', 1000);
			setTimeout(function(e) {
				if(takeAction()) {
					snailBait.revealToast('2', 1000);
				}
				setTimeout(function(e) {
					if(takeAction()) {
						snailBait.revealToast('1', 1000);
					}
					setTimeout(function(e) {
						if(takeAction()) {
							snailBait.togglePaused();
							snailBait.toast.style.fontSize = originalFont;
						}
						snailBait.countdownInProgress = false;
					}, DIGIT_DISPLAY_DUARTION);
				}, DIGIT_DISPLAY_DUARTION);
			}, DIGIT_DISPLAY_DUARTION);
		}
	}
})