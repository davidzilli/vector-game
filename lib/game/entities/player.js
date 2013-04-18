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
						{x: 0, y: 1}, 
					E: 
						{x: 0, y: 0}, 
					W: 
						{x: 0, y: 0}
					},

	standingNorm: {x: 0, y: 0},
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	
	animSheet: new ig.AnimationSheet( 'media/heroine.png', 32, 32 ),	
	
	flip: false,

	kill: function() {
		this.parent();
		ig.game.spawnEntity(EntityPlayerDeath, this.pos.x, this.pos.y, {callback:function(){ig.game.loadLevelDeferred( ig.global[ ig.game.curLevel ] )}} );
	},

	rotateTo: function (degrees)
	{
		this.anims.idle.angle = degrees.toRad();
	    this.body.SetXForm(this.body.GetPosition(), degrees.toRad());
	},

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
		this.addAnim( 'fall', 1, [3] );
		this.addAnim( 'run', .1, [0, 1, 2, 1]);
	},
	
	
	update: function() {
		
	    // Iterate over all contact edges for this body. m_contactList is 
	    // a linked list, not an array, hence the "funny" way of iterating 
	    // over it
	    //NOTE***
	    //"standing" should be determined by a particular normal vector given
	    //the current gravDir
	    var normalMultiplier = 1;
	    switch (ig.game.gravDir) {

	    	case ig.game.gravDirEnum.N:
	    		this.standingNorm = this.standingNormArray.N;
	    		this.anims.idle.flip.y = true;
	    		this.anims.run.flip.y = true;
	    		this.anims.fall.flip.y = true;
	    		this.rotateTo(0);
	    	break;

	    	case ig.game.gravDirEnum.E:
				this.standingNorm = this.standingNormArray.E;
				this.anims.idle.flip.y = true;
	    		this.anims.run.flip.y = true;
	    		this.anims.fall.flip.y = true;
				this.rotateTo(0);
				this.rotateTo(90);
			break;

	    	case ig.game.gravDirEnum.S:
	    		this.standingNorm = this.standingNormArray.S;
	    		this.anims.idle.flip.y = false;
	    		this.anims.run.flip.y = false;
	    		this.anims.fall.flip.y = false;
	    		this.rotateTo(0);
	    	break;

	    	case ig.game.gravDirEnum.W:
	    		this.standingNorm = this.standingNormArray.W;
	    		this.anims.idle.flip.y = false;
	    		this.anims.run.flip.y = false;
	    		this.anims.fall.flip.y = false;
	    		this.rotateTo(0);
	    		this.rotateTo(90);
	    	break;

	    }

	    this.standing = false;
	    for( var edge = this.body.m_contactList; edge; edge = edge.next ) {
	        
	        // Get the normal vector for this contact
	        var normal = edge.contact.m_manifold.normal;
	        normaly = normal.y;
	        normalx = normal.x;
	        //if(edge.contact.m_shape1.m_body.m_type == 2){normaly *= normalMultiplier;}
	        //if(edge.contact.m_shape1.m_body.m_type == 2){normalx *= normalMultiplier;}
	        //console.log(normal);
	        //console.log(Math.round(normal.x) + " " + Math.round(normaly));
	        
	        // If the normal vector for this contact is pointing upwards
	        // (y is less than 0), then this body is "standing" on something
	        //when standing on a box, the normal vector is not an integer, have to deal with that
	        if( Math.abs(Math.round(normal.x)) == this.standingNorm.x && Math.abs(Math.round(normal.y)) == this.standingNorm.y)
	        {
	        	
	        	this.standing = true;
	        	//console.log(this.standing);
	        }     
        }     



		var vel = this.body.GetLinearVelocity();
		// move left or right
		if (ig.game.gravDir == ig.game.gravDirEnum.N || ig.game.gravDir == ig.game.gravDirEnum.S) {
			if (!this.standing) {
				this.currentAnim = this.anims.fall;
			}

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
				this.currentAnim = this.anims.fall;
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
				this.currentAnim = this.anims.fall;
			}
			else if( this.standing) {
				vel.x = vel.x*.8;
				this.currentAnim = this.anims.idle;
			}
		}

		// move up or down
		if (ig.game.gravDir == ig.game.gravDirEnum.E || ig.game.gravDir == ig.game.gravDirEnum.W) {
			if (!this.standing) {
				this.currentAnim = this.anims.fall;
			}

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
				this.currentAnim = this.anims.fall;
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
				this.currentAnim = this.anims.fall;
			}
			else if( this.standing) {
				vel.y = vel.y*.8;
				this.currentAnim = this.anims.idle;
			}
		}
		
		this.currentAnim.flip.x = this.flip;
		
		
		// This sets the position and angle. We use the position the object
		// currently has, but always set the angle to 0 so it does not rotate
		//this.body.SetXForm(this.body.GetPosition(), 0);
		// move!
		this.parent();
	}
});

EntityPlayerDeath = ig.Entity.extend({

	size: {x: 22, y:32},
	offset: {x: 4, y: 0},
	callback: null,
	lifetime: 2,
	animSheet: new ig.AnimationSheet( 'media/resprite.png', 32, 32 ),

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.idleTimer = new ig.Timer();
		// Add the animations
		this.addAnim( 'idle', 1, [1] );
		
	},

	update: function() {
		if (this.idleTimer.delta() > this.lifetime) {
			this.kill();
			if(this.callback)
				this.callback();
			return;
		}
	},
});

});
