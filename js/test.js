var laf = require('./laf')

var app = laf({
   breath: 'stinky'
  ,toes: 'hairy'
  ,health: {
     lazy: 'moderate'
    ,awesome: true
  }
})

var shinerTpl = laf.template(app, function(app) {
  return "toes: " + app.toes
}, {render:function(){}})

window.shiner = app

