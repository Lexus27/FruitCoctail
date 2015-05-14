var Mirage = Mirage || {};

/**
 * Сущность слот автомата
 * @constructor
 */
Mirage.Slot.Entity = function(){

	/**
	 * @type {int}
	 */
	this.index = null;

	/**
	 * @type {string}
	 */
	this.src = null;

	/**
	 * @type {boolean}
	 */
	this.loaded = false;

	/**
	 * @type {boolean}
	 */
	this.loading = false;

	/**
	 * @type {Image}
	 */
	this.image = null;

	/**
	 *
	 * @type {Mirage.Slot}
	 */
	this.slot = null;

};
Mirage.Slot.Entity.prototype = {

	/**
	 * @param index
	 * @returns {Mirage.Slot.Entity}
	 */
	setIndex: function(index){
		this.index = index;
		return this;
	},

	/**
	 * @returns {null|*}
	 */
	getIndex: function(){
		return this.index;
	},

	/**
	 * @param url
	 * @returns {Mirage.Slot.Entity}
	 */
	setSrc: function(url){
		this.src = url;
		return this;
	},

	/**
	 * @returns {null|*}
	 */
	getSrc: function(){
		return this.src;
	},

	/**
	 * @param {Mirage.Slot} slot
	 */
	setSlot: function(slot){
		this.slot = slot;
	},

	/**
	 * @returns {Mirage.Slot}
	 */
	getSlot: function(){
		return this.slot;
	},

	getImage: function(){
		return this.image;
	},

	/**
	 * @returns {boolean}
	 */
	wasLoaded: function(){
		return this.loaded;
	},

	/**
	 * @returns {boolean}
	 */
	isLoading: function(){
		return this.loading;
	},

	/**
	 *
	 */
	load: function(){
		if(!this.loading && !this.loaded){
			var that = this;
			this.image = new Image();
			this.image.src = this.src;
			this.loading = true;
			this.image.addEventListener('load',function(){that.onLoadSuccess()},false);
			this.image.addEventListener('error',function(){that.onLoadError()},false);
		}
	},

	/**
	 * Событие загрузки изображения
	 */
	onLoadSuccess: function(){
		this.loaded = true;
		this.loading = false;
		this.getSlot().checkLoadedEntity(this);
	},

	/**
	 * Провал загрузки изображения
	 */
	onLoadError: function(){
		this.loading = false;
		alert('Error load entity image '+ this.src);
	}

};