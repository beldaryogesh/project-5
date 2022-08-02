const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const { isValidObjectId } = require('mongoose')
const {  isValid, isValidRequestBody, numsRegex } = require("../validator/validation")
// const { findOneAndUpdate } = require("../models/userModel")

//**************************************************CREATE CART*************************************************************************** */
const createCart = async function (req, res) {
    try {
      const data = req.body;
      const userId = req.params.userId;
      let { productId, cartId } = data
     if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Please give a valid userId" })
      }
      if (userId !== req.userId) {
        return res.status(403).send({ status: false, message: "You are not able to create the cart" })//authorizaton
      }
      if (!isValidRequestBody(data)) {
        return res.status(400).send({ status: false, message: "Please give some data for create cart" })
      }
      if (cartId) {
        if (!isValid(cartId)) {
          return res.status(400).status({ status: false, message: "cardId should not be empty" })
        }
        if (userId !== req.userId) {
            return res.status(403).send({ status: false, message: "You are not able to create the cart" })//authorizaton
        }
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please give some data for create cart" })
        }
        if (cartId) {
            if (!isValid(cartId)) {
                return res.status(400).status({ status: false, message: "cardId should not be empty" })
            }
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({ staus: false, message: "Please provide a valid cartId" })
            }
        }
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide a productId" })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid productId" })
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(404).send({ status: false, message: "product is not exist or already deleted" })
        }
        const cart = await cartModel.findOne({ userId: userId })
        if (!cart) {
            if (cartId) return res.status(400).send({ status: false, message: "This cart is not exist for this particular user" })//req.params.userId != cartId ==>show erorr
            let addCart = {
                userId: userId,
                items: [{ productId: productId, quantity: 1 }],
                totalPrice: product.price,
                totalItems: 1,
            }
            const create = await cartModel.create(addCart)
            return res.status(201).send({ status: true, message: "Success", data: create })
        }

        else {
          let newCart = {
            $addToSet: { items: { productId: product._id, quantity: 1 } },
            totalPrice: product.price + cart.totalPrice,
            totalItems: cart.totalItems + 1
          }
          updateCart = await cartModel.findOneAndUpdate({ userId: userId }, newCart, { new: true })
        }

        let arr = cart.items;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].productId.toString() == productId) {
                arr[i].quantity = arr[i].quantity + 1
                var updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: arr, totalPrice: cart.totalPrice + product.price, totalItems: cart.totalItems + 1 }, { new: true }) //totalItems: arr.length
            }

            else {
                let newCart = {
                    $addToSet: { items: { productId: product._id, quantity: 1 } },
                    totalPrice: product.price + cart.totalPrice,
                    totalItems: cart.totalItems + 1
                }
                updateCart = await cartModel.findOneAndUpdate({ userId: userId }, newCart, { new: true })
            }
        }
        return res.status(201).send({ status: true, message: "Success", data: updateCart })
    }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
  }


 //*******************************************updatedCart***************************************************************************** */
 
 
  const updatedCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        const data = req.body;
        let { productId, cartId, removeProduct } = data
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please give a valid userId" })
        }
        // if (userId !== req.userId) {
        //     return res.status(403).send({ status: false, message: "You are not able to create the cart" })//authorizaton
        // }
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please give some data for create cart" })
        }
        if (cartId) {
            if (!isValid(cartId)) {
                return res.status(400).status({ status: false, message: "cardId should not be empty" })
            }
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({ staus: false, message: "Please provide a valid cartId" })
            }
        }
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide a productId" })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid productId" })
        }

        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "Please provide removeProduct" })
        }
        if (!numsRegex.test(removeProduct)) {
            return res.status(400).send({ status: false, message: "Remove product between 0 to 1" })
        }

        let products = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!products) {
            return res.status(400).send({ status: false, message: "product is not exist or already deleted" })
        }

        let cart = await cartModel.findOne({ _id: cartId,  "items.productId":productId })
        if (!cart) {
            return res.status(400).send({ status: false, message: "cart is not exist or product is not available this cart" })
        }

        if (removeProduct == 1) {
            let updateCart = await cartModel.findOneAndUpdate({ _id: cartId, "items.productId": productId }, { $inc: { totalPrice: -products.price,"items.quantity":-1}}, { new: true })
            console.log(updateCart.items)
        }
    } catch (error) {
        
        return res.status(500).send({ status: false, message:error.message })
    }

}
//*************************************************GETCART APIS************************************************************************* */
  const getCart = async function (req, res) {
    try {
      let userId = req.params.userId;
      if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Please provide a valid userId" })
      }
      
      if (userId !== req.userId) {
        return res.status(403).send({ status: false, message: "You are not authorized for this cart" })//=> check authorization
      }
  
      const existCart = await cartModel.findOne({ userId: userId }).populate({path: "items.productId"} )
      if (!existCart) {
        return res.status(404).send({ status: false, message: "Cart is not exist" })
      }
      return res.status(200).send({ status: true, message: "Success", data: existCart })
  
  
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message })
  
    }
  }

  const deleteCart = async function (req, res) {
    try {

        let userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId" })
        }

        const checkUser = await userModel.findOne({ _id: userId })

        if (!checkUser) {
            return res.status(404).send({ status: false, message: "This User is Not Exist" })
        }
        if (userId !== req.userId) {
            return res.status(403).send({ status: false, message: "You are not authorized for this cart" })//=> check authorization
        }
        let checkCart = await cartModel.findOne({ userId: userId })

        if(!checkCart){
            return res.status(404).send({status:false,msg:"There Is Nothing In ur Cart"})
        }
        else{
            checkCart.totalItems = 0
            checkCart.totalPrice = 0
            checkCart.items = []
           let delCart = await cartModel.findOneAndUpdate({userId:userId},{$set:checkCart},{new:true})
           console.log(delCart)
           return res.status(204).send({status:true,msg:"Cart Deleted Succesfully",data:delCart})                
        }
    } catch (error) {
        return res.status(400).send({ status: false, message: error.message })
    }

}


module.exports = { createCart, updatedCart, getCart,deleteCart }
