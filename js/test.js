var laf = require('./laf')

var app = laf({
   shiner_has: 'bad breath'
  ,cls: 'here'
})

var tpl = $('#tpl-shiner').html().trim()

var shinerTpl = app.addTemplate($('#shiner'), tpl,
  function(state) {
    return {
       shiner_has: state.shiner_has
      ,cls: state.cls
    }
  }
)

window.shiner = app

