var tips = {
			cards: { 'controls' : 'url(media/t1.png)',
					 'vector'   : 'url(media/t2.png)',
					 'goal'     : 'url(media/t3.png)',
					 'kill'     : 'url(media/t4.png)'
			},
			
			global: {
				killCount: 0,
				callback:''
			},
			
			show: function(type, callback){
				if (this.cards[type]){
					$('#messageBox').css('background-image',this.cards[type]);
					$('#overlay').fadeIn('fast');
					if (callback !== undefined){
						this.global.callback = callback; 
					}
				}
			},
			
			hide: function(){
				if (this.global.callback != ''){
					if (this.cards[this.global.callback]){
						tips.show(this.global.callback);
					}
					this.global.callback = '';
				}else{
					$('#overlay').fadeOut('fast');
				}
			}
		
		};