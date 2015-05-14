var Mirage = Mirage || {};

/**
 * Сам слот автомат
 *  Mirage.Slot
 * @constructor
 */
Mirage.Slot = function(){

	/**
	 * @type {Mirage.Slot.Reel[]}
	 */
	this.reels = [];

	/**
	 * @type {string}
	 */
	this.userAgent =
		((/webkit/i).test(navigator.appVersion) ? 'webkit' :
		(/firefox/i).test(navigator.userAgent)  ? 'firefox':
		(/msie/i).test(navigator.userAgent)     ? 'ie'     :
		'opera' in window                       ? 'opera'  : '' );

	/**
	 * @type {{webkit: string, firefox: string, ie: string, opera: string}}
	 */
	this.enginePrefixes = {
		webkit:     'webkit',
		firefox:    'moz',
		ie:         'ms',
		opera:      'o'
	};

	/**
	 * @type {Mirage.Slot.Entity[]}
	 */
	this.entities = [];

	/**
	 * @type {number}
	 */
	this.entitiesLoadedCount = 0;

	/**
	 * @type {boolean}
	 */
	this.initialized = false;

	/**
	 * @type {boolean}
	 */
	this.initializing = false;

	/**
	 * @type {boolean}
	 */
	this.running = false;

	/**
	 *
	 * @type {int}
	 */
	this.entityHeight = 600;

	/**
	 *
	 * @type {int}
	 */
	this.entityWidth = 600;


	/**
	 * @type {Element}
	 */
	this.frameEl = null;

	/**
	 * @type {number}
	 */
	this.visibleSegmentCount = 3;

	/**
	 *
	 * @type {number}
	 */
	this.defaultSpeed = 600;

	/**
	 * @type {number}
	 */
	this.speedScatter = 30;

	/**
	 *
	 * @type {number|Function}
	 */
	this.brakingSpeedStep = 100;

	/**
	 * @type {number|Function}
	 */
	this.brakingRollbackSpeed = this.defaultSpeed;

	/**
	 *
	 * @type {boolean}
	 */
	this.rollbackOnBrake = true;

	/**
	 * @type {number|Function}
	 */
	this.rollbackSpeed = 600;

	/**
	 * @type {boolean}
	 */
	this.rollbackOnStart = true;

	/**
	 * @type {number}
	 */
	this.stopIntervalMin = 60;

	/**
	 * @type {number}
	 */
	this.stopIntervalMax = 150;

	/**
	 * @type {number}
	 */
	this.startIntervalMin = 60;

	/**
	 * @type {number}
	 */
	this.startIntervalMax = 150;


	/**
	 *
	 * @type {number}
	 */
	this.startedReelsCount = 0;

	/**
	 * @type {boolean}
	 */
	this.startedComplete = false;

	/**
	 *
	 * @type {Function|null}
	 */
	this.startedFunction = null;


	/**
	 *
	 * @type {boolean}
	 */
	this.runRandomOrder = true;

	/**
	 *
	 * @type {boolean}
	 */
	this.stopRandomOrder = true;

	/**
	 *
	 * @type {number}
	 */
	this.stopBrakingOffsetDistance = 2;

	/**
	 *
	 * @type {null}
	 */
	this.beforeRunReel = null;

};
Mirage.Slot.prototype = {


	/**
	 * @param h
	 * @param w
	 */
	setEntityProportion: function(h,w){
		this.entityHeight = h;
		this.entityWidth = w;
	},

	/**
	 * @param {int} count
	 */
	setVisualSegmentCount: function(count){
		if(count > this.entities.length){
			throw new Error('setVisualSegmentCount must be less than entities count');
		}
		this.visibleSegmentCount = count;
	},

	setStopBrakingOffsetDistance: function(count){
		this.stopBrakingOffsetDistance = count;
	},

	/**
	 * @param random
	 */
	setStartRandomOrder: function(random){this.runRandomOrder = random;},

	/**
	 * @param random
	 */
	setStopRandomOrder: function(random){this.stopRandomOrder = random;},

	/**
	 * @param speed
	 */
	setDefaultSpeed: function(speed){
		this.defaultSpeed = speed;
	},

	/**
	 * @param scatter
	 */
	setSpeedScatter: function(scatter){
		this.speedScatter = scatter;
	},

	/**
	 * @param min
	 * @param max
	 */
	setStartIntervals: function(min,max){
		this.startIntervalMin = min;
		this.startIntervalMax = max;
	},

	/**
	 * @param min
	 * @param max
	 */
	setStopIntervals: function(min,max){
		this.stopIntervalMin = min;
		this.stopIntervalMax = max;
	},

	/**
	 * @param originalKey
	 * @param inCssPlainDeclaration
	 * @returns {string}
	 */
	engineParamName: function(originalKey,inCssPlainDeclaration){
		inCssPlainDeclaration = inCssPlainDeclaration === true;
		return inCssPlainDeclaration
			?('-'+this.enginePrefixes[this.userAgent]+'-'+originalKey)
			:(this.enginePrefixes[this.userAgent]+originalKey)
		;
	},


	/**
	 * @param reel
	 * @returns Mirage.Slot
	 */
	addReel: function(reel){
		var i = this.searchReel(reel);
		if(i===false){
			this.reels.push(reel);
			reel.setSlot(this);
		}
		return reel;
	},

	/**
	 * @param reel
	 * @returns int|bool
	 */
	searchReel: function(reel){
		for(var i = 0;i < this.reels.length;i++){
			if(this.reels[i]===reel){
				return i;
			}
		}
		return false;
	},

	/**
	 * @param reel
	 * @returns Mirage.Slot
	 */
	removeReel: function(reel){
		var i = this.searchReel(reel);
		if(i!==false){
			this.reels.splice(i,1);
			reel.setSlot(null);
		}
		return this;
	},

	/**
	 * @param index
	 * @returns {Mirage.Slot.Reel}
	 */
	getReel: function(index){
		return this.reels[index];
	},



	/**
	 * @param {Mirage.Slot.Entity[]} entities
	 * @returns {Mirage.Slot}
	 */
	setEntities: function(entities){
		for(var i=0;i<entities.length;i++){
			if(entities[i] instanceof Mirage.Slot.Entity){
				this.entities.push(entities[i]);
				entities[i].setSlot(this);
			}else{
				throw new TypeError('setEntities must passed Mirage.Slot.Entity array');
			}
		}
		return this;
	},

	/**
	 * @param {int} index
	 * @returns {Mirage.Slot.Entity|null}
	 */
	getEntity: function(index){
		for(var i=0;i<this.entities.length;i++){
			var entity = this.entities[i];
			if(entity.getIndex() === index){
				return entity;
			}
		}
		return null;
	},

	/**
	 * @param {HTMLElement} el
	 */
	setFrameEl: function(el){
		this.frameEl = el;
	},

	/**
	 * @returns {HTMLElement}
	 */
	getFrameEl: function(){
		return this.frameEl;
	},

	/**
	 *
	 */
	initialize: function(callback,scope){
		scope = scope || window;
		if(!this.initializing && !this.initialized){
			this.initializing = true;
			if(callback){
				this.onInitializedCallback = [callback,scope];
			}else{
				this.onInitializedCallback = null;
			}
			for(var i =0;i < this.entities.length;i++){
				this.entities[i].load();
			}
		}
	},

	/**
	 *
	 */
	onInitialized: function(){
		if(!this.initialized && this.initializing){
			this.initialized = true;
			this.initializing = false;
			for(var i =0;i < this.reels.length;i++){
				this.reels[i].onInitialized();
				if(this.reelInit){
					this.reelInit.call(this,this.reels[i]);
				}
			}
			if(this.onInitializedCallback){
				var c = this.onInitializedCallback;
				c[0].call(c[1]|window,this);
			}
		}
	},

	/**
	 *
	 * @param start
	 * @param scope
	 */
	run: function(start,scope){
		if(this.initialized && !this.running){
			this.running = true;
			this.startedComplete = false;
			this.startedFunction = null;
			this.startedReelsCount = 0;
			var that = this;
			var speedLines = false;
			if(this.speedScatter){
				speedLines = Mirage.Slot.Reel.uniqueRandom([],this.defaultSpeed-this.speedScatter,this.defaultSpeed+this.speedScatter,this.reels.length);
			}
			var i = 0;
			var startingFunction;
			if(!this.startIntervalMin && !this.startIntervalMax){
				for(i = 0 ; i < this.reels.length; i++){
					var reel = this.reels[i];
					reel.animation.setSpeed(speedLines?speedLines[i]:this.defaultSpeed);
					console.log('speed',i,reel.animation._speed);
					reel.start();
					this.startedReelsCount++;
					if(this.startedReelsCount === this.reels.length){
						this.startedComplete = true;
						if(this.startedFunction)this.startedFunction.call(this);
					}
				}
			}else{
				var rIs,timeLines;
				if(this.startIntervalMin === this.startIntervalMax){
					timeLines = [];
					for(i = 0;i < this.reels.length;i++){
						timeLines[i] = this.startIntervalMin;
					}
				}else{
					timeLines = Mirage.Slot.Reel.uniqueRandom([],this.startIntervalMin,this.startIntervalMax,this.reels.length);
				}

				if(this.runRandomOrder){
					rIs = Mirage.Slot.Reel.uniqueRandom([],0,this.reels.length-1,this.reels.length);
				}else{
					rIs = [];
					for(i = 0;i < this.reels.length;i++){
						rIs[i] = i;
					}

				}
				i = 0;
				startingFunction = function(){
					setTimeout(function(){
						var reel = that.reels[rIs[i]];
						reel.animation.setSpeed(speedLines?speedLines[i]:that.defaultSpeed);
						reel.start();
						that.startedReelsCount++;
						if(that.startedReelsCount === that.reels.length){
							that.startedComplete = true;
							if(that.startedFunction)that.startedFunction.call(that);
						}
						i++;
						if(that.reels[rIs[i]]){
							startingFunction();
						}
					},timeLines[rIs[i]]);
				};
				startingFunction();
			}
			if(start){
				start.call(scope||window);
			}
		}

	},

	/**
	 *
	 * @param dataCallback
	 * @param onStopCallback
     * @param scope
	 */
	stop: function(dataCallback,onStopCallback,scope){
		if(this.running){
			var that = this;
			var stopped = 0;
			var onStop = function(){
				stopped++;
				if(stopped === that.reels.length){
					that.running = false;
					if(onStopCallback){
						onStopCallback.call(scope||window);
					}
				}
			};
			var stopFunction = function(){
				var i = 0;
				console.log('Stop');
				if(!that.stopIntervalMin && !that.stopIntervalMax){
					for(i = 0; i < that.reels.length; i++){
						var result = dataCallback?dataCallback.call(scope || window, i) : [];
						that.reels[i].stop(result, onStop, that);
					}
					console.log('StopAlready');
				}else{
					var rIs,timeLines;

					if(this.stopIntervalMin === this.stopIntervalMax){
						timeLines = [];
						for(i = 0;i < this.reels.length;i++){
							timeLines[i] = this.stopIntervalMin;
						}
					}else{
						timeLines = Mirage.Slot.Reel.uniqueRandom([], that.stopIntervalMin, that.stopIntervalMax, that.reels.length);
					}

					if(this.stopRandomOrder){
						rIs = Mirage.Slot.Reel.uniqueRandom([], 0, that.reels.length - 1, that.reels.length);
					}else{
						rIs = [];
						for(i = 0;i < this.reels.length;i++){
							rIs[i] = i;
						}
					}
					i = 0;
					var stoppingFunction = function(){
						setTimeout(function(){
							var reel = that.reels[rIs[i]];
							var result = dataCallback?dataCallback.call(scope || window, rIs[i]) : [];
							reel.stop(result, onStop, that);
							i++;
							if(that.reels[rIs[i]]){
								stoppingFunction();
							}
						}, timeLines[rIs[i]]);
					};
					stoppingFunction();
				}
			};
			if(!this.startedComplete){
				this.startedFunction = stopFunction;
			}else{
				stopFunction.call(this);
			}


		}

	},

	/**
	 * @param entity
	 */
	checkLoadedEntity: function(entity){
		this.entitiesLoadedCount++;
		if(this.entitiesLoadedCount === this.entities.length){
			this.onInitialized();
		}
	}

};


Mirage.Slot.uniqueRandom = function(array,min,max,count){
	for(var i = 0; i < count; i++){
		if(array[i]===undefined){
			var integer;
			if(min === max){
				integer = min;
			}else{
				integer = Mirage.Slot.rand(min,max);
				if(count >= max - min){
					while(array.indexOf(integer)!==-1){
						integer = Mirage.Slot.rand(min,max);
					}
				}
			}

			array[i] = integer;
		}
	}
	return array;
};
Mirage.Slot.rand = function(min,max){
	return Math.round(min + Math.random() * (max - min));
};