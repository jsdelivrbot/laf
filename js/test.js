var owatch = require('./owatch')
  , laf = require('./laf')


var user = laf({
  name: 'shiner',
  plan: '2'
})

var raffle = laf({
  raffle_id: "abcd1234"
})


window.user = user
window.raffle = raffle



var tpl = "{{name}} is on plan {{plan}}. \n" +
          "also, this is the preview page for {{raffle_id}}"

var dom = laf.template([user, raffle], tpl, {
  container: document.getElementById('shiner')
})


