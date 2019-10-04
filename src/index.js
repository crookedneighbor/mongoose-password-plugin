const { get, set } = require('lodash')
const bcrypt = require('bcrypt')

function passwordPlugin (schema, options = {}) {
  const {
    bcryptRounds = 10,
    passwordField = 'password'
  } = options

  schema.add({
    [`${passwordField}`]: {
      type: String,
      required: true
    }
  })

  // http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
  schema.pre('save', function (next) {
    if (!this.isModified(passwordField)) {
      next()

      return
    }

    bcrypt.genSalt(bcryptRounds).then(salt => {
      const password = get(this, passwordField)

      return bcrypt.hash(password, salt)
    }).then(hash => {
      set(this, passwordField, hash)

      next()
    }).catch(next)
  })

  schema.methods.comparePassword = function (passwordToCheck) {
    const password = get(this, passwordField)

    return bcrypt.compare(passwordToCheck, password)
  }
}

module.exports = passwordPlugin
