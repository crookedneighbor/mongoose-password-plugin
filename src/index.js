import bcrypt from 'bcrypt'
import { get, set } from 'lodash'

function passwordPlugin (schema, options = {}) {
  let {
    bcryptRounds = 10,
    comparePasswordType = 'callback',
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
      return next()
    }

    bcrypt.genSalt(bcryptRounds, (err, salt) => {
      if (err) return next(err)

      let password = get(this, passwordField)
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return next(err)

        set(this, passwordField, hash)

        next()
      })
    })
  })

  if (comparePasswordType === 'callback') {
    schema.methods.comparePassword = function (passwordToCheck, cb) {
      let password = get(this, passwordField)

      bcrypt.compare(passwordToCheck, password, (err, isMatch) => {
        if (err) return cb(err)

        cb(null, isMatch)
      })
    }
  } else if (comparePasswordType === 'promise') {
    schema.methods.comparePassword = async function (passwordToCheck) {
      return new Promise((resolve, reject) => {
        let password = get(this, passwordField)

        bcrypt.compare(passwordToCheck, password, (err, isMatch) => {
          if (err) return reject(err)

          resolve(isMatch)
        })
      })
    }
  } else if (comparePasswordType === 'sync') {
    schema.methods.comparePassword = function (passwordToCheck) {
      let password = get(this, passwordField)
      let match = bcrypt.compareSync(passwordToCheck, password)

      return match
    }
  } else {
    throw new Error(`${comparePasswordType} is not a supported type for 'comparePasswordType'`)
  }
}

export default passwordPlugin
