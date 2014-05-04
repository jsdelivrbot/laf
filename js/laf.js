var observed = require('observed')
  , extend = require('extend')
  , Hogan = require('hogan.js')
  , diffDOM = require('diffDOM')

var differ = new diffDOM



module.exports = template
module.exports.observe = observed



function template(states, tpl, opts) {
  var parentDiv = document.createElement('div')
    , currentHTML = ''
    , renderTimeout

  if (! (states && tpl))
    throw new Error("Templates require at least state[s] and a template.");

  // be lenient in what we accept
  if (opts.container && opts.container.jquery)
    opts.container = opts.container[0];

  _isArray(states) || (states = [states])

  parentDiv.style.display = 'inline'

  opts.container = opts.container
    ? opts.container.appendChild(parentDiv)
    : parentDiv

  opts.mkctx || (opts.mkctx = __mkctx)
  tpl = Hogan.compile(tpl)

  // TODO: we can probably optimize when we choose to render, instead of 
  //       rendering on every change. But rendering is relatively cheap (since
  //       we don't update DOM if we don't have to), so it's left out for now
  observed(states).on('changed', function() {
    currentHTML = _render(states, parentDiv, tpl, opts, currentHTML)
  })

  currentHTML = _render(states, parentDiv, tpl, opts, '')

  return parentDiv
}


function _render(states, container, tpl, opts, oldHTML) {
  // TODO: should probably make these immutable
  var _states = states.map(_deepClone)

  var ctx = opts.mkctx.apply(null, _states)
  var html = tpl.render(ctx, opts.partials)

  if (container) {
    var oldDOM = document.createElement('div')
      , newDOM = document.createElement('div')

    oldDOM.innerHTML = oldHTML || ''
    newDOM.innerHTML = html

    var diff = differ.diff(oldDOM, newDOM)

    if (diff.length) {
      differ.apply(container, diff)
      container.dispatchEvent(new Event('render'))
    }
  }

  return html
}




function _isArray(obj) {
  return !!~Object.prototype.toString.call(obj).indexOf(' Array')
}

function _deepClone(obj) {
  return extend(true, {}, obj)
}

function __mkctx() {
  var args = Array.prototype.slice.call(arguments)
  args.unshift(true, {})
  return extend.apply(null, args)
}




/* TODO:
 *  - track variable references so we only update a component
 *      when a relevant property changes
 *  - make states immutable before passing to mkctx()
 */
