const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("../validator/validation");








// .......................................... User APIs ...................................//
router.post( "/register",userController.registerUser);
router.post('/login', userController.loginUser)

// router.post("/login", validation.validationForLogin, userController.loginUser);

// // .......................................... Book APIs ...................................//
// router.post(
//   "/books",
//   middlewares.Authentication,
//   validation.validationForBook,
//   bookController.registerBook
// );

// router.get("/books", middlewares.Authentication, bookController.getBook);

// router.get(
//   "/books/:bookId",
//   middlewares.Authentication,
//   bookController.getBooksByParams
// );
// router.put(
//   "/books/:bookId",
//   middlewares.Authentication,
//   validation.validationForUpdatedBook,
//   bookController.updateBooks
// );

// router.delete(
//   "/books/:bookId",
//   middlewares.Authentication,
//   bookController.deleteBook
// );

// // .......................................... Review APIs ...................................//
// router.post(
//   "/books/:bookId/review",
//   validation.validationForReview,
//   reviewController.createReviews
// );

// router.put(
//   "/books/:bookId/review/:reviewId",
//   validation.validationUpdateReview,
//   reviewController.updateReviews
// );

// router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);
module.exports = router;