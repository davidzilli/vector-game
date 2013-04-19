/*
This entity kills the entity that is passed as the first argument to the triggeredBy() method.
and then reloads the current level (not very oop right now)


Keys for Weltmeister:

damage
	Damage to give to the entity that triggered this entity.
	Default: 10
*/

ig.module(
	'game.entities.kill'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityKill = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
	
	size: {x: 8, y: 8},
	lifetime: 2,
	triggered: false,

	init: function(x, y, settings ) {
		this.parent( x, y, settings );
		this.idleTimer = new ig.Timer();
	},
		
	triggeredBy: function( entity, trigger ) {	
		entity.kill();
		this.idleTimer.reset();
		this.triggered = true;
	},
	
	update: function(){
		if (this.idleTimer.delta() > this.lifetime && this.triggered) {
			ig.game.gravDir = ig.game.levelStartGravDir;
			ig.game.loadLevelDeferred( ig.global[ ig.game.curLevel ] );
		}
	}
});

});