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
      obj.emit('change', obj, path, newVal, oldVal)
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

  var _refcatch = extend(true, {__is_refcatch:true}, this)

  var refcatcher = owatch(_refcatch, {
    get: function(obj, path, val) {
      if (obj == _refcatch)
        refs[path] = true;
    }
  })

  this.on('change', function(obj, path, newVal) {
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

  return this
}

function _render(state, container, tpl, mkctx, partials) {
  var html = tpl.render(mkctx(state), {partials: partials})

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
  // 3 reserved key names: on, emit, addTemplate
  obj.on || owatch._makeHidden(obj, 'on', _on.bind(obj))
  obj.emit || owatch._makeHidden(obj, 'emit', _emit.bind(obj))
  obj.addTemplate || owatch._makeHidden(obj, 'addTemplate', addTemplate.bind(obj))
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



module.exports.state = module.exports = state

