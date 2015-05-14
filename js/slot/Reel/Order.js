Mirage.Slot.Reel.Order = function(){

	this.indexes = [];


	this.slot = null;

};

Mirage.Slot.Reel.Order.prototype = {


	/**
	 * @param {Mirage.Slot} slot
	 */
	setSlot: function(slot){
		this.slot = slot;
	},

	/**
	 * @param from
	 * @param to
	 * @returns {Array}
	 */
	getRange: function(from,to){
		var range = [];
		for(var i = from; i < to && i < this.indexes.length; i++){
			range.push(this.indexes[i]);
		}
		return range;
	},


	/**
	 * @returns {Mirage.Slot.Reel.Order}
	 */
	next: function(){
		this.indexes.splice(0,0,this.indexes.splice(-1,1)[0]);
		return this;
	},

	/**
	 * @returns {Mirage.Slot.Reel.Order}
	 */
	prev: function(){
		var first = this.indexes.splice(0,1)[0];
		this.indexes.push(first);
		return this;
	},

	/**
	 * @param index
	 * @returns {Mirage.Slot.Reel.Order}
	 */
	setNext: function(index){
		this.indexes.splice(-1,1,index);
		return this;
	},

	/**
	 * @returns {*}
	 */
	getNext: function(){
		return this.indexes[this.indexes.length-1];
	},

	/**
	 * @param index
	 * @returns {Mirage.Slot.Reel.Order}
	 */
	setPrev: function(index){
		this.indexes.splice(this.slot.visibleSegmentCount,1,index);
		return this;
	},

	/**
	 * @returns {*}
	 */
	getPrev: function(){
		return this.indexes[this.slot.visibleSegmentCount];
	},


	/**
	 * @returns {Mirage.Slot.Reel.Order}
	 */
	regenerate: function(){
		this.indexes = [];
		Mirage.Slot.uniqueRandom(this.indexes,0,this.slot.entities.length-1,this.slot.entities.length);
		return this;
	},

	/**
	 * @returns {Mirage.Slot.Reel.Order}
	 */
	refresh: function(){
		Mirage.Slot.uniqueRandom(this.indexes,0,this.slot.entities.length-1,this.slot.entities.length);
		return this;
	}

};