var laf = require('./laf')

var app = laf({
   shiner_has: 'bad breath'
  ,cls: 'here'
})

var tpl = $('#tpl-shiner').html().trim()

var shinerTpl = app.addTemplate($('#shiner'), tpl,
  function() {
    return {
       shiner_has: this.shiner_has
      ,cls: this.cls
    }
  }
)

window.shiner = app

