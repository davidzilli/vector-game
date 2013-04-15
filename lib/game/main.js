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
	'game.levels.test',
	'game.levels.test2',
	'game.levels.test3',
	
	'plugins.box2d.game',
	'plugins.box2d.debug'
)
.defines(function(){

	var arrowCanvas = document.getElementById('arrowCanvas');
	
	MyGame = ig.Box2DGame.extend({
		
		gravDirEnum: {N : 0, E : 1, S : 2, W : 3},
		gravDir: 2,
		gravity: 200, // All entities are affected by this
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
			
			if( ig.ua.mobile ) {
				ig.input.bindTouch( '#buttonLeft', 'left' );
				ig.input.bindTouch( '#buttonRight', 'right' );
				ig.input.bindTouch( '#buttonShoot', 'shoot' );
				ig.input.bindTouch( '#buttonJump', 'jump' );
			}
			
			// Load the LevelTest as required above ('game.level.test')
			this.loadLevel( LevelTest );
			this.debugDrawer = new ig.Box2DDebug ( ig.world );
		},
		
		loadLevel: function( data ) {
			this.parent( data );
			for( var i = 0; i < this.backgroundMaps.length; i++ ) {
				this.backgroundMaps[i].preRender = true;
			}
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
		},
		
		draw: function() {
			// Draw all entities and BackgroundMaps
			this.parent();
			this.debugDrawer.draw();
			if( !ig.ua.mobile ) {
				this.font.draw( 'WASD TO MOVE\nSPACE TO JUMP\nDRAW A VECTOR TO CHANGE GRAVITY', 2, 2 );
			}
		}
	});
	
	if( ig.ua.iPad ) {
		ig.Sound.enabled = false;
		ig.main('#canvas', MyGame, 60, 240, 160, 2);
	}
	else if( ig.ua.mobile ) {	
		ig.Sound.enabled = false;
		var width = 320;
		var height = 320;
		ig.main('#canvas', MyGame, 60, 160, 160, 1);
		
		var c = ig.$('#canvas');
		c.width = width;
		c.height = height;
		
		var pr = 2;//ig.ua.pixelRatio;
		if( pr != 1 ) {
			//~ c.style.width = (width / pr) + 'px';
			//~ c.style.height = (height / pr) + 'px';
			c.style.webkitTransformOrigin = 'left top';
			c.style.webkitTransform = 
				//~ 'translate3d('+(width / (4 * pr))+'px, '+(height / (4 * pr))+'px, 0)' + 
				//~ 'scale3d('+pr+', '+pr+', 0)' +
				'scale3d(2,2, 0)' +
				'';
		}
		//~ ig.system.canvas.style.width = '320px';
		//~ ig.system.canvas.style.height = '320px';
		//~ ig.$('#body').style.height = '800px';
		
		    //~ 320
		 //~ 80 480  80 // div 320/1.5 = 213
		//~ 160 640 160 // div 320/2 = 160
		
	}
	else {
		ig.main('#canvas', MyGame, 60, 300, 200, 3);
	}

	arrowCanvasInitialize();
	
	var gravity;
	var start={x: 0 ,y: 0};
	var end={};
	var clickDown = false;

	function arrowCanvasInitialize(){

		arrowCanvas.addEventListener("touchstart", mouseHandler, false);
		arrowCanvas.addEventListener("touchmove", mouseHandler, false);
		arrowCanvas.addEventListener("touchend", mouseHandler, false);

		arrowCanvas.addEventListener("mousedown", mouseHandler, false);
		arrowCanvas.addEventListener("mousemove", mouseHandler, false);
		arrowCanvas.addEventListener("mouseup", mouseHandler, false);

		arrowCanvas.width = document.getElementById('canvas').width;
		arrowCanvas.height = document.getElementById('canvas').height;
	}

	function mouseHandler(event) {

	    if (event.type == "mousedown" || event.type == "touchstart") {
	    	beginArrowVector(event);
	    } else if (event.type == "mousemove" || event.type == "touchmove") {
	    	moveArrowVector(event);
	    } else if (event.type == "mouseup" || event.type == "touchend") {
	      	endArrowVector(event);
	    }
	  
	}

	function beginArrowVector(e)
        {
                console.log("Called2 arrow");
		clickDown = true;
		start.x = e.layerX;
		start.y = e.layerY;

        }

    function endArrowVector(e)
    {
    
           clickDown = false;
           var dx = end.x - start.x;
           var dy = end.y - start.y;
           var length = Math.sqrt(dx*dx+dy*dy)/10;
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
                var ctx = document.getElementById('arrowCanvas').getContext('2d');
                ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);


      }

      function moveArrowVector(e)
      {
           if(clickDown){
                var ctx = document.getElementById('arrowCanvas').getContext('2d');
                ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

                end.x = e.layerX;
                end.y = e.layerY;
                ctx.save();
                ctx.lineWidth = 2;

                arrow(ctx,start,end,10);
                ctx.restore();
                
                
           }
           console.log("Called arrow");
      }

      function arrow(ctx,p1,p2,size){
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
