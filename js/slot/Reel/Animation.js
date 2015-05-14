Mirage.Slot.Reel.Animation = function(reel){

	this.animating = false;

	this.freezing = false;



	this.reel = reel;

	this.lastOffset = null;

	this.speed = 40;

	this._speed = 40;

	this._speedTo = false;
	this._speedToInterval = 20;
	this._speedToCallback = null;
	this.back = false;

	this.tickData = {};

	this.state = this.STATE_NONE;

	this.sc = {
		startingTick:       null,
		startingFirstTick:  null,

		startingDistance :  null,

		middleTick:         null,
		middleFirstTick:    null,
		middleDistance :    null,

		stoppingTick:       null,
		stoppingFirstTick:  null,
		stoppingDistance :  null
	};

	this.timers = {};

};

Mirage.Slot.Reel.Animation.prototype = {

	STATE_NONE: 0,
	STATE_STARTING: 1,
	STATE_MIDDLE: 2,
	STATE_STOPPING: 3,

	/**
	 * @param lastTime
	 */
	animate: function(lastTime){
		lastTime = lastTime || false;
		var isFirstTick = lastTime === false, that = this, now;

		if(isFirstTick){
			this.animating = true;
		}

		if(!this.freezing){
			now = Date.now();
			var interval = lastTime?now - lastTime:false;
		//	if(this.reel.getIndex()===0)console.log('Animating  TICK');
			this.tick(interval);

			this.reel.draw();

		}

		if(this.animating){
			now = Date.now();
			this._aReg(function(){
				that.animate(now);
			});
		}else{
			this.reset();
		}

	},

	reset: function(){
		this.freezing = false;
		this.animating = false;

		this.speed = this._speed;
		this.state = this.STATE_NONE;
		this.tickData = {};

		this.counters = {};
		this.timers = {};
		this.flags = {};


		this._speedTo = false;
		this._speedToInterval = 20;
	},

	_aReg: function(callback){
		return Mirage.Slot.Reel.Animation.requestAnimationFrame(callback);
	},

	/**
	 * @param speed
	 */
	setSpeed: function(speed){
		this._speed = speed;
		this.speed = speed;
	},

	/**
	 * @param interval
	 */
	tick: function(interval){
		this.tickData.isStart = interval === false;
		this.tickData.interval = interval;
		this._beforeTick();
		var offsetPerFrame = this.tickData.offsetPerFrame = !this.tickData.isStart?(this.speed / 60) * interval:0;
		if(offsetPerFrame){
			if(this.back){
				this.offsetBack(offsetPerFrame);
			}else{
				this.offsetForward(offsetPerFrame);
			}
		}
	},

	/**
	 * @param length
	 * @private
	 */
	offsetBack: function(length){
		this._manipulateOffset(length,false);
	},

	/**
	 * @param length
	 * @private
	 */
	offsetForward: function(length){
		this._manipulateOffset(length,true);
	},

	/**
	 *
	 * @param length
	 * @param forward
	 * @private
	 */
	_manipulateOffset: function(length,forward){
		this.lastOffset = this.reel.offset;
		var max = this.reel.slot.entityHeight;
		var residue = forward?
			(this.reel.offset < 0?max + (-this.reel.offset):max - this.reel.offset):
			(this.reel.offset > 0?max + this.reel.offset:max - (-this.reel.offset));


		if(length >= residue){
			var browsing = 1;
			var first = true;
			while(length >= max){
				if(first){
					length-= residue;
					first = false;
				}else{
					length-= max;
					browsing++;
				}
			}
			for(var i =0;i< browsing;i++){
				//if(this.reel.getIndex()===0)console.log('nextDistance');
				this.reel.order[(forward?'next':'prev')]();
				if(this._onDistance()===false){
					this.reel.offset = 0;
					return;
				}
			}
			//if(this.reel.getIndex()===0)console.log('residue',length,residue);

			if(forward){



				this.reel.offset = length;

				if(this.lastOffset < 0 && this.reel.offset >= 0){
					if(this._onDistance()===false){
						this.reel.offset = 0;
					}
				}

			}else{

				this.reel.offset = -length;


				if(this.lastOffset > 0 && this.reel.offset <= 0){
					if(this._onDistance()===false){
						this.reel.offset = 0;
					}
				}

			}
		}else{
			//if(this.reel.getIndex()===0)console.log('not residue',length,residue);
			if(forward){


				this.reel.offset+= length;

				if(this.lastOffset < 0 && this.reel.offset >= 0){
					if(this._onDistance()===false){
						this.reel.offset = 0;
					}
				}


			}else{


				this.reel.offset-= length;

				if(this.lastOffset > 0 && this.reel.offset <= 0){
					if(this._onDistance()===false){
						this.reel.offset = 0;
					}
				}

			}
		}
	},


	_onDistance: function(){

		switch(this.state){

			case this.STATE_STARTING:
				if(this.sc.startingDistance)this.sc.startingDistance.call(this);

				break;

			case this.STATE_MIDDLE:
				if(this.sc.middleDistance)this.sc.middleDistance.call(this);
				break;

			case this.STATE_STOPPING:
				if(this.sc.stoppingDistance){
					if(this.sc.stoppingDistance.call(this)===false){
						return false;
					}
				}
				break;
		}
	},

	/**
	 * @param needle
	 * @param perSecond
	 * @param callback
	 */
	changeSpeed: function(needle,perSecond,callback){
		this._speedTo = needle || false;
		this._speedToInterval = perSecond || 20;
		this._speedToCallback = callback || false;
	},

	_beforeTick: function(){
		var stc = false,changePerFrame;
		if(this._speedTo!==false){
			changePerFrame = (this._speedToInterval / 60) * this.tickData.interval;

			if(this.speed < this._speedTo){
				this.speed+= changePerFrame;
				if(this.speed > this._speedTo){
					this.speed = this._speedTo;
					stc = true;
				}
			}else{
				this.speed-= changePerFrame;
				if(this.speed < this._speedTo){
					this.speed = this._speedTo;
					stc = true;

				}
			}
		}
		if(stc){
			this._speedTo = false;
			this._speedToInterval = 20;
			if(this._speedToCallback){
				this._speedToCallback.call(this);
			}
			this._speedToCallback = false;
		}


		if(this.state === this.STATE_NONE){
			if(this.tickData.isStart){
				this.state = this.STATE_STARTING;
				if(this.sc.startingFirstTick){
					this.sc.startingFirstTick.call(this);
				}
			}
		}


		if(this.state === this.STATE_STARTING){
			if(this.sc.startingTick)this.sc.startingTick.call(this);
		}

		if(this.state === this.STATE_MIDDLE){
			if(this.reel.stopping){
				this.state = this.STATE_STOPPING;
				if(this.sc.stoppingFirstTick){
					this.sc.stoppingFirstTick.call(this);
				}
			}else{
				if(this.sc.middleTick)this.sc.middleTick.call(this);
			}
		}

		if(this.state === this.STATE_STOPPING){
			if(this.sc.stoppingTick)this.sc.stoppingTick.call(this);
		}

	},


	/**
	 * @param name
	 * @param on
	 * @returns {number}
	 * @param reset
	 */
	counter: function(name,on,reset){
		on = on || 0;
		reset = true === reset;
		if(reset){
			this.counters[name] = 0;
		}
		if(on > 0){
			this.counterIncrement(name,on);
		}else if(on < 0){
			this.counterDecrement(name,-on);
		}
		return !this._counterCheck(name,false)?0:this.counters[name];
	},

	/**
	 * @param name
	 * @param on
	 */
	counterIncrement: function(name,on){
		on = on===undefined?1:on;
		if(typeof this.counters[name] !== 'number'){
			this.counters[name] = 0;
		}
		this.counters[name]+=on;
		return this.counters[name];
	},

	/**
	 * @param name
	 * @param on
	 * @returns {*}
	 */
	counterDecrement: function(name,on){
		on = on===undefined?1:on;
		if(typeof this.counters[name] !== 'number'){
			this.counters[name] = 0;
		}
		this.counters[name]-=on;
		return this.counters[name];
	},

	/**
	 * @param name
	 * @returns {boolean}
	 * @private
	 */
	_counterCheck: function(name){
		if(typeof this.counters[name] !== 'number'){
			this.counters[name] = 0;
		}return true;
	},


	timerInterval: function(name){
		var now = Date.now();
		if(!this.timers[name]){
			this.timers[name] = now;
			return 0;
		}
		return now - this.timers[name];
	},

	timerReset: function(name){
		if(this.timers[name]){
			this.timers[name] = undefined;
		}
	},

	flag: function(name,value){
		if(value === undefined){
			return this.flags[name];
		}else{
			this.flags[name] = value;
			return this.flags[name];
		}
	}

};

Mirage.Slot.Reel.Animation.requestAnimationMethod = null;
Mirage.Slot.Reel.Animation.requestAnimationFrame = function(callback){
	if(!Mirage.Slot.Reel.Animation.requestAnimationMethod){
		Mirage.Slot.Reel.Animation.requestAnimationMethod = window.requestAnimationFrame;
		if(!Mirage.Slot.Reel.Animation.requestAnimationMethod){
			Mirage.Slot.Reel.Animation.requestAnimationMethod = window[Mirage.Slot.engineParamName('requestAnimationFrame',false)];
		}
		if(!Mirage.Slot.Reel.Animation.requestAnimationMethod){
			Mirage.Slot.Reel.Animation.requestAnimationMethod = function(callback){window.setTimeout(callback, 1000 / 60);}
		}
	}
	return Mirage.Slot.Reel.Animation.requestAnimationMethod.call(window,callback);
};

Mirage.Slot.Reel.Animation.cancelAnimationMethod = null;
Mirage.Slot.Reel.Animation.cancelAnimationFrame = function(animationId){
	if(!Mirage.Slot.Reel.Animation.cancelAnimationMethod){
		Mirage.Slot.Reel.Animation.cancelAnimationMethod = window.cancelRequestAnimationFrame;
		if(!Mirage.Slot.Reel.Animation.cancelAnimationMethod){
			Mirage.Slot.Reel.Animation.cancelAnimationMethod = window[Mirage.Slot.engineParamName('cancelRequestAnimationFrame',false)];
		}
		if(!Mirage.Slot.Reel.Animation.cancelAnimationMethod){
			Mirage.Slot.Reel.Animation.cancelAnimationMethod = clearTimeout;
		}
	}
	return Mirage.Slot.Reel.Animation.cancelAnimationMethod.call(window,animationId);
};