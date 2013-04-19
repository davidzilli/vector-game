/*
This entity displays text on the screen for a certain duration then kills itself
after lifetime: seconds


Keys for Weltmeister:

lifetime:
	display time in seconds

message:
	string to display

position:
	postion of text x,y
*/

ig.module(
	'game.entities.text'
)
.requires(
	'impact.entity'
)
.defines(function(){
	
EntityText = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
	
	lifetime: 2,
	triggered: false,
	font: new ig.Font( 'media/04b03.font.png' ),
	message: "",

	init: function(x, y, settings ) {
		this.parent( x, y, settings );
		this.idleTimer = new ig.Timer();
	},
		
	triggeredBy: function( entity, trigger ) {
		this.idleTimer.reset();
		this.triggered = true;
		console.log("Triggered text");
		
	},

	draw: function() {
		this.parent();
		if (this.idleTimer.delta() < this.lifetime && this.triggered) {
			this.font.draw( this.message, this.pos.x, this.pos.y );	
		}
	},
	
	update: function(){
		//triggered and time's up
		if (this.idleTimer.delta() > this.lifetime && this.triggered) {
			console.log("Killing text");
			this.kill();
		}
	}
});

});