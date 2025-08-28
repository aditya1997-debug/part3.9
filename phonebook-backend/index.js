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

app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(express.json());
app.use(express.static('dist'));

let phonebook = []

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
});


app.get('/api/info', (req, res) => {
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

  const info = `
    <p>Phonebook has info for ${count} people</p>
    <p>${indiaDate}</p>
  `;

  res.send(info);
});

app.get('/api/persons', (request, response) => {
    Phonebook.find({})
    .then(data => {
      response.json(data)
    })
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = phonebook.find(person => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.statusMessage = `Person Not Found`;
    return response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    phonebook = phonebook.filter(person => person.id !== id);
    response.status(204).end()
});

const generateId = () => {
  const maxId = phonebook.length > 0
    ? Math.max(...phonebook.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

app.post('/api/persons', (request, response) => {
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

    const name_exits = phonebook.find(x => x.name.toLowerCase() === name.toLowerCase());
    if(name_exits){
        return response.status(400).json({
            error: `name must be unique, ${name} already exits in phonebook`
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
});