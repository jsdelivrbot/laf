// var laf = require('./laf2')

// var guy = {name:{first:'shiner', last:'dog'}}
//   , tpl = "This guy is named: {{name.first}} {{name.last}}"

// laf(guy, tpl, {container:$('#shiner')})

// window.guy = guy


var observed = require('observed')

var family = {children:[{name:'shiner'}, {name:'mutt'}]}

var ff = observed(family)

var ee = observed(family.children[0])

ee.on('changed', function(){ console.log('HEY', this) })

var aaa = [{wat:'time'}, family]

observed(aaa).on('changed', function() {
  console.log("WWWWWWWWWWWW", arguments)
})


window.family = family
window.aaa = aaa

$('body').append('<iframe id="framezor" src="/_frame.html"></iframe>')
$('#framezor')[0].contentWindow.WAT = aaa

