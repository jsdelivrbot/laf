var express = require('express')
  , enchilada = require('enchilada')

var app = express()

app.use(enchilada(__dirname + '/js'))
app.use(express.static(__dirname + '/static'))



app.listen(8000)

