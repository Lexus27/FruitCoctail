(function($){


	var resizeCallback = function(){
		var k = 1.33;
		var height = $(window).height();
		$(".game").css({"width": (height * k) + "px"});
		$(".bg").css({"width": (height * k) + "px"});
	};
	resizeCallback();
	$(window).resize(function(){
		resizeCallback();
	});

	$(window).load(function(){

		$(".spinner-bg").fadeOut();
		$(".spinner").fadeOut();

		(function(){
			var slot = new Mirage.Slot;

			/**
			 * Пропорции !Реальных размеров изображений сущнойстей!
			 */
			slot.setEntityProportion(600,600);

			slot.setSpeedScatter(0);
			slot.setDefaultSpeed(400);

			slot.setStartRandomOrder(false);
			slot.setStartIntervals(0,0);


			slot.setStopRandomOrder(false);
			slot.setStopIntervals(50,50);
			slot.setStopBrakingOffsetDistance(1);


			slot.reelInit = function(reel){

				reel.animation.sc = {
					startingTick:       function(){
						if(this.timerInterval('starting') > 300){
							this.back = false;
							this.state = this.STATE_MIDDLE;
						}
					},
					startingFirstTick:  function(){
						this.back = true;
						this.speed = 10;
						this.changeSpeed(this._speed,200);
						console.log('back');
					},

					startingDistance :  null,

					middleTick:         null,
					middleFirstTick:    null,
					middleDistance :    null,

					stoppingTick:       null,
					stoppingFirstTick:  null,
					stoppingDistance :  function(){

						if(this.flag('stopRollback')){
							this.reel.forceStop();
							return false;
						}

						if(!this.reel.shiftStoppingOrder()){
							this.changeSpeed(5,100,function(){
								this.speed = this._speed;
								this.back = true;
								this.flag('stopRollback',true);
							});
						}
					}
				};

			};


			var entities = [];
			for(var i=0;i<9;i++){
				entities.push((new Mirage.Slot.Entity()).setIndex(i).setSrc('images/icons/icon'+(i+1)+'.png'));
			}
			slot.setEntities(entities);
			slot.setVisualSegmentCount(3);

			slot.addReel(
				(new Mirage.Slot.Reel())).setElement(document.getElementById('reel1')
			);

			slot.addReel(
				(new Mirage.Slot.Reel())).setElement(document.getElementById('reel2')
			);

			slot.addReel(
				(new Mirage.Slot.Reel())).setElement(document.getElementById('reel3')
			);

			slot.addReel(
				(new Mirage.Slot.Reel())).setElement(document.getElementById('reel4')
			);

			slot.addReel(
				(new Mirage.Slot.Reel())).setElement(document.getElementById('reel5')
			);


			/**
			 * Иницилизация слот автомата и его сущностей
			 */
			slot.initialize();

			var playBtn = document.getElementById('play');
			playBtn.addEventListener('click',function(){
				slot.run(function(){


					$.ajax({
						dataType: 'json',
						type: 'POST',
						url: 'http://ysvyato.bget.ru/game/crazy_monkey/barrelThrow',
						data: {
							bet: 1,
							bet_lines: 9
						},
						success: function (data, status) {
							setTimeout(function(){
								slot.stop(function(barrelIndex){
									return data.object.matrix[barrelIndex];
								},null,window);
							},20);
						},
						async: true
					});


				});
			},false);
		})();

	});

})(jQuery);

