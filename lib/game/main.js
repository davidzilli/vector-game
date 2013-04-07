	ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.player',
	'game.entities.crate',
	'game.levels.test',
	
	'plugins.box2d.game',
	'plugins.box2d.debug'
)
.defines(function(){

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
				this.font.draw( 'WASD, SPACE TO JUMP', 2, 2 );
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
		document.getElementById('arrowCanvas').onmousedown=beginArrowVector;
		document.getElementById('arrowCanvas').width = document.getElementById('canvas').width;
		document.getElementById('arrowCanvas').height = document.getElementById('canvas').height;
		document.getElementById('arrowCanvas').x = document.getElementById('canvas').x;
	}

	
	var gravity;
	var start={x: 0 ,y: 0};
	var end={};
	var clickDown = false;
	function beginArrowVector(e)
        {
                console.log("Called2 arrow");
		clickDown = true;
		start.x = e.clientX;
		start.y = e.clientY;

                document.getElementById('arrowCanvas').onmouseup=null;
                document.getElementById('arrowCanvas').onmousemove=moveArrowVector;
        }

        function endArrowVector(e)
        {
               document.getElementById('arrowCanvas').onmousemove=null;
               document.getElementById('arrowCanvas').onmousedown=beginArrowVector;

               clickDown = false;
               //left
               if(-1*(end.x-start.x) > Math.abs(end.y-start.y)) {
               		ig.game.gravDir = ig.game.gravDirEnum.W;
                    gravity = new b2.Vec2(-15,0);
               }
               //up
               else if(-1*(end.y-start.y) > Math.abs((end.x-start.x))) {
               		ig.game.gravDir = ig.game.gravDirEnum.N;
                    gravity = new b2.Vec2(0, -15);
                }
               //right
               else if((end.x-start.x) > Math.abs((end.y-start.y))) {
               		ig.game.gravDir = ig.game.gravDirEnum.E;
                    gravity = new b2.Vec2(15, 0);
                }
               //down
               else if((end.y-start.y) > Math.abs((end.x-start.x))) {
              	 	ig.game.gravDir = ig.game.gravDirEnum.S;
                    gravity = new b2.Vec2(0, 15);
                }

               ig.world.SetGravity(gravity);
                    var ctx = document.getElementById('arrowCanvas').getContext('2d');
                    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);


          }

          function moveArrowVector(e)
          {
               if(clickDown){
                    document.getElementById('arrowCanvas').onmousedown=null;
                    document.getElementById('arrowCanvas').onmouseup=endArrowVector;
                    var ctx = document.getElementById('arrowCanvas').getContext('2d');
                    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

                    end.x = e.clientX;
                    end.y = e.clientY;
                    ctx.save();
                    ctx.lineWidth = 2;
                    ctx.fillStyle = ctx.strokeStyle = '#099';
                    arrow(ctx,start,end,10);
                    ctx.restore();
                    
                    
               }
               console.log("Called arrow");
          }


          function arrow(ctx,p1,p2,size){
               ctx.save();

               // Rotate the context to point along the path
               var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
               ctx.translate(p2.x,p2.y);
               ctx.rotate(Math.atan2(dy,dx));

               // line
               ctx.lineCap = 'round';
               ctx.beginPath();
               ctx.moveTo(0,0);
               ctx.lineTo(-len,0);
               ctx.closePath();
               ctx.stroke();

               // arrowhead
               ctx.beginPath();
               ctx.moveTo(0,0);
               ctx.lineTo(-size,-size/2);
               ctx.lineTo(-size, size/2);
               ctx.closePath();
               ctx.fill();

               ctx.restore();
	  }
});
