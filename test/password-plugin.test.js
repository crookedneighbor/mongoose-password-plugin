const passwordPlugin = require('../src/')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const generateUuid = require('uuid').v4

describe('passwordPlugin', () => {
  it('adds a password field to model', async () => {
    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(testDoc.password).to.be.a('string')
  })

  it('allows password field to be configurable', async () => {
    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      passwordField: 'pwd'
    })
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      pwd: 'asdf'
    })

    await testDoc.save()

    expect(testDoc.password).to.equal(undefined)
    expect(testDoc.pwd).to.be.a('string')
  })

  it('allows password field to be configurable as a nested field', async () => {
    const testSchema = new mongoose.Schema({
      foo: String,
      auth: { }
    })
    testSchema.plugin(passwordPlugin, {
      passwordField: 'auth.local.pwd'
    })
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      auth: {
        local: {
          pwd: 'asdf'
        }
      }
    })

    await testDoc.save()

    expect(testDoc.auth.local.pwd).to.be.a('string')
  })

  it('saves hashed version of password', async () => {
    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(testDoc.password).to.not.eql('asdf')
  })

  it('saves hashed version of configured nested password', async () => {
    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      passwordField: 'auth.local.pwd'
    })
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      auth: {
        local: {
          pwd: 'asdf'
        }
      }
    })

    await testDoc.save()

    expect(testDoc.auth.local.pwd).to.not.eql('asdf')
  })

  it('re-hashes password when password is saved', async () => {
    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    const oldHashedPassword = testDoc.password

    testDoc.password = 'foobar'

    await testDoc.save()

    expect(testDoc.password).to.not.eql('foobar')
    expect(testDoc.password).to.not.eql(oldHashedPassword)
  })

  it('defaults to setting rounds to 10 for salt generation', async () => {
    sandbox.spy(bcrypt, 'genSalt')

    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(bcrypt.genSalt).to.be.calledWith(10)
  })

  it('allows setting number of rounds for salt generation', async () => {
    sandbox.spy(bcrypt, 'genSalt')

    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      bcryptRounds: 13
    })
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(bcrypt.genSalt).to.be.calledWith(13)
  })

  it('adds a comparePassword method', async function () {
    this.timeout(4000)

    const testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      bcryptRounds: 13
    })
    const TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    const testDoc = new TestModel({
      foo: 'bar',
      password: 'password'
    })

    await testDoc.save()

    await expect(testDoc.comparePassword('foo')).to.eventually.equal(false)
    await expect(testDoc.comparePassword('password')).to.eventually.equal(true)

    testDoc.password = 'new password'
    await testDoc.save()

    await expect(testDoc.comparePassword('password')).to.eventually.equal(false)
    await expect(testDoc.comparePassword('new password')).to.eventually.equal(true)
  })
})
