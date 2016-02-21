import sinon from 'sinon'

global.sandbox = sinon.sandbox.create()

afterEach(() => {
  sandbox.restore()
})
