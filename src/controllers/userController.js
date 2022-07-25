const mongoose = require("mongoose")
const userModel = require("../models/userModel")


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

