const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const { isValidObjectId } = require('mongoose')
const {  isValid, isValidRequestBody, numsRegex } = require("../validator/validation")

//**************************************************CREATE CART*************************************************************************** */
const createCart = async function (req, res) {
    try {
      const data = req.body;
      const userId = req.params.userId;
      let { productId, cartId } = data

    //   Validation 
     if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "Please give a valid userId" })
      }

      //authorizaton
      if (userId !== req.userId) {
        return res.status(403).send({ status: false, message: "You are not able to create the cart" })
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

        let carts = await cartModel.findOne({ _id: cartId,  "items.$.productId":productId })
        if (!carts) {
            return res.status(400).send({ status: false, message: "cart is not exist or product is not available this cart" })
        }
[1,2,4,6,8,9]
  
      //  if(removeProduct )

      let cartProductUse = carts.items.filter((x)=> x.productId._id.toString()===productId)
      console.log(cartProductUse)
      if(removeProduct===0){
      if(cartProductUse.length===0){
        return res.status(200).send({status:true,message:"this product is deleted from your cart... please continuous with your favourite product"})
      }
      let cartDetails = await cartModel.findOneAndUpdate({_id:cartId,"items.productId":productId},
      {$pull:{items:{productId:productId}},
      $inc:{totalPrice:-products.price*cartProductUse[0].quantity, 
       totalItems:-1}},{new:true}).populate([{path:"items.productId"}])
       return res.status(200).send({status:true,message:" Cart update",data:cartDetails})
      } 
       if(removeProduct===1){
        if(cartProductUse.length===0){
            return res.status(200).send({status:true,
            message:"this product is deleted from your cart... please continuous with your favourite product",
            data:carts})
          }
          if(cartProductUse[0].quantity===1){
            let cartDetails = await cartModel.findOneAndUpdate({_id:cartId,"items.productId":productId},
            {$pull:{items:{productId:productId}},
            $inc:{totalPrice:-products.price * cartProductUse[0].quantity,totalItems:-1}},
            {new:true}).populate([{path:"items.productId"}])
            return res.status(200).send({status:true,
                message:"product removed from cart",
                data:cartDetails})
          }
          if(cartProductUse[0].quantity>1){
            let cartDetails = await cartModel.findOneAndUpdate({_id:cartId,"items.productId":productId},
           {$inc:{"items.$.quantity":-1,totalPrice:-products.price}},
           {new:true}).populate([{path:"items.productId"}])
           return res.status(200).send({status:true,
               message:"cart updated",
               data:cartDetails})
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, message: err.message });
      }
    }



  
    //   if (!mongoose.isValidObjectId(productId)) { return res.status(400).send({ status: false, msg: "Product Id is invalid" }) }
  
    //   if (!mongoose.isValidObjectId(cartId)) { return res.status(400).send({ status: false, msg: "Cart Id is invalid" }) }
  
    //   if (!(removeProduct == 0 || removeProduct == 1)) {
    //     return res.status(400).send({ status: false, msg: "removeProduct value should be either 0 or 1" })
    //   }
  
    //   const isPresentCartId = await cartModel.findOne({ _id: cartId, userId: userId })
    //   if (!isPresentCartId) { return res.status(404).send({ status: false, msg: "No such cart exist" }) }
  
    //   const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
    //   if (!productDetails) {
    //     return res.status(404).send({ status: false, msg: "product not exist or deleted" })
    //   }
  
  
    //   const cart = isPresentCartId.items
  
  
    //   for (let i = 0; i < cart.length; i++) {
    //     if (cart[i].productId == productId) {
    //       let changePrice = cart[i].quantity * totalPrice.price
    //       console.log(changePrice)
  
    //       if (removeProduct == 0) {
    //         const productRemove = await cartModel.findOneAndUpdate({ _id: cartId }, {
    //           $pull: { items: { productId: productId } },
    //           totalPrice: isPresentCartId.totalPrice - changePrice, totalItems: isPresentCartId.totalItems - 1
    //         }, { new: true })
    //         return res.status(200).send({ status: true, msg: "Remove product Successfully", data: productRemove })
    //       }
  
    //       if (removeProduct == 1) {
    //         if (cart[i].quantity == 1 && removeProduct == 1) {
    //           const priceUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, {
    //             $pull: { items: { productId } },
    //             totalPrice: isPresentCartId.totalPrice - changePrice, totalItems: isPresentCartId.totalItems - 1
    //           }, { new: true })
    //           return res.status(200).send({ status: true, msg: "Remove product and price update successfully", data: priceUpdate })
    //         }
    //         cart[i].quantity = cart[i].quantity - 1;
    //         const cartUpdated = await cartModel.findByIdAndUpdate({ _id: cartId },
    //           { items: cart, totalPrice: isPresentCartId.totalPrice - isPresentProductId.price }, { new: true })
    //         return res.status(200).send({ status: true, msg: "One item remove successfully", data: cartUpdated })
    //       }
    //     }
    //   }
  
  


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
        return res.status(500).send({ status: false, message: error.message })
    }

}


module.exports = { createCart, updatedCart, getCart,deleteCart }
