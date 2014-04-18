var EventEmitter = require('events').EventEmitter
  , extend = require('extend')

var MAX_DEPTH = 32


function owatch(obj, handlers, depth) {
  depth || (depth = 0)
  handlers.get || (handlers.get = noop)
  handlers.set || (handlers.set = noop)
  handlers.init || (handlers.init = noop)
  obj.__values || makeHidden(obj, '__values', {})

  // No infinite recursion
  if (depth > MAX_DEPTH)
    return;

  handlers.init(obj)

  Object.keys(obj).forEach(function(key) {
    // Short-circuit if we've already taken over this property
    if (typeof(obj.__values[key]) != 'undefined')
      return;

    // Edge-case: don't error if property is immutable
    var descriptor = Object.getOwnPropertyDescriptor(obj, key)
    if (descriptor && descriptor.writable === false)
      return;

    // Store the actual value for retrieval
    obj.__values[key] = obj[key]

    // Replace this value w/ getter/setter
    listen(obj, key, handlers)

    // Descend into objects
    if (typeof(obj.__values[key]) == 'object') {
      var myParent = handlers.set.__parent||noop

      handlers.set.__parent = function(obj, path, newValue, oldValue) {
        var _path = [key, path].join('.')
        handlers.set(obj, _path, newValue, oldValue)
        myParent(obj, _path, newValue, oldValue)
      }

      owatch(obj.__values[key], handlers, depth+1)
    }
  })

  return obj
}


function listen(obj, key, handlers) {
  Object.defineProperty(obj, key, {
    enumerable: true

    ,get: function() {
      var val = obj.__values[key]

      try { handlers.get(obj, key, val) }
      catch (ex) { console.error('Exception in GET handler for ' + key, ex)}

      return val
    }

    ,set: function(newValue) {
      var oldValue = obj.__values[key]

      // Short-curcuit if no change
      if (deepEquals(oldValue, newValue))
        return;

      if (typeof(newValue) == 'object')
        newValue = owatch(newValue, handlers)

      obj.__values[key] = newValue

      try {
        if (window.DEBUG)
          debugger;
        handlers.set(obj, key, newValue, oldValue)
        handlers.set.__parent &&
          handlers.set.__parent(obj, key, newValue, oldValue)
      }
      catch (ex) { console.error('Exception in SET handler for ' + key, ex)}
    }
  })
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

function deepEquals(object1, object2, depth) {
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
      if (!deepEquals(object1[prop], object2[prop], depth - 1)) {
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
module.exports._deepEquals = deepEquals


