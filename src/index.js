const bcrypt = require('bcrypt')
const { get, set } = require('lodash')
const {
  comparePasswordCallback,
  comparePasswordPromise,
  comparePasswordSync
} = require('./compare-password')

const comparePasswordMethods = {
  callback: comparePasswordCallback,
  promise: comparePasswordPromise,
  sync: comparePasswordSync
}

function passwordPlugin (schema, options = {}) {
  const {
    bcryptRounds = 10,
    comparePasswordType = 'callback',
    passwordField = 'password'
  } = options

  let comparePasswordMethod = comparePasswordMethods[comparePasswordType]

  if (!comparePasswordMethod) {
    throw new Error(`${comparePasswordType} is not a supported type for 'comparePasswordType'`)
  }

  comparePasswordMethod = comparePasswordMethod({ passwordField }).bind(this)

  schema.add({
    [`${passwordField}`]: {
      type: String,
      required: true
    }
  })

  // http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
  schema.pre('save', function (next) {
    if (!this.isModified(passwordField)) {
      return next()
    }

    bcrypt.genSalt(bcryptRounds, (err, salt) => {
      if (err) return next(err)

      const password = get(this, passwordField)
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return next(err)

        set(this, passwordField, hash)

        next()
      })
    })
  })

  schema.methods.comparePassword = comparePasswordMethod
}

module.exports = passwordPlugin
