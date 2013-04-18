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
	'game.entities.earthquake',
	'game.entities.kill',
	'game.levels.test',
	'game.levels.test2',
	'game.levels.test3',
	'game.levels.test4',
	'game.levels.test5',
	
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
			ig.input.bind( ig.KEY.SPACE, 'jump' );
			ig.input.bind( ig.KEY.C, 'shoot' );
			
			//Bind mouse
			ig.input.initMouse();
        	ig.input.bind( ig.KEY.MOUSE1, 'mdown' );

			if( ig.ua.mobile ) {
				ig.input.bindTouch( '#buttonLeft', 'left' );
				ig.input.bindTouch( '#buttonRight', 'right' );
				ig.input.bindTouch( '#buttonShoot', 'shoot' );
				ig.input.bindTouch( '#buttonJump', 'jump' );
			}


			vector.start = {x: 0 ,y: 0};
			vector.end = {};
			vector.clickDown = false;
			vector.cooldown = false;
			vector.progressBar = 0;
			vector.coolTime = 4000;
			vector.minGrav = 8;
			//vector.mapScale is track the global scale for arrow drawing
			vector.mapScale;
			
			// Load the LevelTest as required above ('game.level.test')
			this.curLevel = "LevelTest";
			this.loadLevel( ig.global[this.curLevel] );
			//this.debugDrawer = new ig.Box2DDebug ( ig.world );
			ig.world.SetGravity( gravity );
		},
		
		loadLevel: function( data ) {
			this.parent( data );
			for( var i = 0; i < this.backgroundMaps.length; i++ ) {
				this.backgroundMaps[i].preRender = true;
			}
			this.resetGravity(this.gravDir);
			vector.cooldown = false;
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

			//Vector drawing
			if(!vector.cooldown){
				if(ig.input.pressed('mdown')){
					vector.clickDown = true;
					vector.start.x = ig.input.mouse.x * vector.mapScale;
					vector.start.y = ig.input.mouse.y * vector.mapScale;
				}
				if (ig.input.state('mdown')) {

		           if(vector.clickDown){
		                ig.system.context.clearRect(0,0,ig.system.context.canvas.width,ig.system.context.canvas.height);

		                vector.end.x = ig.input.mouse.x * vector.mapScale;
		                vector.end.y = ig.input.mouse.y * vector.mapScale;
		                
		                
		           }
		           //console.log("Called arrow");
				}
				if(ig.input.released('mdown')){

		           vector.clickDown = false;
		           var dx = vector.end.x - vector.start.x;
		           var dy = vector.end.y - vector.start.y;
		           var length = Math.sqrt(dx*dx+dy*dy)/5;
		           if(length < vector.minGrav) length = vector.minGrav;
		           //left
		           if(-1*(vector.end.x-vector.start.x) > Math.abs(vector.end.y-vector.start.y)) {
		           		ig.game.gravDir = ig.game.gravDirEnum.W;
		                gravity = new b2.Vec2(-length,0);
		           }
		           //up
		           else if(-1*(vector.end.y-vector.start.y) > Math.abs((vector.end.x-vector.start.x))) {
		           		ig.game.gravDir = ig.game.gravDirEnum.N;
		                gravity = new b2.Vec2(0, -length);
		            }
		           //right
		           else if((vector.end.x-vector.start.x) > Math.abs((vector.end.y-vector.start.y))) {
		           		ig.game.gravDir = ig.game.gravDirEnum.E;
		                gravity = new b2.Vec2(length, 0);
		            }
		           //down
		           else if((vector.end.y-vector.start.y) > Math.abs((vector.end.x-vector.start.x))) {
		          	 	ig.game.gravDir = ig.game.gravDirEnum.S;
		                gravity = new b2.Vec2(0, length);
		            }

		           ig.world.SetGravity(gravity);
		                
		                ig.system.context.clearRect(0,0,ig.system.context.canvas.width,ig.system.context.canvas.height);

		            vector.cooldown = true;
		            //setTimeout(function() { vector.cooldown = false }, vector.coolTime);
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
			if(vector.cooldown){
				var ctx = ig.system.context;
				vector.progressBar++;
				var percentComplete, leftOffset, topOffset, width, height;
				percentComplete = vector.progressBar/(141);
				if(ig.ua.mobile){
					leftOffset = 3;
					topOffset = 3;
					width = 64;
					height = 6;
				}
				else {
					this.font.draw( 'VECTOR COOLDOWN', 2, 11 );

					leftOffset = 5;
					topOffset = 40;
					width = 100;
					height = 15;
				}
				var progwidth = width * percentComplete;
				if(progwidth > width - 1) progwidth=width;
				ctx.save();
				ctx.fillStyle = "white";
				ctx.strokeStyle = "white";

				ctx.strokeRect(leftOffset,topOffset,width,height);

				ctx.fillRect(leftOffset + 1,topOffset + 1,progwidth,height-2);

				ctx.restore();
				if (vector.progressBar == 141) {
					vector.cooldown = false;
				}
			}
			else{

				if(!ig.ua.mobile){
					this.font.draw( 'DRAW A VECTOR TO CHANGE GRAVITY', 2, 11 );
				}
				vector.progressBar = 0;
			}
			// Draw arrow if mouse is down and dragging
			if(vector.clickDown){

					var ctx = ig.system.context;
	                ctx.save();
	                ctx.lineWidth = 2;

	                arrow(ctx, vector.start,vector.end,10);
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
		ig.Sound.enabled = false;
		vector.mapScale = 2;
		ig.main('#canvas', MyGame, 60, 240, 160, vector.mapScale);
		
	}
	else if( ig.ua.mobile ) {	
		ig.Sound.enabled = false;
		var width = 320;
		var height = 320;
		vector.mapScale = 1;
		ig.main('#canvas', MyGame, 60, 160, 160, vector.mapScale);
		
		
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
		width = window.innerWidth/2;
		height = window.innerHeight/2;
		vector.mapScale = 2;
		ig.main('#canvas', MyGame, 60, width, height, vector.mapScale);
		
	}

      function arrow(ctx, p1,p2,size){
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
