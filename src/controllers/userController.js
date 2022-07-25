const mongoose = require("mongoose")
const userModel = require("../models/userModel")
const aws = require("aws-sdk")


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1",
  });
  let profileImage= async (file) => {
    return new Promise(function (resolve, reject) {
  
      let s3 = new aws.S3({ apiVersion: '2006-03-01' });
  
      var profileImage = {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",
        Key: "arpit/" + file.originalname,
        Body: file.buffer
      }
    }
    )} 
  
  
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          return reject({ "error": err })
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
      })
  
  
  
  
  
const registerUser = async function(req,res){
    try {
        let body = req.body
             
    const user = await userModel.create(body)
    return res.status(201).send({status:true, message: "User create successfully",data:user})
    
    } catch (error) {
        return res.status(500).send({status:false,error:error.message})
    }
    

}

module.exports = {registerUser}

