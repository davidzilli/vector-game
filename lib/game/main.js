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
	'game.levels.test',
	'game.levels.test2',
	'game.levels.test3',
	'game.levels.test4',
	'game.levels.test5',
	
	'plugins.box2d.game',
	'plugins.box2d.debug'
)
.defines(function(){
	
	var baseGravity = 50;
	var gravity = new b2.Vec2(0, baseGravity);
	var start={x: 0 ,y: 0};
	var end={};
	var clickDown = false;
	//mapScale is track the global scale for arrow drawing
	var mapScale;

	MyGame = ig.Box2DGame.extend({
		
		gravDirEnum: {N : 0, E : 1, S : 2, W : 3},
		gravDir: 2,
		allowSleep: false,

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
			
			// Load the LevelTest as required above ('game.level.test')
			this.loadLevel( LevelTest );
			this.debugDrawer = new ig.Box2DDebug ( ig.world );
			ig.world.SetGravity( gravity );

		},
		
		loadLevel: function( data ) {
			this.parent( data );
			for( var i = 0; i < this.backgroundMaps.length; i++ ) {
				this.backgroundMaps[i].preRender = true;
			}
			this.resetGravity(this.gravDir);
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
			if(ig.input.pressed('mdown')){
				clickDown = true;
				start.x = ig.input.mouse.x * mapScale;
				start.y = ig.input.mouse.y * mapScale;
			}
			if (ig.input.state('mdown')) {

	           if(clickDown){
	                ig.system.context.clearRect(0,0,ig.system.context.canvas.width,ig.system.context.canvas.height);

	                end.x = ig.input.mouse.x * mapScale;
	                end.y = ig.input.mouse.y * mapScale;
	                
	                
	           }
	           //console.log("Called arrow");
			}
			if(ig.input.released('mdown')){

	           clickDown = false;
	           var dx = end.x - start.x;
	           var dy = end.y - start.y;
	           var length = Math.sqrt(dx*dx+dy*dy)/5;
	           //left
	           if(-1*(end.x-start.x) > Math.abs(end.y-start.y)) {
	           		ig.game.gravDir = ig.game.gravDirEnum.W;
	                gravity = new b2.Vec2(-length,0);
	           }
	           //up
	           else if(-1*(end.y-start.y) > Math.abs((end.x-start.x))) {
	           		ig.game.gravDir = ig.game.gravDirEnum.N;
	                gravity = new b2.Vec2(0, -length);
	            }
	           //right
	           else if((end.x-start.x) > Math.abs((end.y-start.y))) {
	           		ig.game.gravDir = ig.game.gravDirEnum.E;
	                gravity = new b2.Vec2(length, 0);
	            }
	           //down
	           else if((end.y-start.y) > Math.abs((end.x-start.x))) {
	          	 	ig.game.gravDir = ig.game.gravDirEnum.S;
	                gravity = new b2.Vec2(0, length);
	            }

	           ig.world.SetGravity(gravity);
	                
	                ig.system.context.clearRect(0,0,ig.system.context.canvas.width,ig.system.context.canvas.height);


			}
		},
		
		draw: function() {
			// Draw all entities and BackgroundMaps
			this.parent();
			this.debugDrawer.draw();
			if( !ig.ua.mobile ) {
				this.font.draw( 'WASD TO MOVE\nDRAW A VECTOR TO CHANGE GRAVITY', 2, 2 );
			}
			// Draw arrow if mouse is down and dragging
			if(clickDown){

	                ig.system.context.save();
	                ig.system.context.lineWidth = 2;

	                arrow(start,end,10);
	                ig.system.context.restore();
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
		mapScale = 2;
		ig.main('#canvas', MyGame, 60, 240, 160, mapScale);
		
	}
	else if( ig.ua.mobile ) {	
		ig.Sound.enabled = false;
		var width = 320;
		var height = 320;
		mapScale = 1;
		ig.main('#canvas', MyGame, 60, 160, 160, mapScale);
		
		
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
		mapScale = 2;
		ig.main('#canvas', MyGame, 60, width, height, mapScale);
		
	}

      function arrow(p1,p2,size){
           ig.system.context.save();

           // Rotate the context to point along the path
           var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
           var maxLength = document.getElementById('canvas').height/4;
           var xLength, yLength;
           var xSign = dx?dx<0?-1:1:0, ySign = dy?dy<0?-1:1:0, xSignSize =size * xSign, ySignSize =size * ySign;
           if(Math.abs(dx)>maxLength) xLength = maxLength * xSign;
           else xLength = dx;


           if(Math.abs(dy)>maxLength) yLength = maxLength * ySign;
           else yLength = dy;

           ig.system.context.translate(p1.x,p1.y);

           if(len < maxLength){
		   		var redVal = Math.floor(len);
		   		
		        ig.system.context.fillStyle = ig.system.context.strokeStyle = "rgb(" + redVal + ", 80, 80)";
		    }
		    else ig.system.context.fillStyle = ig.system.context.strokeStyle = "rgb(256, 80, 80)";
           // line
           ig.system.context.lineCap = 'round';
           ig.system.context.beginPath();
           ig.system.context.moveTo(0 ,0);
           if(Math.abs(dx)>Math.abs(dy)) ig.system.context.lineTo(xLength-xSignSize,0);
           else ig.system.context.lineTo(0,yLength-ySignSize);
           ig.system.context.closePath();
           ig.system.context.stroke();

           // arrowhead
           ig.system.context.beginPath();

           if(Math.abs(dx)>Math.abs(dy)) {
	           ig.system.context.moveTo(xLength,0);
	           ig.system.context.lineTo(xLength -xSignSize,-size/2);
	           ig.system.context.lineTo(xLength -xSignSize, size/2);
	       }
	       else{
	           ig.system.context.moveTo(0,yLength);
	           ig.system.context.lineTo(-size/2, yLength-ySignSize);
	           ig.system.context.lineTo(size/2, yLength-ySignSize);
	       }
           ig.system.context.closePath();
           ig.system.context.fill();

           ig.system.context.restore();
	  }
});
