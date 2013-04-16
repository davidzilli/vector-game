/*
this entity changes the direction of gravity in the world.

Keys for Weltmeister:

eastWest
	sets the x value of the b2.Vec2

northSouth
	sets the y value of the b2.Vec2
*/

ig.module(
	'game.entities.changegravity'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityChangegravity = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
	
	size: {x: 8, y: 8},
	northSouth: 0,
	eastWest: 0,
	gravDir: 0,
		
	triggeredBy: function( entity, trigger ) {	
		var gravity = new b2.Vec2(this.eastWest, this.northSouth);
		ig.world.SetGravity(gravity);
		ig.game.gravDir = this.gravDir;
	},
	
	update: function(){}
});

});