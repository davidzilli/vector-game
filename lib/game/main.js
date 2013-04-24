	ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.player',
	'game.entities.crate',
	'game.entities.trigger',
	'game.entities.levelchange',
	'game.entities.changegravity',
	'game.entities.kill',
	'game.entities.text',
	'game.levels.test',
	'game.levels.test1',
	'game.levels.test2',
	'game.levels.test3',
	'game.levels.test4',
	'game.levels.test5',
	'game.levels.test6',
	
	'plugins.box2d.game',
	'plugins.box2d.debug'
)
.defines(function(){
	
	var vector = {};
	var baseGravity = 50;
	var gravity = new b2.Vec2(0, baseGravity);

	MyGame = ig.Box2DGame.extend({
		
		gravDirEnum: {N : 0, E : 1, S : 2, W : 3},
		gravDir: 2,
		allowSleep: false,
		curLevel: "LevelTest",
		levelStartGravityDir: 2,

		// Load a font
		font: new ig.Font( 'media/04b03.font.png' ),
		clearColor: '#1b2026',
		
		init: function() {

			// Bind keys
			ig.input.bind( ig.KEY.A, 'left' );
			ig.input.bind( ig.KEY.D, 'right' );
			ig.input.bind( ig.KEY.S, 'down' );
			ig.input.bind( ig.KEY.W, 'up' );
			ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
			ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
			ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
			ig.input.bind( ig.KEY.UP_ARROW, 'up' );
			ig.input.bind( ig.KEY.SPACE, 'jump' );
			ig.input.bind( ig.KEY.C, 'shoot' );
			
			//Bind mouse
			ig.input.initMouse();
        	ig.input.bind( ig.KEY.MOUSE1, 'mdown' );

			if( ig.ua.mobile ) {
				ig.input.bindTouch( '#buttonLeft', 'left' );
				ig.input.bindTouch( '#buttonRight', 'right' );
				ig.input.bindTouch( '#buttonShoot', 'up' );
				ig.input.bindTouch( '#buttonJump', 'down' );
			}

			if( ig.ua.mobile ) {
				ig.input.bindTouch( '#buttonLeft', 'left' );
				ig.input.bindTouch( '#buttonRight', 'right' );
				ig.input.bindTouch( '#buttonShoot', 'up' );
				ig.input.bindTouch( '#buttonJump', 'down' );
			}

			var grav_anim = new ig.AnimationSheet( 'media/grav_tiles.png', 8, 8 );
			var laser_anim = new ig.AnimationSheet( 'media/laser_tiles.png', 8, 8 );
			this.backgroundAnims = 
				{'media/laser_tiles.png': {
	        	0: new ig.Animation( laser_anim, 0.2, [0, 3, 6, 6, 6, 6, 6, 6, 3, 0] ),
	        	1: new ig.Animation( laser_anim, 0.2, [1, 4, 7, 7, 7, 7, 7, 7, 4, 1] ),
	        	2: new ig.Animation( laser_anim, 0.2, [2, 5, 8, 8, 8, 8, 8, 8, 5, 2] ),
	        	9: new ig.Animation( laser_anim, 0.2, [9, 12, 15, 15, 15, 15, 15, 15, 12, 9] ),
	        	10: new ig.Animation( laser_anim, 0.2, [10, 13, 16, 16, 16, 16, 16, 16, 13, 10] ),
	        	11: new ig.Animation( laser_anim, 0.2, [11, 14, 17, 17, 17, 17, 17, 17, 14, 11] )
	   		 	},

	   		 	'media/grav_tiles.png': {
	        	0: new ig.Animation( grav_anim, 0.1, [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0] ),
				}
			};

			ig.music.add ('media/sounds/theme.ogg');
			ig.music.volume= 0.25;
			ig.music.play();


			vector.start = {x: 0 ,y: 0};
			vector.end = {};
			vector.clickDown = false;
			vector.cooldown = false;
			vector.progressBar = 0;
			vector.coolTime = 150;
			vector.minGrav = 15;
			//vector.mapScale is track the global scale for arrow drawing
			vector.mapScale;
			
			// Load the LevelTest as required above ('game.level.test')
			this.curLevel = "LevelTest1";
			this.loadLevel( ig.global[this.curLevel] );
			//this.debugDrawer = new ig.Box2DDebug ( ig.world );
			ig.world.SetGravity( gravity );
			tips.show('controls', 'vector');
		},
		
		loadLevel: function( data ) {
			this.parent( data );
			for( var i = 0; i < this.backgroundMaps.length; i++ ) {
				this.backgroundMaps[i].preRender = false;
			}
			this.resetGravity(this.gravDir);
			vector.cooldown = false;
			vector.progressBar = 0;
		},
		
		update: function() {		
			// Update all entities and BackgroundMaps
			this.parent();
			
			// screen follows the player
			var player = this.getEntitiesByType( EntityPlayer )[0];
			if( player ) {
				this.screen.x = player.pos.x - ig.system.width/2;
				this.screen.y = player.pos.y - ig.system.height/2;
			}

			//-----------Vector drawing-----------------

			//Check to see if the timeout period after
			//last drawn vector has passed
			if(!vector.cooldown){

				//Mouse click or touchdown
				if(ig.input.pressed('mdown')){
					console.log("clicking down set to true, mdown pressed");
					
					vector.clickDown = true;
					//Keep note of start point for drawing the arrow
					vector.start.x = ig.input.mouse.x * vector.mapScale;
					vector.start.y = ig.input.mouse.y * vector.mapScale;
				}
				if (ig.input.state('mdown')) {
					console.log("state is mdown");
					//Is the click being held down?
		           if(vector.clickDown){
		                //ig.system.context.clearRect(0,0,ig.system.context.canvas.width,ig.system.context.canvas.height);

		                vector.end.x = ig.input.mouse.x * vector.mapScale;
		                vector.end.y = ig.input.mouse.y * vector.mapScale;
		                
		           }
				}
				//Mouse released
				if(ig.input.released('mdown') && vector.clickDown){
					console.log("mdown released");

		           vector.clickDown = false;
		           
		           //Calculate length of the vector
		           var dx = vector.end.x - vector.start.x;
		           var dy = vector.end.y - vector.start.y;
		           var length = Math.sqrt(dx*dx+dy*dy)/5;

		           var sound_gravity = new ig.Sound( 'media/sounds/gravity.ogg' );
		           sound_gravity.volume = .5;
				
		           
		           //Minimum strength for gravity to prevent floating around game
		           if(length < vector.minGrav) length = vector.minGrav;

		           //Determine direction and set gravity
		           //left
		           if(-1*(vector.end.x-vector.start.x) > Math.abs(vector.end.y-vector.start.y)) {
		           		ig.game.gravDir = ig.game.gravDirEnum.W;
		                gravity = new b2.Vec2(-length,0);
		                sound_gravity.play();
		           }
		           //up
		           else if(-1*(vector.end.y-vector.start.y) > Math.abs((vector.end.x-vector.start.x))) {
		           		ig.game.gravDir = ig.game.gravDirEnum.N;
		                gravity = new b2.Vec2(0, -length);
		                sound_gravity.play();
		            }
		           //right
		           else if((vector.end.x-vector.start.x) > Math.abs((vector.end.y-vector.start.y))) {
		           		ig.game.gravDir = ig.game.gravDirEnum.E;
		                gravity = new b2.Vec2(length, 0);
		                sound_gravity.play();
		            }
		           //down
		           else if((vector.end.y-vector.start.y) > Math.abs((vector.end.x-vector.start.x))) {
		          	 	ig.game.gravDir = ig.game.gravDirEnum.S;
		                gravity = new b2.Vec2(0, length);
		                sound_gravity.play();
		            }

		            ig.world.SetGravity(gravity);
		                
		            ig.system.context.clearRect(0,0,ig.system.context.canvas.width,ig.system.context.canvas.height);

		            //Start cooldown for drawing vector
		            console.log(length);
		            if (!(dx == 0 && dy == 0))
		            	vector.cooldown = true;
		            
				}
			}
		},
		
		draw: function() {
			// Draw all entities and BackgroundMaps
			this.parent();
			//this.debugDrawer.draw();
			if( !ig.ua.mobile ) {
					this.font.draw( 'WASD TO MOVE', 2, 2 );	
				
			}
			var ctx = ig.system.context;
			//Draw status bar if currently cooling down
			if(vector.cooldown){

				
				//Each time drawn, update progress bar
				vector.progressBar++;

				//Parameters for drawing the bar
				var percentComplete, leftOffset, topOffset, width, height;
				percentComplete = vector.progressBar/(vector.coolTime);

				//Different settings for mobile vs. desktop
				if(ig.ua.mobile){
					leftOffset = 3;
					topOffset = 3;
					width = 64;
					height = 6;
				}
				else {
					this.font.draw( 'GRAVITY CHANGE COOLDOWN', 2, 11 );

					leftOffset = ig.input.mouse.x * vector.mapScale + 15;
					topOffset = ig.input.mouse.y * vector.mapScale + 12;
					
					width = 100;
					height = 15;
				}
				var progwidth = width * percentComplete;

				//Don't let fill go past the end of the bar
				if(progwidth > width - 1) progwidth=width;

				ctx.save();
				ctx.fillStyle = "white";
				ctx.strokeStyle = "white";

				//Outer rectangle
				ctx.strokeRect(leftOffset,topOffset,width,height);
				//Fill Rectangle
				ctx.fillRect(leftOffset + 1,topOffset + 1,progwidth,height-2);

				ctx.restore();
				if (vector.progressBar == vector.coolTime) {
					//Once counter is finished, let user draw again
					vector.cooldown = false;
					vector.progressBar = 0;
				}
			}
			else{

				if(!ig.ua.mobile){
					this.font.draw( 'DRAW A VECTOR TO CHANGE GRAVITY', 2, 11 );
				}
			}
			// Draw arrow if mouse is down and dragging
			if(vector.clickDown){
					console.log("DRAWING!");
	                ctx.save();
	                ctx.lineWidth = 2;

	                arrow(vector.start,vector.end,10);
	                ctx.restore();
			}
		},

		resetGravity: function( direction ) {
			switch (direction) {

				case this.gravDirEnum.N:
					ig.game.gravDir = ig.game.gravDirEnum.N;
	                gravity = new b2.Vec2(0,-baseGravity);
				break;

				case this.gravDirEnum.E:
					ig.game.gravDir = ig.game.gravDirEnum.E;
	                gravity = new b2.Vec2(baseGravity,0);
				break;

				case this.gravDirEnum.S:
					ig.game.gravDir = ig.game.gravDirEnum.S;
	                gravity = new b2.Vec2(0,baseGravity);
				break;

				case this.gravDirEnum.W:
					ig.game.gravDir = ig.game.gravDirEnum.W;
	                gravity = new b2.Vec2(-baseGravity,0);
				break;
			}
			ig.world.SetGravity(gravity);
		},
	});
	
	if( ig.ua.iPad ) {
		console.log("Loading ipad");
		ig.Sound.enabled = false;
		vector.mapScale = 2;
		ig.main('#canvas', MyGame, 60, 240, 160, vector.mapScale);
		
	}
	else if( ig.ua.mobile ) {	
		console.log("Loading mobile");
		ig.Sound.enabled = false;
		vector.mapScale = 1;
		var width = window.innerWidth/2;
    	var height = window.innerHeight/2;
    	ig.main('#canvas', MyGame, 60, width, height, vector.mapScale);
		
		
		var c = ig.$('#canvas');
		c.width = width;
		c.height = height;
		
		var pr = 2;//ig.ua.pixelRatio;
		if( pr != 1 ) {
			//~ c.style.width = (width / pr) + 'px';
			//~ c.style.height = (height / pr) + 'px';
			c.style.webkitTransformOrigin = 'left top';
			c.style.webkitTransform = 'scale(2,2)';
		}
		//~ ig.system.canvas.style.width = '320px';
		//~ ig.system.canvas.style.height = '320px';
		//~ ig.$('#body').style.height = '800px';
		
		    //~ 320
		 //~ 80 480  80 // div 320/1.5 = 213
		//~ 160 640 160 // div 320/2 = 160
		
	}
	else {
		console.log("Loading other");
		width = window.innerWidth/2.5;
		height = window.innerHeight/2.5;
		vector.mapScale = 2;
		ig.main('#canvas', MyGame, 60, width, height, vector.mapScale);
		
	}

      function arrow(p1,p2,size){
      		var ctx = ig.system.context;
           ctx.save();

           // Rotate the context to point along the path
           var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
           var maxLength = document.getElementById('canvas').height/4;
           var xLength, yLength;
           var xSign = dx?dx<0?-1:1:0, ySign = dy?dy<0?-1:1:0, xSignSize =size * xSign, ySignSize =size * ySign;
           if(Math.abs(dx)>maxLength) xLength = maxLength * xSign;
           else xLength = dx;


           if(Math.abs(dy)>maxLength) yLength = maxLength * ySign;
           else yLength = dy;

           ctx.translate(p1.x,p1.y);

           if(len < maxLength){
		   		var redVal = Math.floor(len);
		   		
		        ctx.fillStyle = ctx.strokeStyle = "rgb(" + redVal + ", 80, 80)";
		    }
		    else ctx.fillStyle = ctx.strokeStyle = "rgb(256, 80, 80)";
           // line
           ctx.lineCap = 'round';
           ctx.beginPath();
           ctx.moveTo(0 ,0);
           if(Math.abs(dx)>Math.abs(dy)) ctx.lineTo(xLength-xSignSize,0);
           else ctx.lineTo(0,yLength-ySignSize);
           ctx.closePath();
           ctx.stroke();

           // arrowhead
           ctx.beginPath();

           if(Math.abs(dx)>Math.abs(dy)) {
	           ctx.moveTo(xLength,0);
	           ctx.lineTo(xLength -xSignSize,-size/2);
	           ctx.lineTo(xLength -xSignSize, size/2);
	       }
	       else{
	           ctx.moveTo(0,yLength);
	           ctx.lineTo(-size/2, yLength-ySignSize);
	           ctx.lineTo(size/2, yLength-ySignSize);
	       }
           ctx.closePath();
           ctx.fill();

           ctx.restore();
	  }
});
