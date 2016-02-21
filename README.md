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

user.save((err, savedUser) => {
  savedUser.password // hashed version of the password
})
```

```js
// checking the user's password
let correctPassword = 'asdf'
let incorrectPassword = 'not asdf'

user.comparePassword(correctPassword, (err, match) => {
  match // true
})

user.comparePassword(incorrectPassword, (err, match) => {
  match // false
})
```

```js
// changing the user's password
user.password = 'a new password'

user.save((err, savedUser) => {
  savedUser.password // the hashed version of the new password
})
```

## Options

You can pass in an optional configuration object as a second argument. Below are all the options available with their default values:

```js
userSchema.plugin(passwordPlugin, {
  passwordField: 'password',
  comparePasswordType: 'callback',
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

### comparePasswordType

This determines what type of function `comparePassword` will be. The options are: `'callback'`, `'promise'` and `'sync'`

#### callback

`'callback'` is the default option

```js
// model setup
userSchema.plugin(passwordPlugin, {
  comparePasswordType: 'callback',
})

// check password
user.comparePassword(passwordFromLoginForm, (err, match) => {
  match // either true or false
})
```

#### promise

```js
// model setup
userSchema.plugin(passwordPlugin, {
  comparePasswordType: 'promise',
})

// check password
user.comparePassword(passwordFromLoginForm).then((match) => {
  match // either true or false
})
```

#### sync

```js
// model setup
userSchema.plugin(passwordPlugin, {
  comparePasswordType: 'sync',
})

// check password
let match = user.comparePassword(passwordFromLoginForm)
match // either true or false
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

```bash
npm t
```
