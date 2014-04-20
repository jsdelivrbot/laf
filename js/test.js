var owatch = require('./owatch')
  , laf = require('./laf')


var app = {
  entry_options: [
    {
       id:'abcd1234'
      ,inputs: [
        {
           type: 'text'
        }
      ]
    }
  ]
}

// Circular reference
app.entry_options[0].inputs[0].opt = app.entry_options[0]

var template = "<h1>input.0 for {{opt.id}}</h1>"


window.state = laf(app)


window.tplhtml = state.entry_options[0].inputs[0].addTemplate($('body'), template)

