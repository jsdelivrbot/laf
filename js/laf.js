var owatch = require('./owatch')
  , extend = require('extend')
  , EventEmitter = require('events').EventEmitter

window.extend = extend

function state(obj) {
  if (! (this instanceof state))
    return new state(obj);

  obj || (obj = {})

  // event emitting
  if (obj.on === undefined) {
    owatch._makeHidden(obj, 'on', this.on.bind(this))
  }

  var watched = owatch(obj, null, {set: function(obj, prop, oldVal, newVal) {
    console.log("SET", prop, 'from', oldVal, '-->', newVal)
    this.emit('change', prop, newVal, oldVal)
  }.bind(this)})

  return watched
}

// inherit
state.prototype = Object.create(EventEmitter.prototype)


function template(state, mkctx, tpl) {
  if (! (this instanceof template))
    return new template(state, mkctx, tpl);

  var refs = {}
    , rerender

  var watched = owatch(extend(true, {}, state), null, {
    get: function(obj, prop, val) {
      refs[prop] = true
    }
  })

  // This will flag all getters called on state
  _render(mkctx, tpl, watched)

  state.on('change', function(prop, newVal) {
    if (refs.hasOwnProperty(prop)) {
      _render(mkctx, tpl, state);
    }
  }.bind(this))
}

function _render(mkctx, tpl, state) {
  $('#shiner').html(mkctx(state))
}



module.exports.state = module.exports = state
module.exports.template = template

