var owatch = require('./owatch')
  , extend = require('extend')
  , EventEmitter = require('events').EventEmitter
  , Hogan = require('hogan.js')

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
  owatch._makeHidden(watched, 'template', template.bind(watched))

  return watched
}


function template(container, tpl, mkctx) {
  var refs = {}
    , render = _render.bind(this)
    , timer

  tpl = Hogan.compile(tpl)

  var refcatcher = owatch(extend(true, {}, this), null, {
    get: function(obj, prop, val) {
      refs[prop] = true
    }
  })

  // This will flag all getters called on state
  _render.call(refcatcher, container, tpl, mkctx)

  this.on('change', function(prop, newVal) {
    if (timer)
      return;

    if (refs.hasOwnProperty(prop)) {
      timer = requestAnimationFrame(function() {
        render(container, tpl, mkctx)
        timer = null
      })
    }
  })
}

function _render(container, tpl, mkctx) {
  var html = tpl.render(mkctx.call(this))
  if (container)
    container.innerHTML = html;
  return html
}



module.exports.state = module.exports = state

