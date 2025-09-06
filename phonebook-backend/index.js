require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const Phonebook = require('./models/phonebook');
const PORT = process.env.PORT;


morgan.token('body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return '';
});

app.use(cors()); 
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')); // 2. log everything
app.use(express.json());
app.use(express.static('dist'));




let phonebook = []

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
});


app.get('/info', (req, res) => {
  console.log("inside info api")
  const count = phonebook.length;

  const indiaDate = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    timeZoneName: 'long',
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

    Phonebook.countDocuments().then(count => {
        const info = `
        <p>Phonebook has info for ${count} people</p>
        <p>${indiaDate}</p>
    `;

    res.send(info);
  })

});

app.get('/api/persons', (request, response) => {
    Phonebook.find({})
    .then(data => {
      response.json(data)
    })
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Phonebook.findById(id)
  .then(person => {
      if (person) {
      response.json(person);
    } else {
      response.statusMessage = `Person Not Found`;
      return response.status(404).end();
    }
  })
  .catch(error => next(error))
  
});

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    phonebook = Phonebook.findByIdAndDelete(id)
                .then(result => {
                  response.status(204).end()
                })
                .catch(error => next(error))
});

const generateId = () => {
  const maxId = phonebook.length > 0
    ? Math.max(...phonebook.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

app.post('/api/persons', (request, response, next) => {
    const number = request.body.number;
    const name = request.body.name;

    if(!name || name === ''){
        return response.status(400).json({
            error: 'name cannot be empty'
        })
    }

    if(!number || number === ''){
        return response.status(400).json({
            error: 'number cannot be empty'
        })
    }

    console.log("payload", request.body)

    console.log(name, number)

    const person = new Phonebook({
      name: name,
      number: number
    })

    console.log("person ==>", person);

    person.save()
    .then(data => {
      response.json(data)
    })
    .catch(error => next(error))
});

app.put('/api/persons/:id', (request, response, next) => {
  console.log("API hit")
  const id = request.params.id;
  const {number} = request.body;

  Phonebook.findOneAndUpdate({_id : id}, {number: number}, { runValidators: true, new: true })
            .then(result => {
              if (result) {
                return response.status(200).json(result)
              }
              else {
                response.status(204).end()
              }
            }).catch(err => next(err))
          
});





// ---------------------------------------------------- * ------------------------------------- //

// Middleware for unknown end point
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// Error Handler Middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    console.log("=============>",error.message)
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)