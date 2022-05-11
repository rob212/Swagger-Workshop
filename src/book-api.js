const express = require('express');
const db = require('../database/database')
const app = express();
const cors = require('cors');

// quick fix to deal with cors
app.use(cors())

// Swagger UI setup 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./solution/openapi/books-openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// URL encoding to allow or POST requests.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set BaseURL for easier versioning of API
const baseURL = express.Router();
app.use('/store/v1', baseURL);

const port = 4000;


baseURL.get('/', (req, res) => {
  res.send('Hello World, from my machine via express endpoint')
})

baseURL.get('/books', (req, res) => {
  const books = db.getAllBooks();
  // purposeful bug - 1 in 7 chance of the request randonly failing
  const randomFailure = Math.floor(Math.random() * Math.floor(7));
  if (randomFailure === 0) {
    res.sendStatus(500);
  } else {
    res.json(books)
  }
})

baseURL.get('/book/:id', (req, res) => {
  const book = db.getBook(req.params.id);
  console.log(book);
  if (book) {
    res.json(book);
  } else {
    // purposeful bug - non appropriate response code
    res.sendStatus(406)
  }
})

baseURL.post('/book', (req, res) => {
  const book = {...req.body};
  db.addBook(book);
  res.status(201).send(`created book with title: ${book.title}`);
})

// POST books endpoint but with added basic auth
// baseURL.post('/book', basicAuth({ users: {'admin': 'password'}}), (req, res) => {
//   const book = {...req.body};
//   db.addBook(book);
//   res.status(201).send(`created book with title: ${book.title}`);
// })

app.listen(port, ()=> console.log(`Book Store API is now running and listening on port: ${port}`));