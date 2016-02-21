import passwordPlugin from '../src/'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { v4 as generateUuid } from 'uuid'

describe('passwordPlugin', () => {
  it('adds a password field to model', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(testDoc.password).to.exist
  })

  it('allows password field to be configurable', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      passwordField: 'pwd'
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      pwd: 'asdf'
    })

    await testDoc.save()

    expect(testDoc.password).to.not.exist
    expect(testDoc.pwd).to.exist
  })

  it('allows password field to be configurable as a nested field', async () => {
    let testSchema = new mongoose.Schema({
      foo: String,
      auth: { }
    })
    testSchema.plugin(passwordPlugin, {
      passwordField: 'auth.local.pwd'
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      auth: {
        local: {
          pwd: 'asdf'
        }
      }
    })

    await testDoc.save()

    expect(testDoc.auth.local.pwd).to.exist
  })

  it('saves hashed version of password', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(testDoc.password).to.not.eql('asdf')
  })

  it('saves hashed version of configured nested password', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      passwordField: 'auth.local.pwd'
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
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
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    let oldHashedPassword = testDoc.password

    testDoc.password = 'foobar'

    await testDoc.save()

    expect(testDoc.password).to.not.eql('foobar')
    expect(testDoc.password).to.not.eql(oldHashedPassword)
  })

  it('defaults to setting rounds to 10 for salt generation', async () => {
    sandbox.spy(bcrypt, 'genSalt')

    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin)
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(bcrypt.genSalt).to.be.calledWith(10)
  })

  it('allows setting number of rounds for salt generation', async () => {
    sandbox.spy(bcrypt, 'genSalt')

    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      bcryptRounds: 13
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    await testDoc.save()

    expect(bcrypt.genSalt).to.be.calledWith(13)
  })

  it('adds a comparePassword method', () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      bcryptRounds: 13
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })

    expect(testDoc).to.respondTo('comparePassword')
  })

  it('can configure comparePassword to use callback version', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      comparePasswordType: 'callback'
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })
    await testDoc.save()

    expect(testDoc.comparePassword).to.exist
  })

  it('can configure comparePassword to use sync version', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      comparePasswordType: 'sync'
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })
    await testDoc.save()

    expect(testDoc.comparePassword).to.exist
  })

  it('can configure comparePassword to use promise version', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    testSchema.plugin(passwordPlugin, {
      comparePasswordType: 'promise'
    })
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    let testDoc = new TestModel({
      foo: 'bar',
      password: 'asdf'
    })
    await testDoc.save()

    expect(testDoc.comparePassword).to.exist
  })

  it('throws an error if comparePasswordType is set to unsupported type', async () => {
    let testSchema = new mongoose.Schema({
      foo: String
    })
    expect(() => {
      testSchema.plugin(passwordPlugin, {
        comparePasswordType: 'anything else'
      })
    }).to.throw('anything else is not a supported type for \'comparePasswordType\'')
  })

  context('callback version of comparePassword', () => {
    let password, testDoc

    beforeEach(async () => {
      password = 'asdf'

      let testSchema = new mongoose.Schema({
        foo: String
      })
      testSchema.plugin(passwordPlugin, {
        comparePasswordType: 'callback'
      })
      let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

      testDoc = new TestModel({
        foo: 'bar',
        password
      })
      await testDoc.save()
    })

    it('returns match as true if password matches', (done) => {
      testDoc.comparePassword(password, (err, match) => {
        expect(err).to.not.exist
        expect(match).to.eql(true)
        done()
      })
    })

    it('returns match as true if password matches', (done) => {
      testDoc.comparePassword('some other password', (err, match) => {
        expect(err).to.not.exist
        expect(match).to.eql(false)
        done()
      })
    })

    it('returns error if bcrypt errors', (done) => {
      sandbox.stub(bcrypt, 'compare').yields('a bcrypt error')

      testDoc.comparePassword('some other password', (err, match) => {
        expect(err).to.eql('a bcrypt error')
        done()
      })
    })
  })

  context('sync version of comparePassword', () => {
    let password, testDoc

    beforeEach(async () => {
      password = 'asdf'

      let testSchema = new mongoose.Schema({
        foo: String
      })
      testSchema.plugin(passwordPlugin, {
        comparePasswordType: 'sync'
      })
      let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

      testDoc = new TestModel({
        foo: 'bar',
        password
      })
      await testDoc.save()
    })

    it('returns true if password matches', () => {
      let match = testDoc.comparePassword(password)

      expect(match).to.eql(true)
    })

    it('returns false if password does not match', () => {
      let match = testDoc.comparePassword('some other password')

      expect(match).to.eql(false)
    })
  })

  context('promise version of comparePassword', () => {
    let password, testDoc

    beforeEach(async () => {
      password = 'asdf'

      let testSchema = new mongoose.Schema({
        foo: String
      })
      testSchema.plugin(passwordPlugin, {
        comparePasswordType: 'promise'
      })
      let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

      testDoc = new TestModel({
        foo: 'bar',
        password
      })
      await testDoc.save()
    })

    it('resolves true if password matches', async () => {
      await expect(testDoc.comparePassword(password)).to.eventually.eql(true)
    })

    it('resolves false if password does not match', async () => {
      await expect(testDoc.comparePassword('some other password')).to.eventually.eql(false)
    })

    it('rejects if there is a bcrypt error', async () => {
      sandbox.stub(bcrypt, 'compare').yields('a bcrypt error')

      await expect(testDoc.comparePassword(password)).to.eventually.be.rejected.and.eql('a bcrypt error')
    })
  })
})
