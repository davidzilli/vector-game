ig.module(
	'game.entities.crate'
)
.requires(
	'plugins.box2d.entity'
)
.defines(function(){

EntityCrate = ig.Box2DEntity.extend({
	size: {x: 32, y: 32},
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,
	
	animSheet: new ig.AnimationSheet( 'media/box.png', 32, 32 ),

	createBody: function () {
		var crateDef = new b2.BodyDef();
		crateDef.allowSleep = false;
		crateDef.linearDamping = 0;

		crateDef.position.Set (
			(this.pos.x + this.size.x / 2) * b2.SCALE, 
			(this.pos.y + this.size.y / 2) * b2.SCALE
		);

		this.body = ig.world.CreateBody(crateDef);

		var shapeDef = new b2.PolygonDef();
		shapeDef.SetAsBox(this.size.x/2 * b2.SCALE, this.size.y / 2 * b2.SCALE);
		shapeDef.friction = 1;
		shapeDef.restitution = .1;
		shapeDef.density = 1;


		this.body.CreateShape(shapeDef);
		this.body.SetMassFromShapes();
	},
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 1, [0] );
		this.parent( x, y, settings );
	}
});


});
