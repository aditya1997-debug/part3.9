const mongoose = require('mongoose')

const password = encodeURIComponent(process.argv[2])
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://Aditya_fcc:${password}@freecodecamp.imwlexe.mongodb.net/phonebook?retryWrites=true&w=majority&appName=FreeCodeCamp`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const PhoneBook = mongoose.model('PhoneBook', phonebookSchema)

const phonebook = new PhoneBook({
  name: name,
  number: number
})


if (!password) {
  console.log("Password is required")
  process.exit(1)
}

if (password && !name && !number) {
  PhoneBook.find({}).then(result => {
    console.log("phonebook:")
    result.forEach(x => console.log(`${x.name} ${x.number}`))
    mongoose.connection.close()
  })
}
else if (password && name && number) {
  phonebook.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
else {
  console.log("Please provide both name and number along with password")
  process.exit(1)
}


