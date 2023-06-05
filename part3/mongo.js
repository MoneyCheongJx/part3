const mongoose = require('mongoose')

const password = process.argv[2]

const url = `mongodb+srv://part3:${password}@fullstack-part-3-12.azc0m5x.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    phone: String,
})

const Person = mongoose.model("Person", personSchema)

if (process.argv.length == 3) {
    Person.find({}).then(persons => {
        persons.forEach(person => {
            console.log(`${person.name} ${person.phone}`)
        })
        mongoose.connection.close()
    })
}
else if (process.argv.length == 5) {
    const person = new Person({
        name: process.argv[3],
        phone: process.argv[4]
    })

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.phone} to phonebook`)
        mongoose.connection.close()
    })
}
else {
    console.log('give password as argument')
    process.exit(1)
}
