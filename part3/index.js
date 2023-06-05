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

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

const generateId = () => {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json(
      {
        error: 'name or number missing'
      }
    )
  }

  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json(
      {
        error: 'name must be unique'
      }
    )
  }

  // const person = {
  //   id: generateId(),
  //   name: body.name,
  //   number: body.number
  // }

  const person = new Person({
    name: body.name,
    phone: body.number
  })

  // persons = persons.concat(person)
  // response.json(person)

  person.save().then(
    (savedPerson) => {
      response.json(savedPerson)
    }
  )
})

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people <br/>
  ${new Date().toString()}
   </p> `
  )
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})