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

window.laf = laf

var shiner = laf({
   breath_quality: 'bad'
  ,current_activity: 'sleeping'
  ,nest: {
    subnest: {
       a: 'old-a'
      ,b: 'old-b'
      ,c: 'old-c'
    }
  }
})


shiner.addTemplate($('#shiner'), tpl, function(state) {
  // return $.extend(true, {}, state)
  return {
     current_activity: state.current_activity
    ,breath_quality: state.breath_quality
    ,something_nested: state.nest.subnest.b
  }
})

window.shiner = shiner

