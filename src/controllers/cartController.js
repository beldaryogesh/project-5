const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const { isValidObjectId } = require('mongoose')

const { isValid } = require("../validator/validation")


const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        let { items } = data
        let productId = items[0].productId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }
        let userExist = await userModel.findById(userId)
        if (!userExist) {
            return res.status(404).send({ status: false, msg: "No User Found With this Id" })
        }

        data['userId'] = userId

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "please provide productId" })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please provide valid productId" })
        }
        const product = await productModel.findById({ _id: productId, isDeleted: false })
        if (!product) return res.status(400).send({ status: false, message: "product is not exist already deleted" })

        let totalPrice = product.price
        // console.log(totalPrice)
        let totalItems = 1


        const cart = await cartModel.findOne({ userId: userId })
        if (!cart) {
            data['totalPrice'] = totalPrice
            data['totalItems'] = totalItems
            const cartData = await cartModel.create(data)
            return res.status(201).send({ status: true, message: " Cart is Create Successfully", data: cartData })
        }
        else {
            let x = 0
            let newObj = {}
            // console.log(cart)
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    cart.items[i].quantity += parseInt(items[i].quantity)
                    x = 1
                    break;
                }
            }
            if (x == 0) {
                let obj = {
                    productId: items[0].productId,
                    quantity: items[0].quantity
                }
                console.log(obj)
                cart.items.push(obj)
                console.log("Hlw1")
                console.log(cart)
            }
            cart.totalPrice += totalPrice
            // newObj['totalPrice'] = totalPrice
            cart.totalItems = cart.items.length
            // newObj['totalItems'] = totalItems
            // console.log(isCart)
            let addtoCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: cart }, { new: true })
            return res.status(200).send({ status: true, data: addtoCart })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
module.exports = { createCart }







































