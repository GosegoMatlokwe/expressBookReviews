const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => user.username === username);
  return usersWithSameName.length === 0;
}

// Helper function to check if username and password match records
const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => user.username === username && user.password === password);
  return validUsers.length > 0;
}

// Task 7: Registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JSON Web Token
    let accessToken = jwt.sign({ data: username }, 'fingerprint_customer', { expiresIn: 60 * 60 });
    
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    };
    
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session.authorization['username'];

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required in query parameters (?review=...)" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review under the user's name for this specific book
  books[isbn].reviews[username] = reviewText;

  return res.status(200).json({ message: `The review for the book with ISBN ${isbn} has been added/updated.` });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if a review exists from this user
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.` });
  } else {
    return res.status(404).json({ message: "No reviews found for this user under this book" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;