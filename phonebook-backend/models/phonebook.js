const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const phoneBookSchema = new mongoose.Schema({
  name: {type: String, minLength: 3},
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /^(\d{2,3})-(\d+)$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number. Format: XX-XXXXXXX or XXX-XXXXXXXX`
    }
  }
})

phoneBookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    console.log('returnedObject ===>', returnedObject)
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Phonebook', phoneBookSchema)