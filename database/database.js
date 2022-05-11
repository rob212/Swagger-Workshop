const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('database/db.json')
const db = low(adapter)

const BOOKS_TABLE = "books";

const getAllBooks = () => {
  return db.get(BOOKS_TABLE).value();
}

const getBook = (id) => {
  const searchBy = parseInt(id);
  const book = db.get(BOOKS_TABLE)
  .find({ id: searchBy })
  .value()

  return book;
}

const addBook = (book) => {
  return db.get(BOOKS_TABLE)
  .push(book)
  .write()
}

exports.getAllBooks = getAllBooks;
exports.getBook = getBook;
exports.addBook = addBook;