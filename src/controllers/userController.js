
const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const { isValidObjectId } = require('mongoose')
const Authentication =require("../middlewares/auth")
const aws = require("aws-sdk")
// const { ConfigurationServicePlaceholders } = require("aws-sdk/lib/config_service_placeholders")
const validator = require("../validator/validation")
// const aws1 = require("../aws/aws")
// const { isValidObjectId } = require('mongoose')
 
 
 
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})
 
 
let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    // this function will upload file to aws and return the link
    let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws
 
    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",  //HERE
      Key: "project5/" + file.originalname, //HERE
      Body: file.buffer
    }
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ "error": err })
      }
      console.log(data)
      console.log("file uploaded succesfully")
      return resolve(data.Location)
    })
  })
}
 
 
 
const isValidObject = function (value) {
  if (Object.keys(value).length === 0) return false;
  else return true;
};
 
const isValid = function (value) {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  return true;
}

 
 
//Creating User
const registerUser = async (req, res) => {
  try {
    let data = req.body
    let file = req.files
    let { fname, lname, phone, email, password, address } = data
 
    //validation for body
    if (!isValidObject(data)) {
      return res.status(400).send({ status: false, msg: "Provide the data of User " })
    }
 
    //validation for fname and lastname
    if (!isValid(fname)) {
      return res.status(400).send({ status: false, msg: "Provide the First Name " })
    }
    if (!(nameRegex(fname))) {
      return res.status(400).send({ status: false, msg: "Enter valid  fname" })
    }
 
 
    if (!isValid(lname)) {
      return res.status(400).send({ status: false, msg: "Provide the last Name " })
    }
    if (!(/^[a-zA-Z ]{2,30}$/.test(lname))) {
      return res.status(400).send({ status: false, msg: "Enter valid  lname" })
    }
 
 
    //validation for phone
    if (!isValid(phone)) {
      return res.status(400).send({ status: false, msg: "Provide the Phone Number " })
    }
    if (!(/^[0-9]{10}$/.test(phone))) {
      return res.status(400).send({ status: false, msg: " phone number should have 10 digits only" });
    }
    let PhoneCheck = await userModel.findOne({ phone: phone.trim() })
    if (PhoneCheck) { return res.status(400).send({ status: false, msg: "this phone is already present" }) }
 
    //validation for email
    if (!isValid(email)) {
      return res.status(400).send({ status: false, msg: "Provide the EmailId " })
    }
    if (!/^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/.test(email)) {
      return res.status(400).send({ status: false, msg: "Provide the Valid EmailId " })
    }
    let checkmail = await userModel.findOne({ email: email })
    if (checkmail) { return res.status(400).send({ status: false, msg: "this email is already present" }) }
 
    //validation for password
    if (!isValid(password)) {
      return res.status(400).send({ status: false, msg: "Provide the Password " })
    }
    // if (typeof password !== "string" || password.trim().length === 0) { return res.status(400).send({ status: false, msg: "enter valid password" }) };
    else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/.test(password)) { return res.status(400).send({ status: false, msg: "Password Length must be btwn 8-15 chars only" }) }
 
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds)
    data['password'] = encryptedPassword
 
    if (!isValid(password)) return res.status(400).send({ status: false, Message: "Please provide your password" })
    //validation for address

   
    if (file && file.length > 0) {
      let url = await uploadFile(file[0])
      data['profileImage'] = url
    }
    else {
      return res.status(400).send({ status: false, msg: "Please Provide ProfileImage" })
    }


    const created = await userModel.create(data)
    return res.status(201).send({ status: true, msg: "User Created Succefully", data: created })

  }
  catch (err) {
    return res.status(500).send({ status: false, Error: err.message })
  }
}

const loginUser = async function (req, res) {
  try {

    const data = req.body
    const { email, password } = data
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please Enter email and Password" })

    }
    if (!email) {
      return res.status(400).send({ status: false, msg: "Please Enter email" })
    }
    if (!password) {
      return res.status(400).send({ status: false, msg: "Please Enter password" })
    }
    const hash = await userModel.findOne({ email: email }).select({ _id: 1, password: 1 })
    console.log(hash)
    if (hash) {
      const existUser = bcrypt.compare(password, hash.password)
      if (!existUser) {
        return res.status(404).send({ status: false, msg: "Invalid User" })
      }
    }
    else {
      return res.status(404).send({ status: false, msg: "No user With this email" })
    }


    // Creating Token Here

    const token = jwt.sign(
      { userId: hash._id },
      'Project5',
      { expiresIn: "24h" })

    res.setHeader("x-api-key", token)
    let obj = {
      userId: hash._id,
      token: token
    }
    return res.status(201).send({ status: true, msg: "User LoggedIn Succesfully", data: obj })

  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}


//********************************************GET USER API*******************************************************

const getUser = async (req, res) => {
  try {

    let userId = req.params.userId
    if (!userId) {
      return res.status(400).send({ status: false, msg: "Provide UserID" })
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ stauts: false, msg: "Invalid User Id" })
    }
    const data = await userModel.find({ _id: userId })
    if (data) {
      return res.status(200).send({ statu: true, data: data })
    }
    else {
      return res.status(404).send({ status: false, msg: "No data Found" })
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }

}

// *******************************************UPDATE USER API**************************************************

// const updateUser = async function (req, res) {
//   try {

//     let usersId = req.params.userId

//     if (usersId && !isValidObjectId(usersId))
//       return res
//         .status(404)
//         .send({ status: false, message: "userId is not valid" });

//     let data = req.body;
//     const {  } = data;

//     let bookDetails = await bookModel.findOne({
//       _id: bookId,
//       isDeleted: false,
//     });
//     if (!bookDetails)
//       return res
//         .status(404)
//         .send({ status: false, msg: "Book does not exists" });

//     //authorization
//     let book = await bookModel.findById({ _id: bookId });
//     let userId = book.userId.toString();

//     if (req.headers["userId"] !== userId)
//       return res
//         .status(403)
//         .send({ status: false, msg: "You are not authorized...." });

//     if (title) bookDetails.title = title;
//     const validTitle = await bookModel.findOne({ title });
//     if (validTitle)
//       return res
//         .status(400)
//         .send({ status: false, message: "Title is already present" });

//     if (excerpt) bookDetails.excerpt = excerpt;
//     if (releasedAt) bookDetails.releasedAt = releasedAt;
//     if (ISBN) bookDetails.ISBN = ISBN;
//     const validISBN = await bookModel.findOne({ ISBN });
//     if (validISBN)
//       return res
//         .status(400)
//         .send({ status: false, message: "ISBN is already present" });

//     bookDetails.save();

//     return res
//       .status(200)
//       .send({ status: true, message: "Success", data: bookDetails });
//   } catch (error) {
//     return res.status(500).send({ err: error.message });
//   }
// };

 
module.exports = { registerUser, loginUser, getUser }
    
 

 
 
 

 
 
 
