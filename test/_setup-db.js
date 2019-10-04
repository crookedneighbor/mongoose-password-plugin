const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/mongoose-password-plugin-test')
const connection = mongoose.connection

before((done) => {
  connection.on('open', () => {
    connection.db.dropDatabase(done)
  })
})

after((done) => {
  connection.close(done)
})

afterEach((done) => {
  connection.db.dropDatabase(done)
})
