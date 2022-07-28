const productModel = require("../models/productModel")
const mongoose = require("mongoose")

const { uploadFile, isValid, isValidFiles, isValidRequestBody, nameRegex, emailRegex, phoneRegex,numRegex, passRegex, } = require("../validator/validation")


const createProduct = async function (req, res) {

    try {
        let data = req.body
        let files = req.files
        const { title, description, price, currencyId, currencyFormat, style,availableSizes,installments} = data

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide the detials" })
        }
        if (!isValidFiles(files))
            return res.status(400).send({ status: false, Message: "Please provide user's profile picture" })
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "please enter the valid title" })
        }
        if (!nameRegex.test(title))
        return res.status(400).send({ status: false, message: "title should contain alphabets only." })

        const checktitle = await productModel.findOne({ title: title })
        if (checktitle)
            return res.status(400).send({ status: false, msg: "title is already present" })

        if (!isValid(description)) {
            return res.status(400).send({ status: false, msg: "please enter the description" })
        }
        if (!isValid(price)) {
            return res.status(400).send({ status: false, msg: "please enter price" })
        }
        if(!numRegex.test(price)){
            return res.status(400).send({ status: false, msg: "please provide numerical price" })
        }
        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, msg: "please provide currencyId" })
        }
        if (currencyId != "INR") {
            return res.status(400).send({ status: false, msg: "please provide valid currencyId" })
        }
        
       
        if (!currencyFormat) {
            return res.status(400).send({ status: false, msg: "please provide currencyFormet" })
        }
        if (currencyFormat !== "₹") {
            return res.status(400).send({ status: false, msg: 'currencyFormat should be "₹" ' })
        }
        let bodyFromReq = JSON.parse(JSON.stringify(data));
    if (bodyFromReq.hasOwnProperty("style"))
    if (!isValid(style)) return res.status(400).send({ status: false, Message: "Please provide style field", })
    


        if(!availableSizes){
            return res.status(400).send({ status: false, msg: "please provide availableSizes" })
        }
        if (availableSizes.length<1) {
            return res.status(400).send({ status: false, msg: "please enter size of product" })
        }
        if (["S", "XS","M","X", "L","XXL", "XL"].indexOf(availableSizes) == -1){
            return res.status(400).send({status: false, msg: "Enter a valid size S or XS or M or X or L or XXL or XL ",});
           }

           if (bodyFromReq.hasOwnProperty("installments"))
           if (!isValid(installments)) return res.status(400).send({ status: false, Message: "Please provide installments"})
           
         if(!numRegex.test(installments)){
            return res.status(400).send({ status: false, msg: "please provide installement only numercial value" })
        }
        
        

      

        let url = await uploadFile(files[0])
        data['productImage'] = url
        const product = await productModel.create(data)

        return res.status(201).send({ status: true, msg: "product create successfully", data: product })
    } catch (error) {

        return res.status(500).send({ status: false, error: error.message })

    }
}


const getProduct = async function (req,res){

    let body = req.body
    // const {}
    // const {isDeleted:false} = data

}






module.exports = { createProduct,getProduct }