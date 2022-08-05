const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const pinValidator = require('pincode-validator')
const { isValidObjectId } = require('mongoose')

const { uploadFile, isValidFiles, isValid, isValidRequestBody, nameRegex, emailRegex, phoneRegex, passRegex } = require("../validator/validation")

//*****************************************************REGISTER USER****************************************************************** */
const registerUser = async (req, res) => {
  try {
    let data = req.body
    if (Object.keys(data).length === 0)    //--> check body is MT 
    return res.status(400).send({ status: false, message: "Provide the data in body." })
    let { fname, lname, email, phone, password, address } = data
    const files = req.files
    if (!isValidFiles(files))   // --> files should be provided in the body
     return res.status(400).send({ status: false, Message: "Please provide user's profile picture", })
    if (!isValid(fname))   // --> name should be provided in the body
      return res.status(400).send({ status: false, message: "Please enter the user name." })
    if (!nameRegex.test(fname))    // --> name should be provided in right format
      return res.status(400).send({ status: false, message: "fname should contain alphabets only." })
    if (!isValid(lname))   // --> lname should be provided in the body
      return res.status(400).send({ status: false, message: "Please enter the user last name." })
    if (!nameRegex.test(lname)) // --> lname should be provided in right format
      return res.status(400).send({ status: false, message: "lname should contain alphabets only." })
    if (!isValid(email))    // --> email should be provided in the body
      return res.status(400).send({ status: false, message: "Please enter the email." })
    if (!emailRegex.test(email))    // --> email should be provided in right format
      return res.status(400).send({ status: false, message: "Please enter a valid emailId." })
    let getEmail = await userModel.findOne({ email: email });  // --> to check if provided email is already present in the database
    if (getEmail) {    // --> if that email is already provided in the database
      return res.status(400).send({ status: false, message: "Email is already in use, please enter a new one." });
    }
    if (!isValid(phone))    // --> phone number should be provided in the body
      return res.status(400).send({ status: false, message: "Please enter the phone number." })
    if (!phoneRegex.test(phone))   // --> phone number should be provided in right format
      return res.status(400).send({ status: false, message: "Enter the phone number in valid Indian format." })
    let getPhone = await userModel.findOne({ phone: phone });    // --> to check if provided phone number is already present in the database
    if (getPhone) {    // --> if that phone number is already provided in the database
      return res.status(400).send({ status: false, message: "Phone number is already in use, please enter a new one." });
    }
    if (!isValid(password))     // --> password should be provided in the body
      return res.status(400).send({ status: false, message: "Please enter the password." })
    if (!passRegex.test(password))    // --> password should be provided in right format
      return res.status(400).send({ status: false, message: "Password length should be alphanumeric with 8-15 characters, should contain at least one lowercase, one uppercase and one special character." })
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds)
    console.log(encryptedPassword)
    data['password'] = encryptedPassword
    if (address) {
      let objAddress = JSON.parse(address);
      if (objAddress.shipping) {
        if (!isValid(objAddress.shipping.street))  // --> street should be provided in the body
         { return res.status(400).send({ status: false, Message: "Please provide street and street name in shipping address", }) }
        if (!isValid(objAddress.shipping.city))  // --> city should be provided in the body
          return res.status(400).send({ status: false, Message: "Please provide city name in shipping address", });
        if (!nameRegex.test(objAddress.shipping.city))   // --> city should be provided in right format
          return res.status(400).send({ status: false, message: "city name should contain alphabets only(shipping)." })
        if (!isValid(objAddress.shipping.pincode))   // --> pincode should be provided in the body
          return res.status(400).send({ status: false, Message: "Please provide pincode in shipping address", });
        let pinValidated = pinValidator.validate(objAddress.shipping.pincode)
        if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode in shipping." })

      } else {
        return res.status(400).send({ status: false, Message: "Please provide shipping address and it should be present in object with all mandatory fields", });
      }

      if (objAddress.billing) {
        if (!isValid(objAddress.billing.street))
          return res.status(400).send({ status: false, Message: "Please provide street name in billing address", });
        if (!isValid(objAddress.billing.city))
          return res.status(400).send({ status: false, Message: "Please provide city name in billing address", });
        if (!nameRegex.test(objAddress.billing.city))
          return res.status(400).send({ status: false, message: "city name should contain alphabets only(billing)." })
        if (!isValid(objAddress.billing.pincode))
          return res.status(400).send({ status: false, Message: "Please provide pincode in billing address", });
        let pinValidated = pinValidator.validate(objAddress.billing.pincode)
        if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode in billing." })


      } else {
        return res.status(400).send({ status: false, Message: "Please provide billing address and it should be present in object with all mandatory fields" });
      }
      data["address"] = objAddress;
    } else {
      return res.status(400).send({ status: true, msg: "Please Provide The Address" })
    }
    if (files && files.length > 0) {
      let url = await uploadFile(files[0]);
      data["profileImage"] = url;
    } else {
      return res.status(400).send({ status: false, msg: "Please Provide ProfileImage" });
    }
    const createUser = await userModel.create(data)
    return res.status(201).send({ status: true, message: `User registered successfully`, data: createUser, })
  } catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}
//******************************************** LOGIN API ****************************************************************************** */
const loginUser = async function (req, res) {
  try {
    const data = req.body
    const { email, password } = data
    if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "please Provide the login credentials in body." })
    if (!isValid(email))
      return res.status(400).send({ status: false, message: "Please enter the email." })
    if (!emailRegex.test(email))
      return res.status(400).send({ status: false, message: "Please enter a valid emailId." })
    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Please enter Password should be Valid min 8 and max 15 length" });
    }
    if (!passRegex.test(password))
      return res.status(400).send({ status: false, message: "Password length should be alphanumeric with 8-15 characters, should contain at least one lowercase, one uppercase and one special character." })
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ status: false, msg: "Invalid User" })
    }
    const decrypPassword = user.password
    const pass = await bcrypt.compare(password, decrypPassword)
    if (!pass) {
      return res.status(400).send({ status: false, message: "Password Incorrect" })
    }

    // Creating Token Here

    const token = jwt.sign({ userId: user._id }, 'project5', { expiresIn: "24h" })

    let obj = {
      userId: user._id,
      token: token
    }
    res.setHeader('Authorization', 'Bearer ' + token);

    return res.status(201).send({ status: true, msg: "User LoggedIn Succesfully", data: obj })

  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

//******************************************** GET USER API******************************************************

const getUserById = async (req, res) => {
  try {
    let userId = req.params.userId
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ stauts: false, msg: "Please provide a valid userId." })
    }
    const data = await userModel.findById({ _id: userId })
    if (data) {
      return res.status(200).send({ status: true, data: data })
    }
    else {
      return res.status(404).send({ status: false, msg: "No such user found in the database." })
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.name })
  }
}


//******************************************** UPDATEUSER API******************************************************

const updateUserProfile = async function (req, res) {
  try {
    const userId = req.params.userId;
    const data = req.body
    const files = req.files
    let { profileImage, fname, lname, email, phone, password, address } = data
    // body is empty
    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Please provide data for update" });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "Invalid User Id" })
    }
    const isUserPresent = await userModel.findById(userId)
    if (!isUserPresent) {
      return res.status(404).send({ status: false, msg: "No User Found" })
    }
    // authorization
    if (userId != req.userId) {
      return res.status(403).send({ status: false, message: "unauthorized access!" });
    }
    // validation parts
    let newObj = {}
    let bodyFromReq = JSON.parse(JSON.stringify(data));
    if (bodyFromReq.hasOwnProperty("profileImage"))
      if (!isValidFiles(profileImage)) return res.status(400).send({ status: false, Message: "Please provide user's profile picture", })
      newObj["profileImage"] = profileImage
    if (bodyFromReq.hasOwnProperty("fname")) {
      if (!isValid(fname)) { return res.status(400).send({ status: false, msg: "Provide the First Name " }) }
      if (!nameRegex.test(fname))
        return res.status(400).send({ status: false, message: "name should contain alphabets only." })
      newObj["fname"] = fname
    }
    if (bodyFromReq.hasOwnProperty("lname")) {
      if (!isValid(lname)) { return res.status(400).send({ status: false, msg: "Provide the last Name " }) }
      if (!nameRegex.test(lname))
        return res.status(400).send({ status: false, message: "name should contain alphabets only." })
      newObj["lname"] = lname
    }
    if (bodyFromReq.hasOwnProperty("email")) {
      if (!isValid(email)) { return res.status(400).send({ status: false, msg: "please Provide the email " }) }
      if (!emailRegex.test(email))
        return res.status(400).send({ status: false, message: "Please enter a valid emailId." })
      let getEmail = await userModel.findOne({ email: email });
      if (getEmail) {
        return res.status(400).send({ status: false, message: "Email is already in use, please enter a new one." });
      }
      newObj["email"] = email
    }
    if (bodyFromReq.hasOwnProperty("phone")) {
      if (!isValid(phone))
        return res.status(400).send({ status: false, message: "Please enter the phone number." })
      if (!phoneRegex.test(phone))
        return res.status(400).send({ status: false, message: "Enter the phone number in valid Indian format." })
      let getPhone = await userModel.findOne({ phone: phone });
      if (getPhone) {
        return res.status(400).send({ status: false, message: "Phone number is already in use, please enter a new one." });
      }
      newObj["phone"] = phone
    }
    if (bodyFromReq.hasOwnProperty("password")) {
      if (!isValid(password))
        return res.status(400).send({ status: false, message: "Please enter the password." })
      if (!passRegex.test(password))
        return res.status(400).send({ status: false, message: "Password length should be alphanumeric with 8-15 characters, should contain at least one lowercase, one uppercase and one special character." })
      const saltRounds = 10;
      const encryptedPassword = await bcrypt.hash(password, saltRounds)
      newObj['password'] = encryptedPassword
    }
    if (address) {
      address = JSON.parse(address)
      if (address.shipping) {
          if (address.shipping.street) {
              if (!isValid(address.shipping.street)) {
                  return res.status(400).send({ status: false, message: 'Please provide street' })
              }
              newObj['address.shipping.street'] = address.shipping.street
          }
          if (address.shipping.city) {
              if (!isValid(address.shipping.city)) {
                  return res.status(400).send({ status: false, message: 'Please provide city' })
              }
              if (!nameRegex.test(address.shipping.city))
          return res.status(400).send({ status: false, message: "city name should contain alphabets only(shipping)." })
              newObj['address.shipping.city'] = address.shipping.city
          }
          if (address.shipping.pincode) {
              if (typeof address.shipping.pincode !== 'number') {
                  return res.status(400).send({ status: false, message: 'Please provide pincode' })
              }
              // Validate shipping pincode
              if (!pinValidator.validate(address.shipping.pincode)) {
                  return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
              }
              newObj['address.shipping.pincode'] = address.shipping.pincode
          }
      }
      if (address.billing) {
          if (address.billing.street) {
              if (!isValid(address.billing.street)) {
                  return res.status(400).send({ status: false, message: 'Please provide street' })
              }
              newObj['address.billing.street'] = address.billing.street
          }
          if (address.billing.city) {
              if (!isValid(address.billing.city)) {
                  return res.status(400).send({ status: false, message: 'Please provide city' })
              }
              if (!nameRegex.test(address.shipping.city))
              return res.status(400).send({ status: false, message: "city name should contain alphabets only(shipping)." })
              newObj['address.billing.city'] = address.billing.city
          }
          if (address.billing.pincode) {
              if (typeof address.billing.pincode !== 'number') {
                  return res.status(400).send({ status: false, message: 'Please provide pincode' })
              }
              // Validate billing pincode
              if (!pinValidator.validate(address.billing.pincode)) {
                  return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
              }
              newObj['address.billing.pincode'] = address.billing.pincode
          }
      }
  }

    if (files && files.length > 0) {
      let url = await uploadFile(files[0])
      data['profileImage'] = url
    }
    const updateData = await userModel.findByIdAndUpdate({ _id: userId }, { $set: newObj }, { new: true })
    return res.status(201).send({ status: true, message: "user profile update", data: updateData });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

module.exports = { registerUser, loginUser, getUserById, updateUserProfile }
