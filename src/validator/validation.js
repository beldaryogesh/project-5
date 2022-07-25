// const mongoose = require("mongoose");
// const userModel = require("../models/userModel");
// // const moment = require("moment");


// // Validataion for empty request body
// const isValidObject = function (value) {
//   if (Object.keys(value).length === 0) return false;
//   else return true;
// };

// // Validation for Strings/ Empty strings
// const hasEmptyString = function (value) {
//   if (typeof value !== "string") return false;
//   else if (value.trim().length == 0) return false;
//   else return true;
// };

// // Validation for Strings contain numbers
// const stringContainNumber = function (value) {
//   if (!/^[ a-z ]+$/i.test(value)) return false;
//   else return true;
// };

// // Validation for User
// const validationForUser = async function (req, res, next) {
//   try {
//     let data = req.body;
//     let { fname,lname,email,profileImage,phone,password } = data;
    

//     if (!isValidObject(data))
//       return res
//         .status(400)
//         .send({ status: false, message: "Missing Parameters" });

//     if (!fname)
//       return res
//         .status(400)
//         .send({ status: false, message: "fname is required" });
//     else if (!hasEmptyString(fname))
//       return res
//         .status(400)
//         .send({ status: false, message: "fname is in wrong format" });
    

//     if (!lname)
//       return res
//         .status(400)
//         .send({ status: false, message: "Name is required" });
//     else if (!hasEmptyString(lname) || !stringContainNumber(lname))
//       return res
//         .status(400)
//         .send({ status: false, message: "lname is in wrong format" });

//     if (!phone)
//       return res
//         .status(400)
//         .send({ status: false, message: "Phone is required" });
//     let phoneNumber = phone.trim();
//     if (!/^[6-9]\d{9}$/.test(phoneNumber))
//       return res
//         .status(400)
//         .send({ status: false, message: "Phone is in wrong format" });

//     const userPhone = await userModel.findOne({ phone: phoneNumber });
//     if (userPhone)
//       return res.status(400).send({
//         status: false,
//         message: `${phone} is already in use`,
//       });

//     if (!email)
//       return res
//         .status(400)
//         .send({ status: false, message: "Email is required" });
//     let emailId = email.trim();
//     if (!hasEmptyString(emailId))
//       return res
//         .status(400)
//         .send({ status: false, message: "Email is in wrong format" });
//     else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailId))
//       return res.status(400).send({ status: false, message: "Invalid email" });

//     const userEmail = await userModel.findOne({ email: emailId });
//     if (userEmail)
//       return res.status(400).send({
//         status: false,
//         message: `${email} is already in use`,
//       });

//     if (!password)
//       return res
//         .status(400)
//         .send({ status: false, message: "Password is required" });
//     else if (!hasEmptyString(password))
//       return res
//         .status(400)
//         .send({ status: false, message: "Password is in wrong format" });
//     else if (
//       !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/.test(
//         password
//       )
//     )
//       return res.status(400).send({
//         status: false,
//         message:
//           "Password length should be in between 8 and 15 and must contain one special charcter , one alphabet and one number",
//       });

//     if (address && typeof address !== "object") {
//       return res
//         .status(400)
//         .send({ status: false, message: "Invalid address format" });
//     } else if (address) {
//       if (!isValidObject(address)) {
//         return res
//           .status(400)
//           .send({ status: false, message: "address is required" });
//       } else if (
//         address.street != undefined &&
//         !hasEmptyString(address.street)
//       ) {
//         return res.status(400).send({
//           status: false,
//           message: "Street should be present with correct format",
//         });
//       } else if (
//         address.city != undefined &&
//         (!hasEmptyString(address.city) || !stringContainNumber(address.city))
//       ) {
//         return res.status(400).send({
//           status: false,
//           message: "City should be present with correct format",
//         });
//       } else if (
//         address.pincode != undefined &&
//         (!hasEmptyString(address.pincode) ||
//           !/^(\d{4}|\d{6})$/.test(address.pincode))
//       ) {
//         return res.status(400).send({
//           status: false,
//           message: "Pincode should be present with correct format",
//         });
//       }
//     }
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
//   next();
// };

// const validationForLogin = async function (req, res, next) {
//   try {
//     let email = req.body.email;
//     let password = req.body.password;
//     if (!email) {
//       return res
//         .status(400)
//         .send({ status: false, message: "Email is required" });
//     }
//     if (!password) {
//       return res
//         .status(400)
//         .send({ status: false, message: "Password is required" });
//     }
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
//   next();
// };

// // Validation for Books
// const validationForBook = async function (req, res, next) {
//   try {
//     let data = req.body;
//     let {
//       title,
//       excerpt,
//       userId,
//       ISBN,
//       category,
//       subcategory,
//       releasedAt,
//       reviews,
//       isDeleted,
//     } = data;

//     if (!isValidObject(data))
//       return res
//         .status(400)
//         .send({ status: false, message: "Missing Parameters" });

//     if (!title)
//       return res
//         .status(400)
//         .send({ status: false, message: "Title is required" });
//     else if (!hasEmptyString(title))
//       return res
//         .status(400)
//         .send({ status: false, message: "Title is in wrong format" });

//     const newTitle = await bookModel.findOne({ title: title });
//     if (newTitle)
//       return res
//         .status(400)
//         .send({ status: false, message: `${title} is already in use` });

//     if (!excerpt)
//       return res
//         .status(400)
//         .send({ status: false, message: "Excerpt is required" });
//     else if (!hasEmptyString(excerpt))
//       return res
//         .status(400)
//         .send({ status: false, message: "Excerpt is in wrong format" });

//     if (!userId)
//       return res
//         .status(400)
//         .send({ status: false, message: "UserdId is required" });
//     else if (!ObjectId.isValid(userId))
//       return res
//         .status(400)
//         .send({ status: false, message: "UserId is not valid" });

//     if (!ISBN)
//       return res
//         .status(400)
//         .send({ status: false, message: "ISBN is required" });
//     else if (!hasEmptyString(ISBN))
//       return res
//         .status(400)
//         .send({ status: false, message: "ISBN is in wrong format" });
//     else if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN))
//       return res.status(400).send({ status: false, message: "Invalid ISBN" });

//     const getISBN = await bookModel.findOne({ ISBN });
//     if (getISBN)
//       return res
//         .status(400)
//         .send({ status: false, message: "ISBN Already exists" });

//     if (!category)
//       return res
//         .status(400)
//         .send({ status: false, message: "category is required" });
//     else if (!hasEmptyString(category) || !stringContainNumber(category))
//       return res
//         .status(400)
//         .send({ status: false, message: "Category is in wrong format" });

//     if (!subcategory)
//       return res
//         .status(400)
//         .send({ status: false, message: "Subcategory is required" });
//     else if (subcategory.length == 0)
//       return res
//         .status(400)
//         .send({ status: false, message: "Subcategory should not be empty" });
//     else {
//       subcategory.forEach((sub) => {
//         if (!stringContainNumber(sub))
//           return res
//             .status(400)
//             .send({ status: false, message: "Subcategory is in wrong format" });
//       });
//     }
//     if (!releasedAt)
//       return res
//         .status(400)
//         .send({ status: false, message: "releasedAt is required" });
//     else if (!moment(releasedAt).isValid())
//       return res
//         .status(400)
//         .send({ status: false, message: "Invalid release date" });

//     if (reviews && isNaN(reviews))
//       return res
//         .status(400)
//         .send({ status: false, message: "Reviews is in wrong format" });

//     if (isDeleted && typeof isDeleted !== "boolean")
//       return res
//         .status(400)
//         .send({ status: false, message: "isDeleted is in wrong format" });
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }


//   next();
// };

// // Validation for Updated Books
// const validationForUpdatedBook = async function (req, res, next) {
//   try {
//     let data = req.body;
//     let { title, excerpt, releasedAt, ISBN } = data;

//     if (!isValidObject(data))
//       return res
//         .status(400)
//         .send({ status: false, message: "Missing Parameters" });

//     if (title != undefined && !hasEmptyString(title)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "Title should not be empty" });
//     }
//     if (excerpt != undefined && !hasEmptyString(excerpt))
//       return res
//         .status(400)
//         .send({ status: false, message: "Expert should not be empty" });

//     if (releasedAt != undefined && !hasEmptyString(releasedAt))
//       return res
//         .status(400)
//         .send({ status: false, message: "Releasedat should not be empty" });
//     else if (!moment(releasedAt).isValid())
//       return res
//         .status(400)
//         .send({ status: false, message: "Invalid Parameter" });

//     if (ISBN != undefined && !hasEmptyString(ISBN))
//       return res
//         .status(400)
//         .send({ status: false, message: "ISBN should not be empty" });
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
//   next();
// };

// // Validation for reviews
// const validationForReview = async function (req, res, next) {
//   try {
//     let data = req.body;
//     let bookId = req.params.bookId;
//     let { rating, review, reviewedBy } = data;

//     if (!isValidObject(data))
//       return res
//         .status(400)
//         .send({ status: false, message: "Missing Parameters" });

//     if (!ObjectId.isValid(bookId)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "BookId is not valid" });
//     }
//     if (rating == undefined)
//       return res
//         .status(400)
//         .send({ status: false, message: "Rating is required" });
//     else if (isNaN(rating))
//       return res
//         .status(400)
//         .send({ status: false, message: "Rating is in wrong format" });
//     else if (rating < 1 || rating > 5)
//       return res
//         .status(400)
//         .send({ status: false, message: "Rating must be from 1 to 5" });

//     if (review && !hasEmptyString(review))
//       return res
//         .status(400)
//         .send({ status: false, message: "Review is in wrong format" });

//     if (
//       reviewedBy !== undefined &&
//       (!hasEmptyString(reviewedBy) || !stringContainNumber(reviewedBy))
//     ) {
//       return res
//         .status(400)
//         .send({ status: false, message: "ReviewBy is in wrong format" });
//     }
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
//   next();
// };

// // Validation for Updated reviews
// const validationUpdateReview = async function (req, res, next) {
//   try {
//     let data = req.body;
//     let bookId = req.params.bookId;
//     let reviewId = req.params.reviewId;
//     let { rating, review, reviewedBy } = data;

//     if (!isValidObject(data))
//       return res
//         .status(400)
//         .send({ status: false, message: "Missing Parameters" });

//     if (!ObjectId.isValid(bookId)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "BookId is not valid" });
//     }

//     if (!ObjectId.isValid(reviewId)) {
//       return res
//         .status(400)
//         .send({ status: false, message: "ReviewId is not valid" });
//     }

//     if (rating && isNaN(rating))
//       return res
//         .status(400)
//         .send({ status: false, message: "Rating is in wrong format" });
//     else if (rating < 1 || rating > 5)
//       return res
//         .status(400)
//         .send({ status: false, message: "Rating must be from 1 to 5" });

//     if (review && !hasEmptyString(review))
//       return res
//         .status(400)
//         .send({ status: false, message: "Review is in wrong format" });

//     if (
//       reviewedBy !== undefined &&
//       (!hasEmptyString(reviewedBy) || !stringContainNumber(reviewedBy))
//     ) {
//       return res
//         .status(400)
//         .send({ status: false, message: "ReviewBy is in wrong format" });
//     }
//   } catch (error) {
//     return res.status(500).send({ status: false, message: error.message });
//   }
//   next();
// };


// module.exports = {
//   validationForUser,
// //   validationForLogin,
// //   validationForBook,
// //   validationForUpdatedBook,
// //   validationForReview,
// //   validationUpdateReview,
  
// };