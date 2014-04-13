var owatch = require('./owatch')

function state(obj) {
  var watched = owatch(obj, null, {
     get: function(){ console.log("GET", arguments) }
    ,set: function(){ console.log("SET", arguments)}
  })
  return watched
}

state.prototype.template = function(mkctx, tpl) {
}



module.exports = state

