const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

public_users.post("/register", (req, res) => {
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

// Helper function to return local data so Axios requests don't infinite loop
public_users.get('/internal/books', (req, res) => {
  return res.status(200).json(books);
});

// Task 10: Get the book list available in the shop using Async/Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    return res.status(200).send(JSON.stringify({ books: response.data }, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books list" });
  }
});

// Task 11: Get book details based on ISBN using Promises with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  axios.get('http://localhost:5000/internal/books')
    .then((response) => {
      const bookList = response.data;
      if (bookList[isbn]) {
        return res.status(200).send(JSON.stringify(bookList[isbn], null, 4));
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(() => {
      return res.status(500).json({ message: "Error fetching book details" });
    });
});
  
// Task 12: Get book details based on author using Async/Await with Axios
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();
  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    const bookList = response.data;
    const keys = Object.keys(bookList);
    const matchingBooks = [];

    keys.forEach(key => {
      if (bookList[key].author.toLowerCase() === authorParam) {
        matchingBooks.push({
          isbn: key,
          author: bookList[key].author,
          title: bookList[key].title,
          reviews: bookList[key].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify({ booksByAuthor: matchingBooks }, null, 4));
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error processing author search" });
  }
});

// Task 13: Get all books based on title using Promises with Axios
public_users.get('/title/:title', function (req, res) {
  const titleParam = req.params.title.toLowerCase();

  axios.get('http://localhost:5000/internal/books')
    .then((response) => {
      const bookList = response.data;
      const keys = Object.keys(bookList);
      const matchingBooks = [];

      keys.forEach(key => {
        if (bookList[key].title.toLowerCase() === titleParam) {
          matchingBooks.push({
            isbn: key,
            author: bookList[key].author,
            title: bookList[key].title,
            reviews: bookList[key].reviews
          });
        }
      });

      if (matchingBooks.length > 0) {
        return res.status(200).send(JSON.stringify({ booksByTitle: matchingBooks }, null, 4));
      } else {
        return res.status(404).json({ message: "No books found with this title" });
      }
    })
    .catch(() => {
      return res.status(500).json({ message: "Error processing title search" });
    });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;