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
      obj.___emit('change', path, newVal, oldVal)
    }
  })

  return watched
}


function template(states, tpl, opts) {
  var refs = {}
    , parentDiv = document.createElement('div')
    , refcatchers = []
    , timer

  if (! (states && tpl))
    throw new Error("Please provide a state[s] and tpl");

  if (! (states.___values || (states instanceof Array)))
    throw new Error("state[s] should be a laf object or an array of laf objects");

  if (states.___values)
    states = [states];

  if (jQuery && jQuery.fn && jQuery.fn.jquery && (opts.container instanceof jQuery))
    opts.container = opts.container[0];

  parentDiv.style.display = 'inline'

  opts.container = opts.container
    ? opts.container.appendChild(parentDiv)
    : parentDiv

  opts.mkctx = opts.mkctx || __mkctx
  tpl = Hogan.compile(tpl)

  states.forEach(function(s) {
    var _refcatch = extend(true, {}, s)

    refcatchers.push(owatch(_refcatch, {
      get: function(obj, path, val) {
        // TODO: refs are not grouped by state, so we could render more
        //       often than we need to. doesn't matter too much b/c
        //       rendering is cheap
        if (obj == _refcatch)
          refs[path] = true;
      }
    }))

    s.___on('change', function(path, newVal) {
      if ((this != s) || (! refs[path]))
        return;

      timer = timer || requestAnimationFrame(function() {
        // TODO: should probably disable setters altogether here?
        _render(states, parentDiv, tpl, opts)
        timer = null
      })
    })
  })

  // Initial render will flag all getters called on state
  _render(refcatchers, parentDiv, tpl, extend({}, opts, {container:parentDiv}))

  return parentDiv
}

function _render(states, container, tpl, opts) {
  var ctx = opts.mkctx.apply(null, states)
    , html = tpl.render(ctx, opts.partials)

  if (container) {
    var oldDOM = document.createElement('div')
    var newDOM = document.createElement('div')
    oldDOM.innerHTML = container.innerHTML
    newDOM.innerHTML = html

    var diff = differ.diff(oldDOM, newDOM)
    differ.apply(container, diff)

    if (diff.length) {
      // TODO: how to make this catchable by jquery?
      container.dispatchEvent(new Event('render'))
    }
  }

  return html
}


function __mkctx() {
  if (arguments.length == 1)
    return arguments[0];

  var args = Array.prototype.slice.apply(arguments)
  args = args.map(function(x){ return x.___values||x })
  args.unshift(true, {})
  return extend.apply(null, args)
}

function __clone() {
  return extend(true, {}, this)
}

function __initWatched(obj) {
  var on = _on.bind(obj)
    , emit = _emit.bind(obj)
    , at = _getPath.bind(obj)

  // If user is using reserved name, don't clobber it
  obj.on || owatch._makeHidden(obj, 'on', on)
  obj.at || owatch._makeHidden(obj, 'getPath', at)
  obj.update || owatch._makeHidden(obj, 'update', obj.___update)

  // Fallbacks if user is using reserved name
  owatch._makeHidden(obj, '___on', on)
  owatch._makeHidden(obj, '___at', at)
  owatch._makeHidden(obj, '___emit', emit)
}


function _on(evt, listener) {
  this.___listeners || owatch._makeHidden(this, '___listeners', {})
  this.___listeners[evt] || (this.___listeners[evt] = [])
  this.___listeners[evt].push(listener)
  return this
}

function _off(evt, listener) {
  // TODO
}

function _emit(evt) {
  var args = Array.prototype.slice.call(arguments, 1)
    , listeners = (this.___listeners||{})[evt] || []

  for (var i=0, len=listeners.length; i<len; i++) {
    listeners[i].apply(this, args)
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
    , key = path.substr(ind)
    , obj = _getPath.call(this, parentPath)

  obj[key] = newValue
}



module.exports.state = module.exports = state
module.exports.template = template

