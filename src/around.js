
// around.js 0.0.1
// (c) 2012 Evan Moran
// Around is freely distributable under the MIT license.
// For all details and documentation:
// http://github.com/evanmoran/around
//
// Description
// A prototype-aware AOP library
//
// Motivation
// -------------------------------------------------------------
// Aspect oriented programming (AOP) is a programming methodology that tries to address
// the common issue of similar code being created in several files. This violates the basic DRY
// principle, and especially common for operations like logging, profiling, and error handling.
//
// The solution was to create the ability to cut a function before, after, and around it.
// This allows you to modify the function without changing it making it more modular and reusable.
//
// Read more on [wikipedia](http://en.wikipedia.org/wiki/Aspect-oriented_programming).
//
// API
// -------------------------------------------------------------
//
// around.extend()
//
//     Call this method to extend Function.prototype with
//     `around`, `before`, and `after` methods
//
// fn.around(fnBefore, fnAfter)
//
//     Return a function that cuts before and after the function
//     being extended.
//
//     fn            The function being extended
//     fnBefore      The function called before fn
//     fnAfter       The function called after fn
//
// fn.before(fnBefore)
//
//     Return a function that cuts before the function being extended.
//
//     fn            The function being extended
//     fnBefore      The function called before fn
//
// fn.after(_fnAfter_)
//
//     Return a function that cuts after the function being extended.
//
//     fn            The function being extended
//     fnBefore      The function called before fn
//     fnAfter       The function called after fn
//
// Examples
// -------------------------------------------------------------

// Globals are bad
(function () {

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Create a reference to this
  var around = new Object();

  // Create a around.breaker to enable function skipping
	var __slice = [].slice;
	around.breaker = function() {
	  return [around.breaker].concat(__slice.call(arguments));
	};

	var isArray = Array.isArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  var arrayify = function(v){
  	return v == null ? [] : isArray(v) ? v : [v];
  };

  // CommonJS / Node support
	if (typeof exports !== 'undefined') {
	  if (typeof module !== 'undefined' && module.exports) {
	    exports = module.exports = around;
	  }
	  exports.around = around;
	// Global support for browsers
	} else {
	  root['around'] = around;
	}

	// #### around.extend
	around.extend = function(){

		// #### Function.prototype.before
		Function.prototype.before = function(fnBefore) {
			return this.around(fnBefore, null);
		}

		// #### Function.prototype.after
		Function.prototype.after = function(fnAfter) {
			return this.around(null, fnAfter);
		}

		// #### Function.prototype.around
		// Notes on behavior:
		// * If fnBefore returns `around.breaker` it skips fnSelf and returns itself
		// * If fnBefore returns `undefined` it passes the original arguments to fn
		// * If fnBefore returns `[]` it passes no arguments to fn
		// * If fnBefore returns ['list','of','values'] they are passed as arguments to fnSelf
		// * If fnBefore throws it works normally
		// * If fnSelf throws it is passed to fnAfter
		// * If fnAfter returns a value it is returned to the caller
		// * If fnAfter throws it works normally
		Function.prototype.around = function(fnBefore, fnAfter)
		{
	    var fnSelf = this;
	    var skipSelf = false;
	    var fnOut = function()
	    {

				// Call before or pass through args
				var args = arguments;
				var beforeOut = args;
				console.log('args (before): ', args)
				if (typeof fnBefore === "function"){
					// Pass through this
					console.log('before called')
					beforeOut = fnBefore.apply(fnSelf, args);
				}
				console.log('beforeOut: ', beforeOut);

				// Skip fnSelf if breaker was found
				if(beforeOut === around.breaker || beforeOut[0] == around.breaker){
					skipSelf = true;
					// Remove breaker from list if necessary
					if(isArray(beforeOut))
						beforeOut.shift();
				}

				// Setup args for next function
				args = arrayify(beforeOut);

				console.log('args (self): ', args)

		    var selfOut;
				var flagExceptionCaught = false;
				if (!skipSelf)
				{
					// Finish with self if there is no after. This also
					// prevents unecessary try/catch calls
					if(typeof fnAfter !== 'function') {
						console.log('self called with return')
						return fnSelf.apply(fnSelf, args);
					}
					else
					{
						// Exceptions are caught and passed to the after functon just like return
						// values so fnAfter can modify these as well.
						try {
							console.log('self called')
							selfOut = fnSelf.apply(fnSelf, args);
						}
						catch(selfException) {
							selfOut = selfException;
							flagExceptionCaught = true;
						}
						args = arrayify(selfOut);
					}
				}

				console.log('args (after): ', args)


				// Call after
				var afterOut = undefined;
				if (typeof fnAfter === "function"){
					console.log('after called')
					afterOut = fnAfter.apply(fnSelf, args);
				}
				// Return result of `fnAfter` if it returned something
				// Note that `fnAfter` can rethrow itself so we don't have to
				if (afterOut !== undefined)
					return afterOut;

				// Rethrow fnSelf's exception if it was caught. This way the behavior
				// of the original function is changed only if fnAfter changes it
				if (flagExceptionCaught)
					throw(selfOut);
				return selfOut;
			};
			return fnOut;
		}
	}
}).call(this);
