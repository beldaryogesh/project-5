const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const aws= require("aws-sdk")
const jwt = require("jsonwebtoken")
const validator= require("../validator/validation")
  
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})


let uploadFile = async (file) => {
 return new Promise( function (resolve, reject) {
  // this function will upload file to aws and return the link
  let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

  var uploadParams= {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",  //HERE
      Key: "project5/" + file.originalname, //HERE 
      Body: file.buffer
  }
  s3.upload( uploadParams, function (err, data) {
      if (err) {
          return reject({"error": err})
      }
      console.log(data)
      console.log("file uploaded succesfully")
      return resolve(data.Location)
  })
 })
}

  


////////////////validation/////////////////////////////
const isValid = (value) => {
  if (typeof value === "undefined" ||  value === null) return false
  if (typeof value === "string" && value.trim().length === 0) return false
  return true
}

const isValidRequestBody = (requestBody) => {
  return Object.keys(requestBody).length 
}
/////////////////////////////// aws ///////////////////////////////////////////
  
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1"
})
  
const registerUser = async (req, res) => {
  try {
    let data = req.body

    if (!isValidRequestBody(data))
      return res.status(400).send({
        status: false,
        message: "body can't be empty",
      })

    const { fname, lname, email, phone, password, address } = data

    const files = req.files
    const profilePicture = await uploadFile(files[0])

  
      const userData = {
        fname: fname,
        lname: lname,
        profileImage: profilePicture,
        email: email,
        phone:phone,
        password: password,
        address: address,
      }
  
      const createUser = await userModel.create(userData)
  
      res.status(201).send({status: true,message: `User registered successfully`,data: createUser,
      })
    } catch (error) {
      res.status(500).send({ status: false, message: error.message })
    }
  }
 

  //********************************************LOGIN API****************************************************************************** */
  const loginUser = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if ( !email || !password ) return res.status(400).send({ status: false, msg: "Provide the email and password to login." })  // if either email, password or both not present in the request body.

        // if (!emailRegex.test(email))  // --> email should be provided in right format
        //     return res.status(400).send({ status: false, message: "Please enter a valid emailId. ⚠️" })

        let user = await userModel.findOne( { email: email, password: password } )  // to find that particular user document.
        if ( !user ) return res.status(401).send({ status: false, msg: "Email or password is incorrect." })  // if the user document isn't found in the database.
        
        let token = jwt.sign(  // --> to generate the jwt token
            {
                userId: user._id.toString(),                            // --> payload
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2),     // --> expiry set for 2 hours
                iat: Math.floor(Date.now() / 1000)
            },
            "Aakash-Arpit-Yogesh-Sagar"                             // --> secret key
        )
         let users = {userId:user._id.toString(),token:token}
        res.setHeader("x-api-key", token)  // to send the token in the header of the browser used by the user.
        return res.status(200).send({ status: true, message: 'Success', data: users })  // token is shown in the response body.
    } catch (err) {
        return res.status(500).send({ status: false, err: err.message })
    }
}


  module.exports={registerUser,loginUser}



