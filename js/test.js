var owatch = require('./owatch')
  , laf = require('./laf')

// var shiner = owatch({
//    breath_quality: 'bad'
//   ,current_activity: 'sleeping'
//   ,nested_child: {
//     nested_nested_child: {
//        a: 'old-a'
//       ,b: 'old-b'
//       ,c: 'old-c'
//     }
//   }
// }, {
//    get: function(){ console.log("_Getcb", arguments) }
//   ,set: function(){ console.log("_Setcb", arguments) }
// })

var tpl = $('#tpl-shiner').html().trim()

var shiner = laf({
   breath_quality: 'bad'
  ,current_activity: 'sleeping'
  ,nested_child: {
    nested_nested_child: {
       a: 'old-a'
      ,b: 'old-b'
      ,c: 'old-c'
    }
  }
})


shiner.addTemplate($('#shiner'), tpl, function(state) {
  return $.extend(true, {}, state)
})

window.shiner = shiner

