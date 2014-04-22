var owatch = require('./owatch')
  , laf = require('./laf')


var user = laf({
  name: 'shiner',
  plan: '2'
})

var raffle = laf({
  "id": "abcd1234"
})


window.user = user
window.raffle = raffle



var tpl = "{{user_name}} is on plan {{user_plan}}. \n" +
          "also, this is the preview page for {{raffle_id}}"


var preview_page = function(_user, _raffle) {
  return {
    user_name: _user.name,
    user_plan: _user.plan,
    raffle_id: _raffle.id
  }
}


var dom = laf.template([user, raffle], tpl, {
   mkctx: preview_page
  ,container: document.getElementById('shiner')
})


