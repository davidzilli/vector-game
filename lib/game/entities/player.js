ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityPlayer = ig.Box2DEntity.extend({
	size: {x: 8, y:14},
	offset: {x: 4, y: 2},
	allowSleep: false,
	falling: false,
	jumping: false,
	standingNormArray: {	
					N:
						{x: 0, y: 1},
					S:
						{x: 0, y: -1}, 
					E: 
						{x: -1, y: 0}, 
					W: 
						{x: 1, y: 0}
					},

	standingNorm: {x: 0, y: 0},

	leftGroundVec: {x: 0, y: 0} ,
	rightGroundVec: {x: 0, y: 0},
	upGroundVec: {x: 0, y: 0},
	downGroundVec: {x: 0, y: 0},
	leftAirVec: {x: 0, y: 0} ,
	rightAirVec: {x: 0, y: 0},
	upAirVec: {x: 0, y: 0},
	downAirVec: {x: 0, y: 0},
	jumpVec: {x: 0, y: 0},

	moveArray: {
					moveLeftGround: {
						N: {
							x: -20,
							y: 0
						},
						E: {
							x: 0,
							y: 0
						},
						S: {
							x: -20,
							y: 0
						},
						W: {
							x: 0,
							y: 0
						}
					},
					moveRightGround: {
						N: {
							x: 20,
							y: 0
						},
						E: {
							x: 0,
							y: 0
						},
						S: {
							x: 20,
							y: 0
						},
						W: {
							x: 0,
							y: 0
						}
					},
					moveLeftAir: {
						N: {
							x: -10,
							y: 0
						},
						E: {
							x: 0,
							y: 0
						},
						S: {
							x: -10,
							y: 0
						},
						W: {
							x: 0,
							y: 0
						}
					},
					moveRightAir: {
						N: {
							x: 10,
							y: 0
						},
						E: {
							x: 0,
							y: 0
						},
						S: {
							x: 10,
							y: 0
						},
						W: {
							x: 0,
							y: 0
						}
					},
					moveUpGround: {
						N: {
							x: 0,
							y: 0
						},
						E: {
							x: 0,
							y: -20
						},
						S: {
							x: 0,
							y: 0
						},
						W: {
							x: 0,
							y: -20
						}
					},
					moveDownGround: {
						N: {
							x: 0,
							y: 0
						},
						E: {
							x: 0,
							y: 20
						},
						S: {
							x: 0,
							y: 0
						},
						W: {
							x: 0,
							y: 20
						}
					},
					moveUpAir: {
						N: {
							x: 0,
							y: 0
						},
						E: {
							x: 0,
							y: -10
						},
						S: {
							x: 0,
							y: 0
						},
						W: {
							x: 0,
							y: -10
						}
					},
					moveDownAir: {
						N: {
							x: 0,
							y: 0
						},
						E: {
							x: 0,
							y: 10
						},
						S: {
							x: 0,
							y: 0
						},
						W: {
							x: 0,
							y: 10
						}
					},
					jump: {
						N: {
							x: 0,
							y: 6
						},
						E: {
							x: -6,
							y: 0
						},
						S: {
							x: 0,
							y: -6
						},
						W: {
							x: 6,
							y: 0
						}
					}

	},
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	
	animSheet: new ig.AnimationSheet( 'media/player.png', 16, 24 ),	
	
	flip: false,

	createBody: function () {
		var playerDef = new b2.BodyDef();
		playerDef.allowSleep = false;

		playerDef.position.Set (
			(this.pos.x + this.size.x / 2) * b2.SCALE, 
			(this.pos.y + this.size.y / 2) * b2.SCALE
		);

		this.body = ig.world.CreateBody(playerDef);

		var shapeDef = new b2.PolygonDef();
		shapeDef.SetAsBox(this.size.x/2 * b2.SCALE, this.size.y / 2 * b2.SCALE);
		shapeDef.friction = .9;
		shapeDef.density = 1;

		this.body.CreateShape(shapeDef);
		this.body.SetMassFromShapes();
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// Add the animations
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'jump', 0.07, [1,2] );
	},
	
	
	update: function() {

		
	    // Iterate over all contact edges for this body. m_contactList is 
	    // a linked list, not an array, hence the "funny" way of iterating 
	    // over it
	    //NOTE***
	    //"standing" should be determined by a particular normal vector given
	    //the current gravDir
	    switch (ig.game.gravDir) {

	    	case ig.game.gravDirEnum.N:
	    		this.standingNorm = this.standingNormArray.N;
	    		this.leftGroundVec = this.moveArray.moveLeftGround.N;
	    		this.rightGroundVec = this.moveArray.moveRightGround.N;
	    		this.leftAirVec = this.moveArray.moveLeftAir.N;
	    		this.rightAirVec = this.moveArray.moveRightAir.N;
	    		this.upGroundVec = this.moveArray.moveUpGround.N;
	    		this.downGroundVec = this.moveArray.moveDownGround.N;
	    		this.upAirVec = this.moveArray.moveUpAir.N;
	    		this.downAirVec = this.moveArray.moveDownAir.N;
	    		this.jumpVec = this.moveArray.jump.N;
	    	break;

	    	case ig.game.gravDirEnum.E:
				this.standingNorm = this.standingNormArray.E;
				this.standingNorm = this.standingNormArray.E;
	    		this.leftGroundVec = this.moveArray.moveLeftGround.E;
	    		this.rightGroundVec = this.moveArray.moveRightGround.E;
	    		this.leftAirVec = this.moveArray.moveLeftAir.E;
	    		this.rightAirVec = this.moveArray.moveRightAir.E;
	    		this.upGroundVec = this.moveArray.moveUpGround.E;
	    		this.downGroundVec = this.moveArray.moveDownGround.E;
	    		this.upAirVec = this.moveArray.moveUpAir.E;
	    		this.downAirVec = this.moveArray.moveDownAir.E;
	    		this.jumpVec = this.moveArray.jump.E;
	    	break;

	    	case ig.game.gravDirEnum.S:
	    		this.standingNorm = this.standingNormArray.S;
	    		this.standingNorm = this.standingNormArray.S;
	    		this.leftGroundVec = this.moveArray.moveLeftGround.S;
	    		this.rightGroundVec = this.moveArray.moveRightGround.S;
	    		this.leftAirVec = this.moveArray.moveLeftAir.S;
	    		this.rightAirVec = this.moveArray.moveRightAir.S;
	    		this.upGroundVec = this.moveArray.moveUpGround.S;
	    		this.downGroundVec = this.moveArray.moveDownGround.S;
	    		this.upAirVec = this.moveArray.moveUpAir.S;
	    		this.downAirVec = this.moveArray.moveDownAir.S;
	    		this.jumpVec = this.moveArray.jump.S;
	    	break;

	    	case ig.game.gravDirEnum.W:
	    		this.standingNorm = this.standingNormArray.W;
	    		this.standingNorm = this.standingNormArray.W;
	    		this.leftGroundVec = this.moveArray.moveLeftGround.W;
	    		this.rightGroundVec = this.moveArray.moveRightGround.W;
	    		this.leftAirVec = this.moveArray.moveLeftAir.W;
	    		this.rightAirVec = this.moveArray.moveRightAir.W;
	    		this.upGroundVec = this.moveArray.moveUpGround.W;
	    		this.downGroundVec = this.moveArray.moveDownGround.W;
	    		this.upAirVec = this.moveArray.moveUpAir.W;
	    		this.downAirVec = this.moveArray.moveDownAir.W;
	    		this.jumpVec = this.moveArray.jump.W;
	    	break;

	    }

	    this.standing = false;
	    for( var edge = this.body.m_contactList; edge; edge = edge.next ) {
	        
	        // Get the normal vector for this contact
	        var normal = edge.contact.m_manifold.normal;
	        
	        // If the normal vector for this contact is pointing upwards
	        // (y is less than 0), then this body is "standing" on something
	        if( normal.x == this.standingNorm.x && normal.y == this.standingNorm.y)
	        {
	        	this.standing = true;
	            console.log( 'standing!' );
	            console.log( normal.y );
	        }      
        }     
		
		// move left or right
		if( ig.input.state('left') && this.standing ) {
			//console.log( 'moving left on ground');
			this.body.ApplyForce( new b2.Vec2(this.leftGroundVec.x,this.leftGroundVec.y), this.body.GetPosition() );
			this.flip = true;
		}
		else if (ig.input.state('left') && !this.standing ) {
			console.log( 'moving left in the air' );
			this.body.ApplyForce( new b2.Vec2(this.leftAirVec.x,this.leftAirVec.y), this.body.GetPosition() );
			this.flip = true;
		}
		else if( ig.input.state('right') && this.standing ) {
			//console.log( 'moving right on ground' );
			this.body.ApplyForce( new b2.Vec2(this.rightGroundVec.x,this.rightGroundVec.y), this.body.GetPosition() );
			this.flip = false;
		}
		else if( ig.input.state('right') && !this.standing ) {
			console.log( 'moving right in air' );
			this.body.ApplyForce( new b2.Vec2(this.rightAirVec.x, this.rightAirVec.y), this.body.GetPosition() );
			this.flip = false;
		}

		// move up or down
		if( ig.input.state('up') && this.standing ) {
			//console.log( 'moving left on ground');
			this.body.ApplyForce( new b2.Vec2(this.upGroundVec.x,this.upGroundVec.y), this.body.GetPosition() );
			this.flip = true;
		}
		else if (ig.input.state('up') && !this.standing ) {
			console.log( 'moving up in the air' );
			this.body.ApplyForce( new b2.Vec2(this.upAirVec.x,this.upAirVec.y), this.body.GetPosition() );
			this.flip = true;
		}
		else if( ig.input.state('down') && this.standing ) {
			//console.log( 'moving right on ground' );
			this.body.ApplyForce( new b2.Vec2(this.downGroundVec.x,this.downGroundVec.y), this.body.GetPosition() );
			this.flip = false;
		}
		else if( ig.input.state('down') && !this.standing ) {
			console.log( 'moving down in air' );
			this.body.ApplyForce( new b2.Vec2(this.downAirVec.x, this.downAirVec.y), this.body.GetPosition() );
			this.flip = false;
		}
		

		if( this.standing && ig.input.state('jump') ) {
            if (this.vel.y == 0){
                this.body.ApplyImpulse( new b2.Vec2(this.jumpVec.x,this.jumpVec.y), this.body.GetPosition() );
            }
        }
		// shoot
		if( ig.input.pressed('shoot') ) {
			var x = this.pos.x + (this.flip ? -6 : 6 );
			var y = this.pos.y + 6;
			ig.game.spawnEntity( EntityProjectile, x, y, {flip:this.flip} );
		}
		
		this.currentAnim.flip.x = this.flip;
		
		
		// This sets the position and angle. We use the position the object
		// currently has, but always set the angle to 0 so it does not rotate
		this.body.SetXForm(this.body.GetPosition(), 0);
		
		// move!
		this.parent();
	}
});


EntityProjectile = ig.Box2DEntity.extend({
	size: {x: 8, y: 4},
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, 
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
		
	animSheet: new ig.AnimationSheet( 'media/projectile.png', 8, 4 ),	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 1, [0] );
		this.currentAnim.flip.x = settings.flip;
		
		var velocity = (settings.flip ? -10 : 10);
		this.body.ApplyImpulse( new b2.Vec2(velocity,0), this.body.GetPosition() );
	}	
});

});
