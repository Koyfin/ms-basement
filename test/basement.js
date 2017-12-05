require('./global')
const {expect} = require('chai')
const sinon = require('sinon')
const {App, Boundary} = require('./mocks/app')

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
