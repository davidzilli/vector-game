ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityPlayer = ig.Box2DEntity.extend({
	size: {x: 22, y:32},
	offset: {x: 4, y: 0},
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
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	
	animSheet: new ig.AnimationSheet( 'media/heroine.png', 32, 32 ),	
	
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
		shapeDef.friction = 0;
		shapeDef.density = 1;

		this.body.CreateShape(shapeDef);
		this.body.SetMassFromShapes();
	},
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// Add the animations
		this.addAnim( 'idle', 1, [1] );
		this.addAnim( 'jump', 0.07, [1,2] );
		this.addAnim( 'run', .1, [0, 1, 2, 1]);
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
	    		this.anims.idle.flip.y = true;
	    		this.anims.run.flip.y = true;
	    	break;

	    	case ig.game.gravDirEnum.E:
				this.standingNorm = this.standingNormArray.E;
			break;

	    	case ig.game.gravDirEnum.S:
	    		this.standingNorm = this.standingNormArray.S;
	    		this.anims.idle.flip.y = false;
	    		this.anims.run.flip.y = false;
	    	break;

	    	case ig.game.gravDirEnum.W:
	    		this.standingNorm = this.standingNormArray.W;
	    	break;

	    }

	    this.standing = false;
	    for( var edge = this.body.m_contactList; edge; edge = edge.next ) {
	        
	        // Get the normal vector for this contact
	        var normal = edge.contact.m_manifold.normal;
	        //console.log(normal);
	        
	        // If the normal vector for this contact is pointing upwards
	        // (y is less than 0), then this body is "standing" on something
	        if( normal.x == this.standingNorm.x && normal.y == this.standingNorm.y)
	        {
	        	this.standing = true;
	        	//console.log(this.standing);
	        }      
        }     
		var vel = this.body.GetLinearVelocity();
		// move left or right
		if (ig.game.gravDir == ig.game.gravDirEnum.N || ig.game.gravDir == ig.game.gravDirEnum.S) {
			if( ig.input.state('left') && this.standing ) {
				//console.log( 'moving left on ground');
				//this.body.ApplyForce( new b2.Vec2(this.leftGroundVec.x,this.leftGroundVec.y), this.body.GetPosition() );
				
				vel.x = Math.max( vel.x - 1, -14 );
				this.body.SetLinearVelocity( vel );
				this.flip = true;
				this.currentAnim = this.anims.run;
			}
			else if (ig.input.state('left') && !this.standing ) {
				console.log( 'moving left in the air' );
				vel.x = Math.max( vel.x - 0.7, -10 );
				this.body.SetLinearVelocity( vel );
				this.flip = true;
				this.currentAnim = this.anims.idle;
			}
			else if( ig.input.state('right') && this.standing ) {
				//console.log( 'moving right on ground' );
				vel.x = Math.min( vel.x + 1, 14 );
				this.body.SetLinearVelocity( vel );
				this.flip = false;
				this.currentAnim = this.anims.run;
			}
			else if( ig.input.state('right') && !this.standing ) {
				console.log( 'moving right in air' );
				vel.x = Math.min( vel.x + 0.7, 10 );
				this.body.SetLinearVelocity( vel );
				this.flip = false;
				this.currentAnim = this.anims.idle;
			}
			else if( this.standing) {
				vel.x = vel.x*.8;
				this.currentAnim = this.anims.idle;
			}
		}

		// move up or down
		if (ig.game.gravDir == ig.game.gravDirEnum.E || ig.game.gravDir == ig.game.gravDirEnum.W) {
			if( ig.input.state('up') && this.standing ) {
				//console.log( 'moving left on ground');
				vel.y = Math.max( vel.y - 1, -14 );
				this.body.SetLinearVelocity( vel );
				this.flip = true;
				this.currentAnim = this.anims.run;
			}
			else if (ig.input.state('up') && !this.standing ) {
				vel.y = Math.max( vel.y - .7, -10 );
				this.body.SetLinearVelocity( vel );
				this.flip = true;
				this.currentAnim = this.anims.idle;
			}
			else if( ig.input.state('down') && this.standing ) {
				//console.log( 'moving right on ground' );
				vel.y = Math.min( vel.y + 1, 14 );
				this.body.SetLinearVelocity( vel );
				this.flip = false;
				this.currentAnim = this.anims.run;
			}
			else if( ig.input.state('down') && !this.standing ) {
				vel.y = Math.min( vel.y + .7, 10 );
				this.body.SetLinearVelocity( vel );
				this.flip = false;
				this.currentAnim = this.anims.idle;
			}
			else if( this.standing) {
				vel.y = vel.y*.8;
				this.currentAnim = this.anims.idle;
			}
		}

		if( this.standing && ig.input.state('jump') ) {
            if (this.vel.y == 0){
                //this.body.ApplyImpulse( new b2.Vec2(this.jumpVec.x,this.jumpVec.y), this.body.GetPosition() );
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
