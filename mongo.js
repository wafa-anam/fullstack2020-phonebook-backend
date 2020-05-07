const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Must enter password as argument')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0-iaihk.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person
        .find({})
        .then(persons => {
            persons.forEach(person => {
                console.log(person.name, person.number)
            })
            mongoose.connection.close()
        })
}

if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]
    const newPerson = new Person({
        name: name,
        number: number
    })

    newPerson.save().then(result => {
        console.log(`added ${name}'s number ${number} to phonebook`)
        mongoose.connection.close()
    })
}