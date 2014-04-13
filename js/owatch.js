var DEFAULT_CLONE_DEPTH = 20

function owatch(object, property, handlers, depth) {
  // Initialize
  var o = object;
  var allProperties = property ? [property] : Object.keys(o);

  // Depth detection
  depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
  if (depth < 0) {
    return;
  }

  handlers.get || (handlers.get = noop)
  handlers.set || (handlers.set = noop)

  // Create hidden properties on the object
  if (!o.__watchers)
    makeHidden(o, '__watchers', {});
  if (!o.__propertyValues)
    makeHidden(o, '__propertyValues', {});

  // Attach watchers to all requested properties
  allProperties.forEach(function(prop){

    // Setup the property for watching (first time only)
    if (typeof(o.__propertyValues[prop]) == 'undefined') {

      // Don't error re-defining the property if immutable
      var descriptor = Object.getOwnPropertyDescriptor(o, prop);
      if (descriptor && descriptor.writable === false)
        return;

      // Copy the value to the hidden field, and add the property to watchers
      o.__propertyValues[prop] = [o[prop]];
      o.__watchers[prop] = [];

      // Attach the property watcher
      Object.defineProperty(o, prop, {
        enumerable : true,

        get : function(){
          // If more than 1 item is in the values array,
          // then we're currently processing watchers.
          if (o.__propertyValues[prop].length == 1) {
            // Current value
            var val = o.__propertyValues[prop][0];

            o.__watchers[prop].forEach(function(watcher) {
              try {
                watcher.get(o, prop, val)
              } catch (e) {
                console.error("Exception in object get watcher.get for " + prop, e)
              }
            })

            return val

          } else {
            // [0] is prior value, [1] is new value being processed
            return o.__propertyValues[prop][1];
          }
        },

        set : function(newValue) {

          if (! handlers.set)
            return;

          // Return early if no change
          var origValue = o.__propertyValues[prop][0];
          if (_equalsDeep(origValue, newValue))
            return;

          // Remember the new value, and return if we're in another setter
          o.__propertyValues[prop].push(newValue);
          if (o.__propertyValues[prop].length > 2)
            return;

          // Call all watchers for each change requested
          var numIterations = 0;
          while (o.__propertyValues[prop].length > 1) {

            // Detect recursion
            if (++numIterations > 20) {
              o.__propertyValues[prop] = [origValue];
              throw new Error('Recursion detected while setting [' + prop + ']');
            }

            // Call each watcher for the current values
            var oldValue = o.__propertyValues[prop][0];
            newValue = o.__propertyValues[prop][1];
            o.__watchers[prop].forEach(function(watcher) {
              try {
                watcher.set(o, prop, oldValue, newValue);
              } catch (e) {
                // Log an error and continue with subsequent watchers
                console.error("Exception in object watcher.set for " + prop, e);
              }
            });

            // Done processing this value
            o.__propertyValues[prop].splice(0,1);
          }
        }
      });

    } // Done setting up the property for watching (first time)

    // Recurs if this is an object...
    if (o[prop] && typeof(o[prop]) == 'object') {
      owatch(o[prop], null, handlers, depth - 1);
    }

    // Add the watcher to the property
    o.__watchers[prop].push(handlers);

  }); // Done processing each property

  // Return the original object - for chaining
  return o;
}


function makeHidden(object, property, value) {
  // Use the existing value if the new value isn't specified
  value = (typeof value == 'undefined') ? object[property] : value;

  // Create the hidden property
  Object.defineProperty(object, property, {
    value: value,
    enumerable : false
  });

  return object;
}


function _equalsDeep(object1, object2, depth) {

  // Recursion detection
  depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
  if (depth < 0) {
    return {};
  }

  // Fast comparisons
  if (!object1 || !object2) {
    return false;
  }
  if (object1 === object2) {
    return true;
  }
  if (typeof(object1) != 'object' || typeof(object2) != 'object') {
    return false;
  }

  // They must have the same keys.  If their length isn't the same
  // then they're not equal.  If the keys aren't the same, the value
  // comparisons will fail.
  if (Object.keys(object1).length != Object.keys(object2).length) {
    return false;
  }

  // Compare the values
  for (var prop in object1) {

    // Call recursively if an object or array
    if (object1[prop] && typeof(object1[prop]) === 'object') {
      if (!_equalsDeep(object1[prop], object2[prop], depth - 1)) {
        return false;
      }
    }
    else {
      if (object1[prop] !== object2[prop]) {
        return false;
      }
    }
  }

  // Test passed.
  return true;
};

function noop(){}


module.exports = owatch
module.exports._makeHidden = makeHidden
module.exports._equalsDeep = _equalsDeep

