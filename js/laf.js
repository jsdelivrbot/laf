var owatch = require('./owatch')
  , extend = require('extend')
  , EventEmitter = require('events').EventEmitter
  , Hogan = require('hogan.js')
  , diffDOM = require('diffDOM')

var differ = new diffDOM()


// TODO: why do we do this?
window.extend = extend

function state(obj) {
  obj || (obj = {})

  var watched = owatch(obj, null, {set: function(obj, prop, oldVal, newVal) {
    console.log("SET", prop, 'from', oldVal, '-->', newVal)
    watched.emit('change', prop, newVal, oldVal)
  }.bind(this)})

  // 3 reserved key names: on, emit, template
  owatch._makeHidden(watched, 'on', EventEmitter.prototype.on.bind(watched))
  owatch._makeHidden(watched, 'emit', EventEmitter.prototype.emit.bind(watched))
  owatch._makeHidden(watched, 'addTemplate', template.bind(watched))

  return watched
}


function template(container, tpl, mkctx) {
  var refs = {}
    , timer

  if (jQuery && jQuery.fn && jQuery.fn.jquery && (container instanceof jQuery))
    container = container[0];

  mkctx = mkctx || __identity
  tpl = Hogan.compile(tpl)

  var refcatcher = owatch(extend(true, {}, this), null, {
    get: function(obj, prop, val) {
      refs[prop] = true
    }
  })

  // This will flag all getters called on state
  _render(refcatcher, container, tpl, mkctx)

  this.on('change', function(prop, newVal) {
    if (timer)
      return;

    if (refs.hasOwnProperty(prop)) {
      timer = requestAnimationFrame(function() {
        // TODO: should probably disable setters altogether here
        _render(extend(true, {}, this), container, tpl, mkctx)
        timer = null
      }.bind(this))
    }
  }.bind(this))
}

function _render(state, container, tpl, mkctx) {
  var html = tpl.render(mkctx.call(state))

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



module.exports.state = module.exports = state

