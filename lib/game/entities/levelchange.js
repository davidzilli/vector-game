/*
This entity calls ig.game.loadLevel() when its triggeredBy() method is called -
usually through an EntityTrigger entity.


Keys for Weltmeister:

level
	Name of the level to load. E.g. "LevelTest1" or just "test1" will load the 
	'LevelTest1' level.
*/

ig.module(
	'game.entities.levelchange'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityLevelchange = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(0, 0, 255, 0.7)',
	
	size: {x: 8, y: 8},
	level: null,
	
	triggeredBy: function( entity, trigger ) {	
		if( this.level ) {
			
			if (ig.game.gravDir == this.orientation || this.orientation < 0){
				var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function( m, l, a, b ) {
					return a.toUpperCase() + b;
				});
				
				ig.game.curLevel = 'Level'+levelName;
				ig.game.loadLevelDeferred( ig.global['Level'+levelName] );
				ig.game.gravDir = this.levelStartGravDir;
				ig.game.levelStartGravDir = this.levelStartGravDir;

			}
		}
	},
	
	update: function(){}
});

});