require('./global')
const {expect} = require('chai')
const sinon = require('sinon')
const {Basement, BaseBoundary} = require('../src/index')

class Boundary extends BaseBoundary {
  static init () {}

  static stop () {}
}

class App extends Basement {
  startSequence () {}

  stopSequence () {}
}

describe('basement', function () {
  let app, logger

  beforeEach(function () {
    logger = {
      info: sinon.spy(),
      error: sinon.spy(),
      trace: sinon.spy()
    }

    const boundaries = {
      boundary: Boundary
    }

    const settings = {
      some: 'val'
    }

    app = new App({settings, logger, boundaries})
  })

  it('should start and stop', async function () {
    await app.start()
    await app.stop()
  })

  it('should start and stop', async function () {
    await app.start()
    await app.stop()
  })

  it('should use provided logger', async function () {
    await app.start()
    expect(app.logger === logger).to.eq(true)
  })
})
