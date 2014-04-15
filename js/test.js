var laf = require('./laf')

var app = laf({
   breath: 'stinky'
  ,toes: 'hairy'
  ,health: {
     lazy: 'moderate'
    ,awesome: true
  }
})

var tpl = $('#tpl-shiner').html().trim()

var shinerTpl = app.addTemplate($('#shiner'), tpl,
  function() {
    return {his_feet: 'has ' + this.toes}
  }
)

window.shiner = app

