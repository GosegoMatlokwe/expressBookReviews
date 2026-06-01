const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the book list available in the shop using Async/Await
public_users.get('/', async function (req, res) {
  try {
    const getBooksPromise = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("No books available");
      }
    });

    const bookList = await getBooksPromise;
    return res.status(200).send(JSON.stringify({ books: bookList }, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found with this ISBN");
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});
  
// Task 12: Get book details based on author using Async/Await
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  
  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      const matchingBooks = [];
      
      keys.forEach(key => {
        if (books[key].author.toLowerCase() === authorParam) {
          matchingBooks.push({
            isbn: key,
            author: books[key].author,
            title: books[key].title,
            reviews: books[key].reviews
          });
        }
      });
      
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found by this author");
      }
    });

    const filteredBooks = await getBooksByAuthor;
    return res.status(200).send(JSON.stringify({ booksByAuthor: filteredBooks }, null, 4));
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 13: Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  const getBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const matchingBooks = [];

    keys.forEach(key => {
      if (books[key].title.toLowerCase() === titleParam) {
        matchingBooks.push({
          isbn: key,
          author: books[key].author,
          title: books[key].title,
          reviews: books[key].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found with this title");
    }
  });

  getBooksByTitle
    .then((filteredBooks) => {
      return res.status(200).send(JSON.stringify({ booksByTitle: filteredBooks }, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error });
    });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found with this ISBN" });
  }
});

module.exports.general = public_users;