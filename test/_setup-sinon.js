const sinon = require('sinon')

global.sandbox = sinon.createSandbox()

afterEach(() => {
  sandbox.restore()
})
