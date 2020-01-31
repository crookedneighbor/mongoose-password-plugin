# mongoose-password-plugin
A plugin that attaches a hashed password to a mongoose model using bcrypt

## Installation

```bash
npm i -S mongoose-password-plugin
```

## Usage

Using this plugin attaches a password field to your model. It's automatically hashed using [bcrypt](https://www.npmjs.com/package/bcrypt), so you never store the plaintext password in your database.

```js
// user model file
const passwordPlugin = require('mongoose-password-plugin')
const mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
  foo: String
})

userSchema.plugin(passwordPlugin)

module.exports = mongoose.model('User', userSchema)
```

```js
// creating a new user
const User = require('./path/to/user/model/file')

let user = new User({
  password: 'asdf'
})

user.save().then(savedUser => {
  savedUser.password // hashed version of the password
})
```

```js
// checking the user's password
let correctPassword = 'asdf'
let incorrectPassword = 'not asdf'

user.comparePassword(correctPassword).then(match => {
  match // true
})

user.comparePassword(incorrectPassword).then(match => {
  match // false
})
```

```js
// changing the user's password
user.password = 'a new password'

user.save().then(savedUser => {
  savedUser.password // the hashed version of the new password
})
```

## Options

You can pass in an optional configuration object as a second argument. Below are all the options available with their default values:

```js
userSchema.plugin(passwordPlugin, {
  passwordField: 'password',
  bcryptRounds: 10
})
```

### passwordField

This indicates what to use as the password field on the model. By default it'll be `'password'`. If for instance you wanted your password field to be called `'pwd'`, you could configure it like this:

```js
userSchema.plugin(passwordPlugin, {
  passwordField: 'pwd',
})
```

If you require your password field to be nested inside an object on the model, just specify the path in dot notation.

```js
userSchema.plugin(passwordPlugin, {
  passwordField: 'auth.local.pwd',
})
```

---

### bcryptRounds

This determines how many rounds of hasing bcrypt does to generate the password salt. Default value is 10.

```js
userSchema.plugin(passwordPlugin, {
  bcryptRounds: 20,
})
```

## Tests

A mongo instance must be running on port 27017 for the tests to run.

```bash
mongod --dbpath data/ # this is a gitignored folder
```

Run the tests:

```bash
npm t
```
