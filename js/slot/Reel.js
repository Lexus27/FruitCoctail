var Mirage = Mirage || {};

/**
 * Лента барабана
 * Mirage.Slot.Reel
 * @constructor
 */
Mirage.Slot.Reel = function(spinInterval){

	/**
	 * @type {Mirage.Slot}
	 */
	this.slot = null;

	/**
	 *
	 * @type {boolean|number}
	 */
	this.internalIndex = false;

	/**
	 * @type {Element}
	 */
	this.canvas = null;

	/**
	 * @type {*|CanvasRenderingContext2D|CanvasRenderingContext2D}
	 */
	this.context = null;

	/**
	 * @type {Mirage.Slot.Reel.Order}
	 */
	this.order = new Mirage.Slot.Reel.Order();

	/**
	 * @type {Mirage.Slot.Reel.Animation}
	 */
	this.animation = new Mirage.Slot.Reel.Animation(this);

	/**
	 * @type {boolean}
	 */
	this.running = false;

	/**
	 * @type {boolean}
	 */
	this.stoping = false;

	/**
	 * @type {number}
	 */
	this.offset = 0;

};

Mirage.Slot.Reel.prototype = {

	/**
	 * @param {Mirage.Slot|null} slot
	 * @return {Mirage.Slot.Reel}
	 */
	setSlot: function(slot){
		var old = this.slot;
		if(old !== slot){
			this.slot = slot;
			this.internalIndex = false;
			if(slot){
				slot.addReel(this);
				this.order.setSlot(slot);
			}
			if(old)old.removeReel(this);
		}
		return this;
	},

	/**
	 * @returns {null|Mirage.Slot}
	 */
	getSlot: function(){
		return this.slot;
	},

	/**
	 * @param {Element} element
	 */
	setElement: function(element){
		if(!this.canvas){
			var slot = this.getSlot();
			if(!slot){
				throw new Error('setElement must be after setSlot');
			}
			this.canvas = element;
			this.context = this.canvas.getContext('2d');
		}
		return this;
	},

	/**
	 *
	 * @returns {null|*}
	 */
	getElement: function(){
		return this.canvas;
	},

	/**
	 *
	 * @returns {*|CanvasRenderingContext2D}
	 */
	getContext: function(){
		return this.context;
	},



	onInitialized: function(){
		this.order.regenerate();
		this.draw();
	},

	/**
	 * @returns {boolean}
	 * @private
	 */
	shiftStoppingOrder: function(){
		if(this.stopping && this.stopping.order.length>0){
			var next = this.stopping.order.splice(-1,1)[0];
			this.order.setNext(next);
			return true;
		}
		return false;
	},

	/**
	 *
	 */
	start: function(){
		if(!this.running){
			this.reset();
			this.running = true;
			this.animation.animate(false);
		}
	},

	/**
	 * Остановить кручение барабанов
	 */
	stop: function(stopOrder,onStop,scope){
		if(this.running){
			Mirage.Slot.uniqueRandom(stopOrder,0,this.slot.entities.length-1,this.slot.entities.length);
			this.stopping = {
				fn: onStop,
				scope: scope,
				order: stopOrder
			};
		}
	},

	forceStop: function(){
		var stoppingFunction = this.stopping.fn;
		var stoppingScope = this.stopping.scope || this;
		this.reset();
		if(stoppingFunction)stoppingFunction.call(stoppingScope);
	},

	reset: function(){
		this.running            = false;
		this.stopping           = false;
		this.offset             = 0;
		this.animation.reset();
		this.draw();
	},

	/**
	 * Отрисовка изображений на канве
	 */
	draw: function(){

		var visible = this.slot.visibleSegmentCount,
		    context = this.getContext(),
		    i,entity,index,indexes;

		this.canvas.width = this.slot.entityWidth;
		this.canvas.height = this.slot.entityHeight * visible;

		context.clearRect ( 0 , 0 , this.canvas.width, this.canvas.height );

		if(this.offset > 0){
			index = this.order.getNext();
			entity = this.slot.getEntity(index);
			context.drawImage(entity.getImage(),
				0,//Координаты кадрирования X
				this.slot.entityHeight - this.offset,//Координаты кадрирования Y

				this.slot.entityWidth,//Ширина кадрирования
				this.offset,//Высота кадрирования

				0,//Координаты отображения на холсте X
				0,//Координаты отображения на холсте Y

				this.slot.entityWidth,//Ширина отображения
				this.offset //Высота отображения*/
			);
		}

		indexes = this.order.getRange(0,this.offset<0?visible+1:visible);
		//if(this.getIndex()===0)console.log(this.offset,indexes);
		for(i=0;i<indexes.length;i++){
			index = indexes[i];
			entity = this.slot.getEntity(indexes[i]);
			context.drawImage(entity.getImage(),
				0,//Координаты кадрирования X
				0,//Координаты кадрирования Y

				this.slot.entityWidth,//Ширина кадрирования
				this.slot.entityHeight,//Высота кадрирования

				0,//Координаты отображения на холсте X
				this.slot.entityHeight * i + this.offset,//Координаты отображения на холсте Y

				this.slot.entityWidth,//Ширина отображения
				this.slot.entityHeight //Высота отображения*/
			);
		}

	},

	getIndex: function(){
		if(this.internalIndex  === false )this.internalIndex = this.slot.searchReel(this);
		return this.internalIndex;
	}


};
