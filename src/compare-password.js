import bcrypt from 'bcrypt'
import { get } from 'lodash'

export function comparePasswordCallback (config) {
  let { passwordField } = config

  return function (passwordToCheck, cb) {
    let password = get(this, passwordField)

    bcrypt.compare(passwordToCheck, password, (err, isMatch) => {
      if (err) return cb(err)

      cb(null, isMatch)
    })
  }
}

export function comparePasswordSync (config) {
  let { passwordField } = config

  return function (passwordToCheck) {
    let password = get(this, passwordField)
    let match = bcrypt.compareSync(passwordToCheck, password)

    return match
  }
}

export function comparePasswordPromise (config) {
  let { passwordField } = config

  return async function (passwordToCheck) {
    return new Promise((resolve, reject) => {
      let password = get(this, passwordField)

      bcrypt.compare(passwordToCheck, password, (err, isMatch) => {
        if (err) return reject(err)

        resolve(isMatch)
      })
    })
  }
}
