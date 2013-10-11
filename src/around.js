
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

  var toRealArray = function(args){
		return Array.prototype.slice.call(args);
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
	    	// console.log('\n\n\n')

				// Call before or pass through args
				var args = toRealArray(arguments);  // What should be passed if a function is passed
				var out = undefined; 								// What should be returned if done
				var selfOut = undefined;

				// console.log('args (start): ', args)

				if (typeof fnBefore === "function"){
					// Pass through this
					// console.log('before called')
					var beforeOut = fnBefore.apply(fnSelf, args);
					// Before only overrides arguments if it returns something
					if(beforeOut != null){
						args = out = beforeOut;
					}
				}
				// console.log('args (before): ', args)
				// console.log('out (before): ', out)
				// Skip fnSelf if breaker was found
				if(out === around.breaker || (out != null && out[0] == around.breaker))
				{
					// console.log('breaker found"')
					skipSelf = true;
					// Remove breaker from out
					if(isArray(out))
						out.shift();
					else
						out = undefined;
				}

				// Setup args for next function
				args = arrayify(out);

				// console.log('args (self): ', args)

				var flagException = false;

				// Finish fully if there is no self or after
				// Finish with self if there is no after.
				// (prevents unecessary try/catch calls)
				if(typeof fnAfter !== 'function')
				{
					// console.log('after not found')
					// Finish immediately if there is no self
					if (skipSelf){
						// console.log('exiting immediately (no self or after): ', out)
						return out;
					}
					// console.log('self called with return')
					return fnSelf.apply(fnSelf, args);
				}

				// Exceptions are caught and passed to the after functon just like return
				// values so fnAfter can modify these as well.
				try {
					// console.log('self called')
					out = fnSelf.apply(fnSelf, args);
					// console.log('out: ', out)
				}
				catch(e) {
					// console.log('exception caught')
					out = e;
					flagException = true;
				}
				args = arrayify(out);

				// console.log('out (after): ', out)
				// console.log('args (after): ', args)

				// Call after
				if (typeof fnAfter === "function")
				{
					// console.log('after called')
					var afterOut = fnAfter.apply(fnSelf, args);

					// After can overwrite exceptions
					if (afterOut !== undefined){
						out = afterOut;
						flagException = false;
					}
				}

				// console.log('out (end): ', out)

				// Rethrow fnSelf's exception if it was caught. This way the behavior
				// of the original function is changed only if fnAfter changes it
				if (flagException)
					throw(out);
				return out;
			};
			return fnOut;
		}
	}
}).call(this);
