var owatch = require('./owatch')
  , extend = require('extend')
  , EventEmitter = require('events').EventEmitter
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


function addTemplate(container, tpl, mkctx) {
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
      _render(extend(true, {}, self), parentDiv, tpl, mkctx)
      timer = null
    })
  })

  // Initial render will flag all getters called on state
  _render(refcatcher, parentDiv, tpl, mkctx)

  return this
}

function _render(state, container, tpl, mkctx) {
  var html = tpl.render(mkctx(state))

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
  obj.on || owatch._makeHidden(obj, 'on', EventEmitter.prototype.on.bind(obj))
  obj.emit || owatch._makeHidden(obj, 'emit', EventEmitter.prototype.emit.bind(obj))
  obj.addTemplate || owatch._makeHidden(obj, 'addTemplate', addTemplate.bind(obj))
}



module.exports.state = module.exports = state

