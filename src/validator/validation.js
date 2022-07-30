const aws = require("aws-sdk")

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
      Bucket: "classroom-training-bucket", 
      Key: "project5/" + file.originalname, 
      Body: file.buffer
    }
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ "error": err })
      }
     
      return resolve(data.Location)
    })
  })
}

const isValidFiles = function(files) {
  if(files && files.length > 0)
  return true
}

const isValidRequestBody = function (reqbody) {
  if (!Object.keys(reqbody).length) {
      return false;
  }
  return true;
};

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
let nameRegex = /^[.a-zA-Z\s]+$/
let emailRegex = /^[a-z]{1}[a-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/
let phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
let passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
let numRegex = /^[0-9]*$/
 


module.exports={uploadFile, isValidFiles, isValid,isValidRequestBody, nameRegex,emailRegex, phoneRegex, passRegex, numRegex }



  
