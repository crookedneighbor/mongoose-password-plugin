const bcrypt = require('bcrypt')
const { get } = require('lodash')

function comparePasswordCallback (config) {
  const { passwordField } = config

  return function (passwordToCheck, cb) {
    const password = get(this, passwordField)

    bcrypt.compare(passwordToCheck, password, (err, isMatch) => {
      if (err) return cb(err)

      cb(null, isMatch)
    })
  }
}

function comparePasswordSync (config) {
  const { passwordField } = config

  return function (passwordToCheck) {
    const password = get(this, passwordField)
    const match = bcrypt.compareSync(passwordToCheck, password)

    return match
  }
}

function comparePasswordPromise (config) {
  const { passwordField } = config

  return async function (passwordToCheck) {
    return new Promise((resolve, reject) => {
      const password = get(this, passwordField)

      bcrypt.compare(passwordToCheck, password, (err, isMatch) => {
        if (err) return reject(err)

        resolve(isMatch)
      })
    })
  }
}

module.exports = {
  comparePasswordCallback,
  comparePasswordSync,
  comparePasswordPromise
}
