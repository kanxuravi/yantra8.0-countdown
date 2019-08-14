

var Base = function() {
};

Base.extend = function(_instance, _static) { 
	
	"use strict";
	
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this();
	extend.call(proto, _instance);
  proto.base = function() {
  };
	delete Base._prototyping;
	
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { 
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] !== null) {
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	if (typeof klass.init == "function") klass.init();
	return klass;
};

Base.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { 
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && 
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				var method = value.valueOf();
				value = function() {
					var previous = this.base || Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Base.toString;
			}
			this[source] = value;
		} else if (source) { 
			var extend = Base.prototype.extend;
			if (!Base._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			var hidden = ["constructor", "toString", "valueOf"];
			var i = Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	}
};

Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	version: "1.1",
	
	forEach: function(object, block, context) {
		for (var key in object) {
			if (this.prototype[key] === undefined) {
				block.call(context, object[key], key, object);
			}
		}
	},
		
	implement: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "function") {
				arguments[i](this.prototype);
			} else {
				this.prototype.extend(arguments[i]);
			}
		}
		return this;
	},
	
	toString: function() {
		return String(this.valueOf());
	}
});

var FlipClock;
	
/**
 * CustomizedFlipClock.js
 *
 * @author     kanxuravi
 */
	
(function($) {
	
	"use strict";
	
	FlipClock = function(obj, digit, options) {
		return new FlipClock.Factory(obj, digit, options);
	};

	
	FlipClock.Lang = {};
	
	FlipClock.Base = Base.extend({
		
		 
		constructor: function(_default, options) {
			if(typeof _default !== "object") {
				_default = {};
			}
			if(typeof options !== "object") {
				options = {};
			}
			this.setOptions($.extend(true, {}, _default, options));
		},

		callback: function(method) {
		 	if(typeof method === "function") {
				var args = [];
								
				for(var x = 1; x <= arguments.length; x++) {
					if(arguments[x]) {
						args.push(arguments[x]);
					}
				}
				
				method.apply(this, args);
			}
		},
		 	
		 
		log: function(str) {
			if(window.console && console.log) {
				console.log(str);
			}
		},
	
		 
		getOption: function(index) {
			if(this[index]) {
				return this[index];
			}
			return false;
		},

		getOptions: function() {
			return this;
		},
		

		setOption: function(index, value) {
			this[index] = value;
		},

		setOptions: function(options) {
			for(var key in options) {
	  			if(typeof options[key] !== "undefined") {
		  			this.setOption(key, options[key]);
		  		}
		  	}
		}
		
	});
	
	FlipClock.Factory = FlipClock.Base.extend({
			
		 
		autoStart: true,

		callbacks: {
			destroy: false,
			create: false,
			init: false,
			interval: false,
			start: false,
			stop: false,
			reset: false
		},
	
		 
		classes: {
			active: 'flip-clock-active',
			before: 'flip-clock-before',
			divider: 'flip-clock-divider',
			dot: 'flip-clock-dot',
			label: 'flip-clock-label',
			flip: 'flip',
			play: 'play',
			wrapper: 'flip-clock-wrapper'
		},
		

		clockFace: 'HourlyCounter',
		defaultClockFace: 'HourlyCounter',	 
		defaultLanguage: 'english',
		language: 'english',
		lang: false,
		face: true,	
		 
		running: false,
		time: false,
		timer: false,
		lists: [],	
		 
		$wrapper: false,
		constructor: function(obj, digit, options) {
			
			this.lists 	  = [];
			this.running  = false;
			this.base(options);		
			this.$wrapper = $(obj).addClass(this.classes.wrapper);
			this.time     = new FlipClock.Time(this, digit ? Math.round(digit) : 0);
			this.timer    = new FlipClock.Timer(this, options);

			this.lang     = this.loadLanguage(this.language);
			this.face     = this.loadClockFace(this.clockFace, options);

			if(this.autoStart) {
				this.start();
			}
		},
		
		loadClockFace: function(name, options) {	
			var face, suffix = 'Face';
			
			name = name.ucfirst()+suffix;
			
			if(FlipClock[name]) {
				face = new FlipClock[name](this, options);
			}
			else {
				face = new FlipClock[this.defaultClockFace+suffix](this, options);
			}
			
			face.build();
				
			return face;
		},
			
		loadLanguage: function(name) {	
			var lang;
			
			if(FlipClock.Lang[name.ucfirst()]) {
				lang = FlipClock.Lang[name.ucfirst()];
			}
			else if(FlipClock.Lang[name]) {
				lang = FlipClock.Lang[name];
			}
			else {
				lang = FlipClock.Lang[this.defaultLanguage];
			}
			
			return lang;
		},
					
		localize: function(index, obj) {
			var lang = this.lang;

			if(!index) {
				return null;
			}

			var lindex = index.toLowerCase();

			if(typeof obj == "object") {
				lang = obj;
			}

			if(lang && lang[lindex]) {
				return lang[lindex];
			}

			return index;
		},

		start: function(callback) {
			var t = this;

			if(!t.running && (!t.countdown || t.countdown && t.time.time > 0)) {
				t.face.start(t.time);
				t.timer.start(function() {
					t.flip();
					
					if(typeof callback === "function") {
						callback();
					}	
				});
			}
			else {
				t.log('Trying to start timer when countdown already at 0');
			}
		},
		
		stop: function(callback) {
			this.face.stop();
			this.timer.stop(callback);
			
			for(var x in this.lists) {
				this.lists[x].stop();
			}	
		},
		reset: function(callback) {
			this.timer.reset(callback);
			this.face.reset();
		},
		
		setTime: function(time) {
			this.time.time = time;
			this.face.setTime(time);		
		},
		
		 
		getTime: function(time) {
			return this.time;		
		},
		
		setCountdown: function(value) {
			var running = this.running;
			
			this.countdown = value ? true : false;
				
			if(running) {
				this.stop();
				this.start();
			}
		},
		
		flip: function() {
			this.face.flip();
		}
		
	});
	
	 
	FlipClock.Face = FlipClock.Base.extend({
		dividers: [],
		factory: false,
		lists: [],
		constructor: function(factory, options) {
			this.base(options);
			this.factory  = factory;
			this.dividers = [];
		},
		build: function() {},
		 
		createDivider: function(label, css, excludeDots) {
		
			if(typeof css == "boolean" || !css) {
				excludeDots = css;
				css = label;
			}

			var dots = [
				'<span class="'+this.factory.classes.dot+' top"></span>',
				'<span class="'+this.factory.classes.dot+' bottom"></span>'
			].join('');

			if(excludeDots) {
				dots = '';	
			}

			label = this.factory.localize(label);

			var html = [
				'<span class="'+this.factory.classes.divider+' '+(css ? css : '').toLowerCase()+'">',
					'<span class="'+this.factory.classes.label+'">'+(label ? label : '')+'</span>',
					dots,
				'</span>'
			];	
			
			return $(html.join(''));
		},
		createList: function(digit, options) {
			if(typeof digit === "object") {
				options = digit;
				digit = 0;
			}
			
			var obj = new FlipClock.List(this.factory, digit, options);

			
			return obj;
		},
		
		 
		reset: function() {},
		
		setTime: function(time) {
			this.flip(time);		
		},
		addDigit: function(digit) {
			var obj = this.createList(digit, {
				classes: {
					active: this.factory.classes.active,
					before: this.factory.classes.before,
					flip: this.factory.classes.flip
				}
			});
			
			obj.$obj.insertBefore(this.factory.lists[0].$obj);
							
			this.factory.lists.unshift(obj);
		},
		
		/**
		 * Triggers when the clock is started
		 */
		 
		start: function() {},
		
		/**
		 * Triggers when the time on the clock stops
		 */
		 
		stop: function() {},
			
		/**
		 * Triggers when the numbers on the clock flip
		 */
		 
		flip: function(time, doNotAddPlayClass) {
			var t = this;
			
			if(!doNotAddPlayClass) {
				if(!t.factory.countdown) {
					t.factory.time.time++;
				}
				else {
					if(t.factory.time.time <= 0) {
						t.factory.stop();
					}
					
					t.factory.time.time--;	
				}
			}
			
			var offset = t.factory.lists.length - time.length;
			
			if(offset < 0) {
				offset = 0;
			}			
			
			var totalNew = 0;
			var reFlip = false;

			$.each(time, function(i, digit) {
				i += offset;
				
				var list = t.factory.lists[i];
					
				if(list) {
					var currentDigit = list.digit;
			
					list.select(digit);
					
					if(digit != currentDigit && !doNotAddPlayClass) {
						list.play();	
					}
				}	
				else {
					t.addDigit(digit);
					reFlip = true;
				}
			});

			for(var x = 0; x < time.length; x++) {
				if(x >= offset && t.factory.lists[x].digit != time[x]) {
					t.factory.lists[x].select(time[x]);
				}
			}
		}
					
	});
		
	/**
	 * The FlipClock List class is used to build the list used to create 
	 * the card flip effect. This object fascilates selecting the correct
	 * node by passing a specific digit.
	 *
	 * @param 	object  A FlipClock.Factory object
	 * @param 	mixed   This is the digit used to set the clock. If an 
	 *				    object is passed, 0 will be used.	
	 * @param 	object  An object of properties to override the default	
	 */
	 	
	FlipClock.List = FlipClock.Base.extend({
		
		/**
		 * The digit (0-9)
		 */		
		 
		digit: 0,
		
		/**
		 * The CSS classes
		 */		
		 
		classes: {
			active: 'flip-clock-active',
			before: 'flip-clock-before',
			flip: 'flip'	
		},
				
		/**
		 * The parent FlipClock.Factory object
		 */		
		 
		factory: false,
		
		/**
		 * The wrapping jQuery object
		 */		
		 
		$obj: false,
		
		/**
		 * The items in the list
		 */		
		 
		items: [],
				 
		/**
		 * Constructor
		 *
		 * @param  object  A FlipClock.Factory object
		 * @param  int     An integer use to select the correct digit
		 * @param  object  An object to override the default properties	 
		 */
		 
		constructor: function(factory, digit, options) {
			this.factory = factory;
			this.digit   = digit;
			this.$obj    = this.createList();
			
			if(digit > 0) {
				this.select(digit);
			}
			
			this.factory.$wrapper.append(this.$obj);
		},
		
		/**
		 * Select the digit in the list
		 *
		 * @param  int  A digit 0-9	 
		 */
		 
		select: function(digit) {
			if(typeof digit === "undefined") {
				digit = this.digit;
			}
			else {
				this.digit = digit;
			}

			var target = this.$obj.find('[data-digit="'+digit+'"]');
			var active = this.$obj.find('.'+this.classes.active).removeClass(this.classes.active);
			var before = this.$obj.find('.'+this.classes.before).removeClass(this.classes.before);
			
			if(!this.factory.countdown) {
				if(target.is(':first-child')) {
					this.$obj.find(':last-child').addClass(this.classes.before);
				}
				else {
					target.prev().addClass(this.classes.before);
				}
			}
			else {
				if(target.is(':last-child')) {
					this.$obj.find(':first-child').addClass(this.classes.before);
				}
				else {
					target.next().addClass(this.classes.before);
				}
			}
			
			target.addClass(this.classes.active);			
		},
		
		/**
		 * Adds the play class to the DOM object
		 */
		 		
		play: function() {
			this.$obj.addClass(this.factory.classes.play);
		},
		
		/**
		 * Removes the play class to the DOM object 
		 */
		 
		stop: function() {
			var t = this;
			
			setTimeout(function() {
				t.$obj.removeClass(t.factory.classes.play);
			}, this.factory.timer.interval);
		},
		
		/**
		 * Create the list of digits and appends it to the DOM object 
		 */
		 
		createList: function() {
		
			var html = $('<ul class="'+this.classes.flip+' '+(this.factory.running ? this.factory.classes.play : '')+'" />');
			
			for(var x = 0; x < 10; x++) {
				var item = $([
				'<li data-digit="'+x+'">',
					'<a href="#">',
						'<div class="up">',
							'<div class="shadow"></div>',
							'<div class="inn">'+x+'</div>',
						'</div>',
						'<div class="down">',
							'<div class="shadow"></div>',
							'<div class="inn">'+x+'</div>',
						'</div>',
					'</a>',
				'</li>'].join(''));
				
				this.items.push(item);
				
				html.append(item);
			}
						
			return html;
		}
	});
		
	/**
	 * The FlipClock Time class is used to manage all the time 
	 * calculations.
	 *
	 * @param 	object  A FlipClock.Factory object
	 * @param 	mixed   This is the digit used to set the clock. If an 
	 *				    object is passed, 0 will be used.	
	 * @param 	object  An object of properties to override the default	
	 */
	 	
	FlipClock.Time = FlipClock.Base.extend({
		
		/**
		 * The time (in seconds)
		 */		
		 
		minimumDigits: 0,
		
		/**
		 * The time (in seconds)
		 */		
		 
		time: 0,
		
		/**
		 * The parent FlipClock.Factory object
		 */		
		 
		factory: false,
		
		/**
		 * Constructor
		 *
		 * @param  object  A FlipClock.Factory object
		 * @param  int     An integer use to select the correct digit
		 * @param  object  An object to override the default properties	 
		 */
		 
		constructor: function(factory, time, options) {
			this.base(options);
			this.factory = factory;

			if(time) {
				this.time = time;
			}
		},
		
		/**
		 * Convert a string or integer to an array of digits
		 *
		 * @param   mixed  String or Integer of digits	 
		 * @return  array  An array of digits 
		 */
		 
		convertDigitsToArray: function(str) {
			var data = [];
			
			str = str.toString();
			
			for(var x = 0;x < str.length; x++) {
				if(str[x].match(/^\d*$/g)) {
					data.push(str[x]);	
				}
			}
			
			return data;
		},
		
		/**
		 * Get a specific digit from the time integer
		 *
		 * @param   int    The specific digit to select from the time	 
		 * @return  mixed  Returns FALSE if no digit is found, otherwise
		 *				   the method returns the defined digit	 
		 */
		 
		digit: function(i) {
			var timeStr = this.toString();
			var length  = timeStr.length;
			
			if(timeStr[length - i])	 {
				return timeStr[length - i];
			}
			
			return false;
		},

		/**
		 * Formats any array of digits into a valid array of digits
		 *
		 * @param   mixed  An array of digits	 
		 * @return  array  An array of digits 
		 */
		 
		digitize: function(obj) {
			var data = [];
			
			$.each(obj, function(i, value) {
				value = value.toString();
				
				if(value.length == 1) {
					value = '0'+value;
				}
				
				for(var x = 0; x < value.length; x++) {
					data.push(value[x]);
				}				
			});
			
			if(data.length > this.minimumDigits) {
				this.minimumDigits = data.length;
			}
			
			if(this.minimumDigits > data.length) {
				data.unshift('0');
			}
			
			return data;
		},
		
		/**
		 * Gets a daily breakdown
		 *
		 * @return  object  Returns a digitized object
		 */

		getDayCounter: function(includeSeconds) {
			var digits = [
				this.getDays(),
				this.getHours(true),
				this.getMinutes(true)
			];

			if(includeSeconds) {
				digits.push(this.getSeconds(true));
			}

			return this.digitize(digits);
		},

		/**
		 * Gets number of days
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */
		 
		getDays: function(mod) {
			var days = this.time / 60 / 60 / 24;
			
			if(mod) {
				days = days % 7;
			}
			
			return Math.floor(days);
		},
		
		/**
		 * Gets an hourly breakdown
		 *
		 * @return  object  Returns a digitized object
		 */
		 
		getHourCounter: function() {
			var obj = this.digitize([
				this.getHours(),
				this.getMinutes(true),
				this.getSeconds(true)
			]);
			
			return obj;
		},
		
		/**
		 * Gets an hourly breakdown
		 *
		 * @return  object  Returns a digitized object
		 */
		 
		getHourly: function() {
			return this.getHourCounter();
		},
		
		/**
		 * Gets number of hours
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */
		 
		getHours: function(mod) {
			var hours = this.time / 60 / 60;
			
			if(mod) {
				hours = hours % 24;	
			}
			
			return Math.floor(hours);
		},
		
		/**
		 * Gets the twenty-four hour time
		 *
		 * @return  object  returns a digitized object
		 */
		 
		getMilitaryTime: function() {
			var date = new Date(); 
			var obj  = this.digitize([
				date.getHours(),
				date.getMinutes(),
				date.getSeconds()				
			]);

			return obj;
		},
				
		/**
		 * Gets number of minutes
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */
		 
		getMinutes: function(mod) {
			var minutes = this.time / 60;
			
			if(mod) {
				minutes = minutes % 60;
			}
			
			return Math.floor(minutes);
		},
		
		/**
		 * Gets a minute breakdown
		 */
		 
		getMinuteCounter: function() {
			var obj = this.digitize([
				this.getMinutes(),
				this.getSeconds(true)
			]);

			return obj;
		},
		
		/**
		 * Gets number of seconds
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a ceiled integer
		 */
		 
		getSeconds: function(mod) {
			var seconds = this.time;
			
			if(mod) {
				if(seconds == 60) {
					seconds = 0;
				}
				else {
					seconds = seconds % 60;
				}
			}
			
			return Math.ceil(seconds);
		},
		
		/**
		 * Gets the current twelve hour time
		 *
		 * @return  object  Returns a digitized object
		 */
		 
		getTime: function() {
			var date  = new Date(); 
			var hours = date.getHours();
			var merid = hours > 12 ? 'PM' : 'AM';
			var obj   = this.digitize([
				hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours),
				date.getMinutes(),
				date.getSeconds()				
			]);

			return obj;
		},
		
		/**
		 * Gets number of weeks
		 *
		 * @param   bool  Should perform a modulus? If not sent, then no.
		 * @return  int   Retuns a floored integer
		 */
		 
		getWeeks: function() {
			var weeks = this.time / 60 / 60 / 24 / 7;
			
			if(mod) {
				weeks = weeks % 52;
			}
			
			return Math.floor(weeks);
		},
		
		/**
		 * Removes a specific number of leading zeros from the array.
		 * This method prevents you from removing too many digits, even
		 * if you try.
		 *
		 * @param   int    Total number of digits to remove 
		 * @return  array  An array of digits 
		 */
		 
		removeLeadingZeros: function(totalDigits, digits) {
			var total    = 0;
			var newArray = [];
			
			$.each(digits, function(i, digit) {
				if(i < totalDigits) {
					total += parseInt(digits[i], 10);
				}
				else {
					newArray.push(digits[i]);
				}
			});
			
			if(total === 0) {
				return newArray;
			}
			
			return digits;
		},
		
		/**
		 * Converts the object to a human readable string
		 */
		 
		toString: function() {
			return this.time.toString();
		}
		
		/*
		getYears: function() {
			return Math.floor(this.time / 60 / 60 / 24 / 7 / 52);
		},
		
		getDecades: function() {
			return Math.floor(this.getWeeks() / 10);
		}*/
	});
	
	/**
	 * The FlipClock.Timer object managers the JS timers
	 *
	 * @param	object  The parent FlipClock.Factory object
	 * @param	object  Override the default options
	 */
	
	FlipClock.Timer = FlipClock.Base.extend({
		
		/**
		 * Callbacks
		 */		
		 
		callbacks: {
			destroy: false,
			create: false,
			init: false,
			interval: false,
			start: false,
			stop: false,
			reset: false
		},
		
		/**
		 * FlipClock timer count (how many intervals have passed)
		 */		
		 
		count: 0,
		
		/**
		 * The parent FlipClock.Factory object
		 */		
		 
		factory: false,
		
		/**
		 * Timer interval (1 second by default)
		 */		
		 
		interval: 1000,
				
		/**
		 * Constructor
		 *
		 * @return	void
		 */		
		 
		constructor: function(factory, options) {
			this.base(options);
			this.factory = factory;
			this.callback(this.callbacks.init);	
			this.callback(this.callbacks.create);
		},
		
		/**
		 * This method gets the elapsed the time as an interger
		 *
		 * @return	void
		 */		
		 
		getElapsed: function() {
			return this.count * this.interval;
		},
		
		/**
		 * This method gets the elapsed the time as a Date object
		 *
		 * @return	void
		 */		
		 
		getElapsedTime: function() {
			return new Date(this.time + this.getElapsed());
		},
		
		/**
		 * This method is resets the timer
		 *
		 * @param 	callback  This method resets the timer back to 0
		 * @return	void
		 */		
		 
		reset: function(callback) {
			clearInterval(this.timer);
			this.count = 0;
			this._setInterval(callback);			
			this.callback(this.callbacks.reset);
		},
		
		/**
		 * This method is starts the timer
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */		
		 
		start: function(callback) {		
			this.factory.running = true;
			this._createTimer(callback);
			this.callback(this.callbacks.start);
		},
		
		/**
		 * This method is stops the timer
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */		
		 
		stop: function(callback) {
			this.factory.running = false;
			this._clearInterval(callback);
			this.callback(this.callbacks.stop);
			this.callback(callback);
		},
		
		/**
		 * Clear the timer interval
		 *
		 * @return	void
		 */		
		 
		_clearInterval: function() {
			clearInterval(this.timer);
		},
		
		/**
		 * Create the timer object
		 *
		 * @param 	callback  A function that is called once the timer is created
		 * @return	void
		 */		
		 
		_createTimer: function(callback) {
			this._setInterval(callback);		
		},
		
		/**
		 * Destroy the timer object
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */		
		 	
		_destroyTimer: function(callback) {
			this._clearInterval();			
			this.timer = false;
			this.callback(callback);
			this.callback(this.callbacks.destroy);
		},
		
		/**
		 * This method is called each time the timer interval is ran
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */		
		 
		_interval: function(callback) {
			this.callback(this.callbacks.interval);
			this.callback(callback);
			this.count++;
		},
		
		/**
		 * This sets the timer interval
		 *
		 * @param 	callback  A function that is called once the timer is destroyed
		 * @return	void
		 */		
		 
		_setInterval: function(callback) {
			var t = this;
			
			t.timer = setInterval(function() {			
				t._interval(callback);
			}, this.interval);
		}
			
	});
	
	/**
	 * Capitalize the first letter in a string
	 *
	 * @return string
	 */
	 
	String.prototype.ucfirst = function() {
		return this.substr(0, 1).toUpperCase() + this.substr(1);
	};
	
	/**
	 * jQuery helper method
	 *
	 * @param  int     An integer used to start the clock (no. seconds)
	 * @param  object  An object of properties to override the default	
	 */
	 
	$.fn.FlipClock = function(digit, options) {
		if(typeof digit == "object") {
			options = digit;
			digit = 0;
		}		
		return new FlipClock($(this), digit, options);
	};
	
	/**
	 * jQuery helper method
	 *
	 * @param  int     An integer used to start the clock (no. seconds)
	 * @param  object  An object of properties to override the default	
	 */
	 
	$.fn.flipClock = function(digit, options) {
		return $.fn.FlipClock(digit, options);
	};
	
}(jQuery));

(function($) {
	
	/**
	 * Twenty-Four Hour Clock Face
	 *
	 * This class will generate a twenty-four our clock for FlipClock.js
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default	
	 */
	 
	FlipClock.TwentyFourHourClockFace = FlipClock.Face.extend({

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		constructor: function(factory, options) {
			factory.countdown = false;
			this.base(factory, options);
		},

		/**
		 * Build the clock face
		 *
		 * @param  object  Pass the time that should be used to display on the clock.	
		 */
		 
		build: function(time) {
			var t        = this;
			var children = this.factory.$wrapper.find('ul');

			time = time ? time : (this.factory.time.time || this.factory.time.getMilitaryTime());
			
			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					t.factory.lists.push(t.createList(digit));
				});
			}
			
			this.dividers.push(this.createDivider());
			this.dividers.push(this.createDivider());
			
			$(this.dividers[0]).insertBefore(this.factory.lists[this.factory.lists.length - 2].$obj);
			$(this.dividers[1]).insertBefore(this.factory.lists[this.factory.lists.length - 4].$obj);
			
			this._clearExcessDigits();
			
			if(this.autoStart) {
				this.start();
			}
		},
		
		/**
		 * Flip the clock face
		 */
		 
		flip: function(time) {
			time = time ? time : this.factory.time.getMilitaryTime();
			this.base(time);	
		},
		
		/**
		 * Clear the excess digits from the tens columns for sec/min
		 */
		 
		_clearExcessDigits: function() {
			var tenSeconds = this.factory.lists[this.factory.lists.length - 2];
			var tenMinutes = this.factory.lists[this.factory.lists.length - 4];
			
			for(var x = 6; x < 10; x++) {
				tenSeconds.$obj.find('li:last-child').remove();
				tenMinutes.$obj.find('li:last-child').remove();
			}
		}
				
	});
	
}(jQuery));
(function($) {
		
	/**
	 * Counter Clock Face
	 *
	 * This class will generate a generice flip counter. The timer has been
	 * disabled. clock.increment() and clock.decrement() have been added.
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default	
	 */
	 
	FlipClock.CounterFace = FlipClock.Face.extend({
		
		autoStart: false,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		constructor: function(factory, options) {
			factory.timer.interval = 0;
			factory.autoStart 	   = false;
			factory.running  	   = true;

			factory.increment = function() {
				factory.countdown = false;
				factory.setTime(factory.getTime().time + 1);
			};

			factory.decrement = function() {
				factory.countdown = true;
				factory.setTime(factory.getTime().time - 1);
			};

			factory.setValue = function(digits) {
				factory.setTime(digits);
			};

			factory.setCounter = function(digits) {
				factory.setTime(digits);
			};

			this.base(factory, options);
		},
		
		/**
		 * Build the clock face	
		 */
		 
		build: function() {
			var t        = this;
			var children = this.factory.$wrapper.find('ul');
			var lists    = [];
			var time 	 = this.factory.getTime().digitize([this.factory.getTime().time]);

			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					var list = t.createList(digit);

					list.select(digit);
					lists.push(list);
				});
			
			}

			$.each(lists, function(i, list) {
				list.play();
			});

			this.factory.lists = lists;
		},
		
		/**
		 * Flip the clock face
		 */
		 
		flip: function(doNotAddPlayClass) {
			var time = this.factory.getTime().digitize([this.factory.getTime().time]);

			this.base(time, doNotAddPlayClass);
		},

	});
	
}(jQuery));
(function($) {

	/**
	 * Daily Counter Clock Face
	 *
	 * This class will generate a daily counter for FlipClock.js. A
	 * daily counter will track days, hours, minutes, and seconds. If
	 * the number of available digits is exceeded in the count, a new
	 * digit will be created.
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default
	 */

	FlipClock.DailyCounterFace = FlipClock.Face.extend({

		showSeconds: true,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */

		constructor: function(factory, options) {
			this.base(factory, options);
		},

		/**
		 * Build the clock face
		 */

		build: function(excludeHours, time) {
			var t        = this;
			var children = this.factory.$wrapper.find('ul');
			var lists    = [];
			var offset   = 0;

			time     = time ? time : this.factory.time.getDayCounter(this.showSeconds);

			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					lists.push(t.createList(digit));
				});
			}

			this.factory.lists = lists;

			if(this.showSeconds) {
				$(this.createDivider('Seconds')).insertBefore(this.factory.lists[this.factory.lists.length - 2].$obj);
			}
			else
			{
				offset = 2;
			}

			$(this.createDivider('Minutes')).insertBefore(this.factory.lists[this.factory.lists.length - 4 + offset].$obj);
			$(this.createDivider('Hours')).insertBefore(this.factory.lists[this.factory.lists.length - 6 + offset].$obj);
			$(this.createDivider('Days', true)).insertBefore(this.factory.lists[0].$obj);

			this._clearExcessDigits();

			if(this.autoStart) {
				this.start();
			}
		},

		/**
		 * Flip the clock face
		 */

		flip: function(doNotAddPlayClass, time) {
			if(!time) {
				time = this.factory.time.getDayCounter(this.showSeconds);
			}
			this.base(time, doNotAddPlayClass);
		},

		/**
		 * Clear the excess digits from the tens columns for sec/min
		 */

		_clearExcessDigits: function() {
			var tenSeconds = this.factory.lists[this.factory.lists.length - 2];
			var tenMinutes = this.factory.lists[this.factory.lists.length - 4];

			for(var x = 6; x < 10; x++) {
				tenSeconds.$obj.find('li:last-child').remove();
				tenMinutes.$obj.find('li:last-child').remove();
			}
		}

	});

}(jQuery));
(function($) {
			
	/**
	 * Hourly Counter Clock Face
	 *
	 * This class will generate an hourly counter for FlipClock.js. An
	 * hour counter will track hours, minutes, and seconds. If number of
	 * available digits is exceeded in the count, a new digit will be 
	 * created.
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default	
	 */
	 
	FlipClock.HourlyCounterFace = FlipClock.Face.extend({
			
		clearExcessDigits: true,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		constructor: function(factory, options) {
			this.base(factory, options);
		},
		
		/**
		 * Build the clock face
		 */
		
		build: function(excludeHours, time) {
			var t        = this;
			var children = this.factory.$wrapper.find('ul');
			var lists = [];
			
			time     = time ? time : this.factory.time.getHourCounter();
			
			if(time.length > children.length) {
				$.each(time, function(i, digit) {
					lists.push(t.createList(digit));
				});
			}
			
			this.factory.lists = lists;	
			
			$(this.createDivider('Seconds')).insertBefore(this.factory.lists[this.factory.lists.length - 2].$obj);
			$(this.createDivider('Minutes')).insertBefore(this.factory.lists[this.factory.lists.length - 4].$obj);
			
			if(!excludeHours) {
				$(this.createDivider('Hours', true)).insertBefore(this.factory.lists[0].$obj);
			}
			
			if(this.clearExcessDigits) {
				this._clearExcessDigits();
			}
			
			if(this.autoStart) {
				this.start();
			}
		},
		
		/**
		 * Flip the clock face
		 */
		 
		flip: function(doNotAddPlayClass, time) {
			if(!time) {
				time = this.factory.time.getHourCounter();
			}			
			this.base(time, doNotAddPlayClass);
		},
		
		/**
		 * Clear the excess digits from the tens columns for sec/min
		 */
		 
		_clearExcessDigits: function() {
			var tenSeconds = this.factory.lists[this.factory.lists.length - 2];
			var tenMinutes = this.factory.lists[this.factory.lists.length - 4];
			
			for(var x = 6; x < 10; x++) {
				tenSeconds.$obj.find('li:last-child').remove();
				tenMinutes.$obj.find('li:last-child').remove();
			}
		}
		
	});
	
}(jQuery));
(function($) {
		
	/**
	 * Minute Counter Clock Face
	 *
	 * This class will generate a minute counter for FlipClock.js. A
	 * minute counter will track minutes and seconds. If an hour is 
	 * reached, the counter will reset back to 0. (4 digits max)
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default	
	 */
	 
	FlipClock.MinuteCounterFace = FlipClock.HourlyCounterFace.extend({
		
		clearExcessDigits: false,

		/**
		 * Constructor
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		constructor: function(factory, options) {
			this.base(factory, options);
		},
		
		/**
		 * Build the clock face	
		 */
		 
		build: function() {
			this.base(true, this.factory.time.getMinuteCounter());
		},
		
		/**
		 * Flip the clock face
		 */
		 
		flip: function(doNotAddPlayClass) {
			this.base(doNotAddPlayClass, this.factory.time.getMinuteCounter());
		},

	});
	
}(jQuery));
(function($) {
		
	/**
	 * Twelve Hour Clock Face
	 *
	 * This class will generate a twelve hour clock for FlipClock.js
	 *
	 * @param  object  The parent FlipClock.Factory object
	 * @param  object  An object of properties to override the default	
	 */
	 
	FlipClock.TwelveHourClockFace = FlipClock.TwentyFourHourClockFace.extend({
		
		/**
		 * The meridium jQuery DOM object
		 */
		 
		meridium: false,
		
		/**
		 * The meridium text as string for easy access
		 */
		 
		meridiumText: 'AM',
					
		/**
		 * Build the clock face
		 *
		 * @param  object  Pass the time that should be used to display on the clock.	
		 */
		 
		build: function(time) {
			var t        = this;
			
			time = time ? time : (this.factory.time.time ? this.factory.time.time : this.factory.time.getTime());
			
			this.base(time);			
			this.meridiumText = this._isPM() ? 'PM' : 'AM';			
			this.meridium = $([
				'<ul class="flip-clock-meridium">',
					'<li>',
						'<a href="#">'+this.meridiumText+'</a>',
					'</li>',
				'</ul>'
			].join(''));
			
			this.meridium.insertAfter(this.factory.lists[this.factory.lists.length-1].$obj);
		},
		
		/**
		 * Flip the clock face
		 */
		 
		flip: function() {			
			if(this.meridiumText != this._getMeridium()) {
				this.meridiumText = this._getMeridium();
				this.meridium.find('a').html(this.meridiumText);	
			}
			this.base(this.factory.time.getTime());	
		},
		
		/**
		 * Get the current meridium
		 *
		 * @return  string  Returns the meridium (AM|PM)
		 */
		 
		_getMeridium: function() {
			return new Date().getHours() >= 12 ? 'PM' : 'AM';
		},
		
		/**
		 * Is it currently in the post-medirium?
		 *
		 * @return  bool  Returns true or false
		 */
		 
		_isPM: function() {
			return this._getMeridium() == 'PM' ? true : false;
		},
		
		/**
		 * Clear the excess digits from the tens columns for sec/min
		 */
		 
		_clearExcessDigits: function() {
			var tenSeconds = this.factory.lists[this.factory.lists.length - 2];
			var tenMinutes = this.factory.lists[this.factory.lists.length - 4];
			
			for(var x = 6; x < 10; x++) {
				tenSeconds.$obj.find('li:last-child').remove();
				tenMinutes.$obj.find('li:last-child').remove();
			}
		}
				
	});
	
}(jQuery));
(function($) {
		
	/**
	 * FlipClock German Language Pack
	 *
	 * This class will used to translate tokens into the German language.
	 *	
	 */
	 
	FlipClock.Lang.German = {
		
		'years'   : 'Jahre',
		'months'  : 'Monate',
		'days'    : 'Tage',
		'hours'   : 'Stunden',
		'minutes' : 'Minuten',
		'seconds' : 'Sekunden'	
 
	};
	
	/* Create various aliases for convenience */
 
	FlipClock.Lang['de']     = FlipClock.Lang.German;
	FlipClock.Lang['de-de']  = FlipClock.Lang.German;
	FlipClock.Lang['german'] = FlipClock.Lang.German;
 
}(jQuery));
(function($) {
		
	/**
	 * FlipClock English Language Pack
	 *
	 * This class will used to translate tokens into the English language.
	 *	
	 */
	 
	FlipClock.Lang.English = {
		
		'years'   : 'Years',
		'months'  : 'Months',
		'days'    : 'Days',
		'hours'   : 'Hours',
		'minutes' : 'Minutes',
		'seconds' : 'Seconds'	

	};
	
	/* Create various aliases for convenience */

	FlipClock.Lang['en']      = FlipClock.Lang.English;
	FlipClock.Lang['en-us']   = FlipClock.Lang.English;
	FlipClock.Lang['english'] = FlipClock.Lang.English;

}(jQuery));
(function($) {
		
	/**
	 * FlipClock Spanish Language Pack
	 *
	 * This class will used to translate tokens into the Spanish language.
	 *	
	 */
	 
	FlipClock.Lang.Spanish = {
		
		'years'   : 'A&#241;os',
		'months'  : 'Meses',
		'days'    : 'D&#205;as',
		'hours'   : 'Horas',
		'minutes' : 'Minutos',
		'seconds' : 'Segundo'	

	};
	
	/* Create various aliases for convenience */

	FlipClock.Lang['es']      = FlipClock.Lang.Spanish;
	FlipClock.Lang['es-es']   = FlipClock.Lang.Spanish;
	FlipClock.Lang['spanish'] = FlipClock.Lang.Spanish;

}(jQuery));
(function($) {

  /**
   * FlipClock Canadian French Language Pack
   *
   * This class will used to translate tokens into the Canadian French language.
   *
   */

  FlipClock.Lang.French = {

    'years'   : 'ans',
    'months'  : 'mois',
    'days'    : 'jours',
    'hours'   : 'heures',
    'minutes' : 'minutes',
    'seconds' : 'secondes'

  };

  /* Create various aliases for convenience */

  FlipClock.Lang['fr']      = FlipClock.Lang.French;
  FlipClock.Lang['fr-ca']   = FlipClock.Lang.French;
  FlipClock.Lang['french']  = FlipClock.Lang.French;

}(jQuery));
