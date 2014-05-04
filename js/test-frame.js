var observed = require('observed')

observed(window.WAT[1]).on('changed', function() {
  console.log("INSIDE FRAME", arguments)
})

