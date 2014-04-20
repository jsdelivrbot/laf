/* TODO:
 *  - doesn't handle objects with circular references
 */

var owatch = require('./owatch')
  , extend = require('extend')
  , Hogan = require('hogan.js')
  , diffDOM = require('diffDOM')

var differ = new diffDOM()


function state(obj) {
  obj || (obj = {})

  var watched = owatch(obj, {
     init: __initWatched

    ,set: function(obj, path, newVal, oldVal) {
      obj.__emit('change', obj, path, newVal, oldVal)
    }
  })

  return watched
}


function addTemplate(container, tpl, mkctx, partials) {
  var refs = {}
    , parentDiv = document.createElement('div')
    , self = this
    , timer

  if (jQuery && jQuery.fn && jQuery.fn.jquery && (container instanceof jQuery))
    container = container[0];

  container.appendChild(parentDiv)

  mkctx = mkctx || __identity
  tpl = Hogan.compile(tpl)

  var _refcatch = extend(true, {}, this)

  var refcatcher = owatch(_refcatch, {
    get: function(obj, path, val) {
      if (obj == _refcatch)
        refs[path] = true;
    }
  })

  this.__on('change', function(obj, path, newVal) {
    if ((obj != self) || (! refs[path]))
      return;

    timer = timer || requestAnimationFrame(function() {
      // TODO: should probably disable setters altogether here?
      _render(extend(true, {}, self), parentDiv, tpl, mkctx, partials)
      timer = null
    })
  })

  // Initial render will flag all getters called on state
  _render(refcatcher, parentDiv, tpl, mkctx, partials)

  return parentDiv
}

function _render(state, container, tpl, mkctx, partials) {
  var html = tpl.render(mkctx(state), partials)

  if (container) {
    var oldDOM = document.createElement('div')
    var newDOM = document.createElement('div')
    oldDOM.innerHTML = container.innerHTML
    newDOM.innerHTML = html

    var diff = differ.diff(oldDOM, newDOM)
    differ.apply(container, diff)
  }

  return html
}


function __identity(x) { return x }

function __clone() {
  return extend(true, {}, this)
}

function __initWatched(obj) {
  var on = _on.bind(obj)
    , emit = _emit.bind(obj)
    , atpl = addTemplate.bind(obj)
    , get = _getPath.bind(obj)
    , set = _setPath.bind(obj)

  // If user is using reserved name, don't clobber it
  obj.on || owatch._makeHidden(obj, 'on', on)
  obj.emit || owatch._makeHidden(obj, 'emit', emit)
  obj.get || owatch._makeHidden(obj, 'get', get)
  obj.set || owatch._makeHidden(obj, 'set', set)
  obj.addTemplate || owatch._makeHidden(obj, 'addTemplate', atpl)

  // Fallbacks if user is using reserved name
  owatch._makeHidden(obj, '___on', on)
  owatch._makeHidden(obj, '___emit', emit)
  owatch._makeHidden(obj, '___get', get)
  owatch._makeHidden(obj, '___set', set)
  owatch._makeHidden(obj, '___addTemplate', atpl)
}


function _on(evt, listener) {
  this.__listeners || owatch._makeHidden(this, '__listeners', {})
  this.__listeners[evt] || (this.__listeners[evt] = [])
  this.__listeners[evt].push(listener)
  return this
}

function _off(evt, listener) {
  // TODO
}

function _emit(evt) {
  var args = Array.prototype.slice.call(arguments, 1)
    , listeners = (this.__listeners||{})[evt] || []

  for (var i=0, len=listeners.length; i<len; i++) {
    listeners[i].apply(null, args)
  }
}

function _getPath(path) {
  var segs = path.split('.')
    , obj = null

  while (segs.length) {
    obj = (obj||this)[segs.shift()];
  }
  return obj || this;
}

function _setPath(path, newValue) {
  var ind = path.lastIndexOf('.')
    , parentPath = path.substr(0, ind)
    , key = patph.substr(ind)
    , obj = _getPath.call(this, parentPath)

  obj[key] = newValue
}



module.exports.state = module.exports = state

