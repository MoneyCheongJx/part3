require('dotenv').config()

const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./model/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('req', (req, res) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req'))

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
    // console.log(person)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })

  // const id = Number(request.params.id)
  // const person = persons.find(p => p.id === id)

  // if (person) {
  //   response.json(person)
  // } else {
  //   response.status(404).end()
  // }

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

const generateId = () => {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.phone) {
    return response.status(400).json(
      {
        error: 'name or number missing'
      }
    )
  }

  // if (persons.find(p => p.name === body.name)) {
  //   return response.status(400).json(
  //     {
  //       error: 'name must be unique'
  //     }
  //   )
  // }

  // const person = {
  //   id: generateId(),
  //   name: body.name,
  //   number: body.number
  // }

  const person = new Person({
    name: body.name,
    phone: body.phone
  })

  // persons = persons.concat(person)
  // response.json(person)

  person.save().then(
    (savedPerson) => {
      response.json(savedPerson)
    }
  )
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    phone: body.phone
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

app.get('/info', async (req, res) => {
  res.send(`<p>Phonebook has info for ${await Person.estimatedDocumentCount({})} people <br/>
  ${new Date().toString()}
   </p> `
  )
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  }

  next(error)
}

// handler of requests with result to errors
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})