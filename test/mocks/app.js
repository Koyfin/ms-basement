const {Basement, BaseBoundary} = require('../../src/index')

class Boundary extends BaseBoundary {
  static init () {}

  static stop () {}
}

class App extends Basement {
  startSequence () {}

  stopSequence () {}
}

module.exports = {
  Boundary,
  App
}
