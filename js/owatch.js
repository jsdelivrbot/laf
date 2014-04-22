var EventEmitter = require('events').EventEmitter
  , extend = require('extend')

var MAX_DEPTH = 32


function owatch(obj, handlers, parentHandlers, path) {
  path || (path = [])
  handlers || (handlers = {})
  handlers.get || (handlers.get = noop)
  handlers.set || (handlers.set = noop)
  handlers.init || (handlers.init = noop)
  parentHandlers = extend({}, {get:noop, set:noop}, parentHandlers)

  if (obj.___values === undefined) {
    makeHidden(obj, '___values', {})
    makeHidden(obj, '___fullPath', path)
    makeHidden(obj, '___fullPathStr', path.join('.'))
    makeHidden(obj, '___update', _update.bind(this))
    handlers.init(obj)
  }

  // No infinite recursion
  if (path.length > MAX_DEPTH)
    return;

  _wrapKeys()

  return obj


  function _wrapKeys(emitNewProps) {
    Object.keys(obj).forEach(function(key) {
      // Short-circuit if we've already taken over this property
      if (typeof(obj.___values[key]) != 'undefined')
        return;

      // Edge-case: don't error if property is immutable
      var descriptor = Object.getOwnPropertyDescriptor(obj, key)
      if (descriptor && descriptor.writable === false)
        return;

      // Store the actual value for retrieval
      obj.___values[key] = obj[key]

      // Replace this value w/ getter/setter
      _listen(obj, key, handlers, parentHandlers, emitNewProps)

      // Descend into objects
      if (obj.___values[key] && (typeof(obj.___values[key]) == 'object')) {
        var childParentHandlers = {
          get: function(___, childFullPathStr, value) {
            var _path = obj.___fullPathStr
              ? childFullPathStr.replace(obj.___fullPathStr+'.', '')
              : childFullPathStr

            handlers.get(obj, _path, value)
            parentHandlers.get(obj, childFullPathStr, value)
          }

          ,set: function(___, childFullPathStr, newValue, oldValue) {
            var _path = obj.___fullPathStr
              ? childFullPathStr.replace(obj.___fullPathStr+'.', '')
              : childFullPathStr

            handlers.set(obj, _path, newValue, oldValue)
            parentHandlers.set(obj, childFullPathStr, newValue, oldValue)
          }
        }

        owatch(obj.___values[key], handlers, childParentHandlers, path.concat(key))
      }
    })
  }

  function _update(o) {
    obj = extend(obj, o)
    _wrapKeys(true)
    return obj
  }
}


function _listen(obj, key, handlers, parentHandlers, emitNow) {
  Object.defineProperty(obj, key, {
    enumerable: true

    ,get: function() {
      var val = obj.___values[key]

      try {
        handlers.get(obj, key, val)
        parentHandlers.get(obj, [obj.___fullPathStr, key].join('.'), val)
      }
      catch (ex) { console.error('Exception in GET handler for ' + key, ex)}

      return val
    }

    ,set: function(newValue) {
      var oldValue = obj.___values[key]

      _set(newValue, oldValue)
    }
  })

  if (emitNow)
    _set(obj.___values[key], undefined);


  function _set(newValue, oldValue) {
    var newv = newValue

    if (typeof(newValue) == 'function')
      newv = function() { return newValue.apply(obj, arguments) }

    if (newValue && (newValue instanceof Array)) {
      // override push(), pop(), shift(), unshift(), splice(), [... ?]
    }

    // Short-curcuit if no change
    if (deepEquals(oldValue, newv))
      return;

    if (newValue && typeof(newValue) == 'object')
      newv = owatch(newValue, handlers, obj.___fullPath.concat(key))

    obj.___values[key] = newv

    try {
      handlers.set(obj, key, newv, oldValue)
      parentHandlers.set(obj, obj.___fullPathStr, newv, oldValue)
    }
    catch (ex) { console.error('Exception in SET handler for ' + key, ex)}
  }
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


