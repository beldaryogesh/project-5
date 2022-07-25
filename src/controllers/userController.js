const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const aws = require("aws-sdk")
  
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

  
const registerUser = async function(req,res){
    try {
        let files = req.files
        let data = req.form-data
      // data.fname=fname
       const {fname, lname, email, phone, Password, address}= data
        const profilePicture = await uploadFile(files[0])

        const userData = {
            fname: fname, lname: lname, email: email, profileImage: profilePicture,
            phone, Password, address: address
        }
        const newUser = await userModel.create(userData);
        res.status(201).send({ status: true, message: `User created successfully`, data: newUser });
    
    } catch (error) {
        return res.status(500).send({status:false,error:error.message})
    }
    

}

module.exports = {registerUser}

