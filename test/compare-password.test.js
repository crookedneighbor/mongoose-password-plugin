import {
  comparePasswordCallback,
  comparePasswordPromise,
  comparePasswordSync
} from '../src/compare-password'
import passwordPlugin from '../src/'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { v4 as generateUuid } from 'uuid'

describe('Compare Password Methods', () => {
  let password, testDoc

  beforeEach(async () => {
    password = 'asdf'

    let testSchema = new mongoose.Schema({
      foo: String,
      password: String
    })
    testSchema.plugin(passwordPlugin)
    let TestModel = mongoose.model(`Test-${generateUuid()}`, testSchema)

    testDoc = new TestModel({
      foo: 'bar',
      password
    })
    await testDoc.save()
  })

  describe('comparePasswordCallback', () => {
    let comparePassword

    beforeEach(async () => {
      comparePassword = comparePasswordCallback({
        passwordField: 'password'
      }).bind(testDoc)
    })

    it('returns match as true if password matches', (done) => {
      comparePassword(password, (err, match) => {
        expect(err).to.not.exist
        expect(match).to.eql(true)
        done()
      })
    })

    it('returns match as true if password matches', (done) => {
      comparePassword('some other password', (err, match) => {
        expect(err).to.not.exist
        expect(match).to.eql(false)
        done()
      })
    })

    it('returns error if bcrypt errors', (done) => {
      sandbox.stub(bcrypt, 'compare').yields('a bcrypt error')

      comparePassword('some other password', (err, match) => {
        expect(err).to.eql('a bcrypt error')
        done()
      })
    })
  })

  describe('comparePasswordSync', () => {
    let comparePassword

    beforeEach(async () => {
      comparePassword = comparePasswordSync({
        passwordField: 'password'
      }).bind(testDoc)
    })

    it('returns true if password matches', () => {
      let match = comparePassword(password)

      expect(match).to.eql(true)
    })

    it('returns false if password does not match', () => {
      let match = comparePassword('some other password')

      expect(match).to.eql(false)
    })
  })

  describe('comparePasswordPromise', () => {
    let comparePassword

    beforeEach(async () => {
      comparePassword = comparePasswordPromise({
        passwordField: 'password'
      }).bind(testDoc)
    })

    it('resolves true if password matches', async () => {
      await expect(comparePassword(password)).to.eventually.eql(true)
    })

    it('resolves false if password does not match', async () => {
      await expect(comparePassword('some other password')).to.eventually.eql(false)
    })

    it('rejects if there is a bcrypt error', async () => {
      sandbox.stub(bcrypt, 'compare').yields('a bcrypt error')

      await expect(comparePassword(password)).to.eventually.be.rejected.and.eql('a bcrypt error')
    })
  })
})
