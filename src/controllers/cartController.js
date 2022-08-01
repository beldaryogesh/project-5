const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const { isValidObjectId } = require('mongoose')

const { uploadFile, isValid, isValidFiles, isValidRequestBody, nameRegex, numRegex, priceReg } = require("../validator/validation")
const { findOneAndUpdate } = require("../models/userModel")

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        // let {productId,quantity} = data

        // if(!isValidObjectId(userId)){
        //     return res.status(400).send({status:false,message:"Invalid userId"})
        // }
        // const user = await userModel.findById({userId})
        // if(!user)  return res.status(400).send({status:false,message:"No user found this Id"})
        // const product = await productModel.findById({productId})
        // if(!product) return res.status(400).send({status:false,message:"No product found this Id"})
        // if(!isValidObjectId(productId)){
        //     return res.status(400).send({status:false,message:"Invalid productId"})
        // }

        let { productId,cartId} = data
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }

        if (userId !== req.params.userId) {
            return res.status(403).send({ status: false, message: "you are not able to create cart" })
        }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please give some data for create cart" })
        }

        if(cartId){
            if(!isValid(cartId)){
                return res.status(400).send({ status: false, message: "please provide cartId " })
            }
            if(!isValidObjectId(cartId)){
                return res.status(400).send({ status: false, message: "please provide the valid cartId " })
            }
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "please provide peoductId" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please provide valid productId" })
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(400).send({ status: false, message: "product is not exist already deleted" })
        let totalPrice = product.price
        let totalItems = 1
        data.totalPrice = totalPrice
        data.totalItems = totalItems
        const cart = await cartModel.findById({userId:userId})
         totalPrice = cart.totalPrice+totalPrice
         totalItems = cart.totalPrice+totalPrice

        // console.log(cart)
        // if(!cart){
        // //     if(cartId)  return res.status(400).send({ status: false, message: "these cart is not exist for these particular user" })
        //     let addCart = {
        //         userId: userId,
        //         items: [{ productId: productId, quantity:1 }],
        //         totalPrice: product.price,
        //         totalItems: 1
        //     }
        if(!cart){
            const cartData = await cartModel.create(data)
            return  res.status(201).send({ status: true, message: " Cart is Create Successfully", data: cartData })
        // } 
        }

        else{
            let pr = {}
            let newObj = {}
            newObj.totalPrice = totalPrice
            newObj.totalItems = totalItems

            for(let i=0;i<cart.items.length;i++){
                if(cart.items.productId != productId){
                    pr["productId"] = productId
                    
                }
                quantity = cart.items.quantity+1
            }
        }

        var updateCart = await cartModel.findOneAndUpdate({userId:userId},{$set:newObj,$push: { productId:pr } },{new:true})
        //     }
        // let arr = cartData.items
        // for(let i=0;i<arr.length;i++){
        //     if(arr[i].productId.toString() == productId){
        //         arr[i].quantity = arr[i].quantity+1
        //         
        //     else{
        //         let newCart = {
        //             totalPrice:cart.totalPrice,
        //             totalItems:cart.totalItems+1
        //         }
        //         updateCart = await cartModel.findByIdAndUpdate({userId:userId},newCart,{new:true})

        //     }
        // }

        return res.status(201).send({status:true,message:"success",data:updateCart})
            
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message})
    }
}
    
           
        


        



module.exports = { createCart }










