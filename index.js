require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
})

app.get('/info', (request, response, next) => {
    const datetime = new Date()
    Person.countDocuments({}, (err, count) => {
        if (err) { next(err) }
        response.send(`<p>Phonebook has info for ${count} people</p>
                    <p>${datetime}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person.toJSON())
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(response.status(204).end())
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const person = request.body

    const newPerson = new Person({
        name: person.name,
        number: person.number
    })

    newPerson.save().then(savedPerson => {
        response.json(savedPerson.toJSON())
    })
        .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
    const person = request.body

    const newPerson = {
        name: person.name,
        number: person.number
    }

    Person.findByIdAndUpdate(request.params.id, newPerson, { new: true })
        .then(updatedNote => {
            if (updatedNote) {
                response.json(updatedNote.toJSON())
            } else {
                response.status(404).send({ error: `Unable to update ${newPerson.name}, information was already removed from server` })
            }
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})