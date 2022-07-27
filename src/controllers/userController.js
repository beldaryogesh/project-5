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
    if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in body." })
    let { fname, lname, email, phone, password, address } = data
    const files = req.files
    if (!isValidFiles(files)) return res.status(400).send({ status: false, Message: "Please provide user's profile picture", })
    if (!isValid(fname))
      return res.status(400).send({ status: false, message: "Please enter the user name." })
    if (!nameRegex.test(fname))
      return res.status(400).send({ status: false, message: "name should contain alphabets only." })
    if (!isValid(lname))
      return res.status(400).send({ status: false, message: "Please enter the user last name." })
    if (!nameRegex.test(lname))
      return res.status(400).send({ status: false, message: "name should contain alphabets only." })
    if (!isValid(email))
      return res.status(400).send({ status: false, message: "Please enter the email." })
    if (!emailRegex.test(email))
      return res.status(400).send({ status: false, message: "Please enter a valid emailId." })
    let getEmail = await userModel.findOne({ email: email });
    if (getEmail) {
      return res.status(400).send({ status: false, message: "Email is already in use, please enter a new one." });
    }
    if (!isValid(phone))
      return res.status(400).send({ status: false, message: "Please enter the phone number." })
    if (!phoneRegex.test(phone))
      return res.status(400).send({ status: false, message: "Enter the phone number in valid Indian format." })
    let getPhone = await userModel.findOne({ phone: phone });
    if (getPhone) {
      return res.status(400).send({ status: false, message: "Phone number is already in use, please enter a new one." });
    }
    if (!isValid(password))
      return res.status(400).send({ status: false, message: "Please enter the password." })
    if (!passRegex.test(password))
      return res.status(400).send({ status: false, message: "Password length should be alphanumeric with 8-15 characters, should contain at least one lowercase, one uppercase and one special character." })
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds)
    console.log(encryptedPassword)
    data['password'] = encryptedPassword

    if (data.address.shipping) {
      if (!isValid(data.address.shipping.street))
        return res.status(400).send({ status: false, message: "Enter the street in the address(shipping)." })
      if (!isValid(data.address.shipping.city))
        return res.status(400).send({ status: false, message: "Enter the city in the address(shipping)." })
      if (!nameRegex.test(data.address.shipping.city))
        return res.status(400).send({ status: false, message: "city name should contain alphabets only(shipping)." })
      if (!isValid(data.address.shipping.pincode))
        return res.status(400).send({ status: false, message: "Enter the pincode in the address(shipping)." })
      let pinValidated = pinValidator.validate(data.address.shipping.pincode)
      if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode." })
    }
    if (data.address.billing) {
      if (!isValid(data.address.billing.street))
        return res.status(400).send({ status: false, message: "Enter the street in the address(billing)." })
      if (!isValid(data.address.billing.city))
        return res.status(400).send({ status: false, message: "Enter the city in the address(billing)." })
      if (!nameRegex.test(data.address.billing.city))
        return res.status(400).send({ status: false, message: "city name should contain alphabets only(billing)." })
      if (!isValid(data.address.billing.pincode))
        return res.status(400).send({ status: false, message: "Enter the pincode in the address(billing)." })
      let pinValidated = pinValidator.validate(data.address.billing.pincode)
      if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode." })
    }

    const profilePicture = await uploadFile(files[0])
    const userData = {
      fname: fname,
      lname: lname,
      profileImage: profilePicture,
      email: email,
      phone: phone,
      password: encryptedPassword,
      address: address,
    }

    const createUser = await userModel.create(userData)

    res.status(201).send({
      status: true, message: `User registered successfully`, data: createUser,
    })
  } catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}


//********************************************LOGIN API****************************************************************************** */
const loginUser = async function (req, res) {
  try {

    const data = req.body
    const { email, password } = data
    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Please enter login credentials" });
    }

    if (!isValid(email)) {
      return res.status(400).send({ status: false, message: "Email is requird and it should be a valid email address" });
    }
    if (!emailRegex.test(email))
      return res.status(400).send({ status: false, message: "Please enter a valid emailId." })
    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Password  should be Valid min 8 and max 15 length" });
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

const getUser = async (req, res) => {
  try {

    let userId = req.params.userId
    if (!userId) {
      return res.status(400).send({ status: false, msg: "Provide UserID" })
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ stauts: false, msg: "Invalid User Id" })
    }
    const data = await userModel.findById({ _id: userId })
    if (data) {
      return res.status(200).send({ statu: true, data: data })
    }
    else {
      return res.status(404).send({ status: false, msg: "No data Found" })
    }
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.name })
  }

}

const updateUserProfile = async function (req, res) {
  try {
    const userId = req.params.userId;
    const data = req.body
    const files = req.files
    
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ stauts: false, msg: "Invalid User Id" })
    }
    const isUserPresent = await userModel.findById(userId)
    if (!isUserPresent) {
      return res.status(404).send({ status: false, msg: "No User Found" })
    }
    if (userId != req.userId) {
      return res.status(403).send({ status: false, message: "unauthorized access!" });
    }
    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "Please provide data for update" });
    }
    if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Provide the data in the body to update." })
    let { profileImage, fname, lname, email, phone, password, address } = data
    let bodyFromReq = JSON.parse(JSON.stringify(data));
    if (bodyFromReq.hasOwnProperty("profileImage"))
    if (!isValidFiles(profileImage)) return res.status(400).send({ status: false, Message: "Please provide user's profile picture", })
    if (bodyFromReq.hasOwnProperty("fname"))
      if (!isValid(fname)) { return res.status(400).send({ status: false, msg: "Provide the First Name " }) }
    if (!nameRegex.test(fname))
      return res.status(400).send({ status: false, message: "name should contain alphabets only." })
    if (bodyFromReq.hasOwnProperty("lname"))
      if (!isValid(lname)) { return res.status(400).send({ status: false, msg: "Provide the last Name " }) }
    if (!nameRegex.test(lname))
      return res.status(400).send({ status: false, message: "name should contain alphabets only." })
    if (bodyFromReq.hasOwnProperty("email"))
      if (!isValid(email)) { return res.status(400).send({ status: false, msg: "email Provide the email " }) }
    if (!emailRegex.test(email))
      return res.status(400).send({ status: false, message: "Please enter a valid emailId." })
    if (bodyFromReq.hasOwnProperty("phone"))
      if (!isValid(phone))
        return res.status(400).send({ status: false, message: "Please enter the phone number." })
    if (!phoneRegex.test(phone))
      return res.status(400).send({ status: false, message: "Enter the phone number in valid Indian format." })
    if (bodyFromReq.hasOwnProperty("password"))
      if (!isValid(password))
        return res.status(400).send({ status: false, message: "Please enter the password." })
    if (!passRegex.test(password))
      return res.status(400).send({ status: false, message: "Password length should be alphanumeric with 8-15 characters, should contain at least one lowercase, one uppercase and one special character." })
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds)
    console.log(encryptedPassword)
    data['password'] = encryptedPassword

    if (data.address.shipping) {
      if (bodyFromReq.hasOwnProperty("data.address.shipping"))
        if (!isValid(data.address.shipping.street))
          return res.status(400).send({ status: false, message: "Enter the street in the address(shipping)." })
      if (!isValid(data.address.shipping.city))
        return res.status(400).send({ status: false, message: "Enter the city in the address(shipping)." })
      if (!nameRegex.test(data.address.shipping.city))
        return res.status(400).send({ status: false, message: "city name should contain alphabets only(shipping)." })
      if (!isValid(data.address.shipping.pincode))
        return res.status(400).send({ status: false, message: "Enter the pincode in the address(shipping)." })
      let pinValidated = pinValidator.validate(data.address.shipping.pincode)
      if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode." })
    }
    if (data.address.billing) {
      if (bodyFromReq.hasOwnProperty("data.address.billing"))
        if (!isValid(data.address.billing.street))
          return res.status(400).send({ status: false, message: "Enter the street in the address(billing)." })
      if (!isValid(data.address.billing.city))
        return res.status(400).send({ status: false, message: "Enter the city in the address(billing)." })
      if (!nameRegex.test(data.address.billing.city))
        return res.status(400).send({ status: false, message: "city name should contain alphabets only(billing)." })
      if (!isValid(data.address.billing.pincode))
        return res.status(400).send({ status: false, message: "Enter the pincode in the address(billing)." })
      let pinValidated = pinValidator.validate(data.address.billing.pincode)
      if (!pinValidated) return res.status(400).send({ status: false, message: "Please enter a valid pincode." })
    }

    if (files && files.length > 0) {
      let url = await uploadFile(files[0])
      data['profileImage'] = url
    }
    const updateData = await userModel.findByIdAndUpdate({ _id: userId }, { $set: { fname: fname, lname: lname, email: email, phone: phone, password: encryptedPassword, address } }, { new: true })
    return res.status(201).send({ status: true, message: "user profile update", data: updateData });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}


module.exports = { registerUser, loginUser, getUser, updateUserProfile }