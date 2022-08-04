const orderModel = require("../models/orderModel")
const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const { isValidObjectId } = require('mongoose')
const { isValid, isValidRequestBody, cancelRegex, statusRegex } = require("../validator/validation")

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId;
        let data = req.body;
        const { cartId, cancellable, status } = data
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please give a valid userId" })
        }
        if (userId !== req.userId) {
            return res.status(403).send({ status: false, message: "You are not able to create the order" })//authorizaton
        }


        if (!cartId) {
            return res.status(400).send({ status: false, msg: "Plz enter cartId in body !!!" });
        }
        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid  Of cartId in Body !!!" });
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Please give a valid cartId" })
        }

        let existUser = await userModel.findById({ _id: userId })
       
        if (!existUser) {
            return res.status(400).send({ status: false, message: "User have not exist in database." })
        }


        const existCart = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!existCart) {
            return res.status(404).send({ status: false, msg: "User does not have any cart !!!" });
        }
        let itemArr = existCart.items
        if (itemArr.length == 0) {
            return res.status(400).status({ status: false, message: "cart is empty." })
        }
        let totalQuantity = 0;
        for (let i = 0; i < existCart.items.length; i++) {
            totalQuantity = totalQuantity + existCart.items[i].quantity
        }
        let orderDetails = {
            userId: userId,
            items: itemArr,
            totalPrice: existCart.totalPrice,
            totalItems: existCart.totalItems,
            totalQuantity: totalQuantity
        }

        if (cancellable) {
            if (!isValid(cancellable)) {
                return res.status(400).send({ status: true, Message: "please provide cancelitation property" })
            }
            let cancle = cancellable.toString().trim().toLowerCase()
            if (!cancelRegex.test(cancle)) {
                return res.status(400).send({ status: true, Message: "Cancellable should be boolean value (true and false)" })
            }
            orderDetails["cancellable"] = cancle
        }
        if (status) {
            if (!isValid(status)) {
                return res.status(400).send({ status: true, Message: "please provide status property" })
            }

            let statu = status.trim().toLowerCase()
            if (!statusRegex.test(statu)) {
                return res.status(400).send({ status: true, Message: "please provide status should be  ['pending', 'completed', 'cancelled']" })
            }
            orderDetails["status"] = statu
        }

        let orderCreate = await orderModel.create(orderDetails)

        await cartModel.findOneAndUpdate({_id:cartId},
        {$set:{items:[],totalItems:0,totalPrice:0}},{new:true})
        return res.status(201).send({ status: true, Message: "success", data: orderCreate })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
}
        
const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId;
        let data = req.body;
        let { orderId, status } = data
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please give a valid userId" })
        }
        if (userId !== req.userId) {
            return res.status(403).send({ status: false, message: "You are not able to create the order" })//authorizaton
        }
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please give some data for create cart" })
        }

        let existUser = await userModel.findById({ _id: userId })
        if (!existUser) {
            return res.status(400).send({ status: false, message: "User have not exist in database." })
        }

        if (!orderId) {
            return res.status(400).send({ status: false, msg: "Plz enter orderId in body !!!" });
        }
        if (!isValid(orderId)) {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid  Of orderId in Body !!!" });
        }
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "Please give a valid orderId" })
        }
        let orderFind = await orderModel.findById({ _id: orderId, userId: userId })

        if (!orderFind) {
            return res.status(400).send({ status: false, message: "Order not found for this user." })
        }
        if (orderFind.cancellable == true) {
            if (orderFind.status == "pending") {
                const updateStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true });
                if (!updateStatus) {
                    return res.status(400).send({ status: false, message: "Won't able to change status !!!" });
                }
                return res.status(200).send({ status: true, message: "Order updated successfully", data: updateStatus });
            }

            if (orderFind.status == "completed") {
                return res.status(400).send({ status: false, message: "Order already completed, won't able to change status !!!" });
            }

            if (orderFind.status == "canceled") {
                return res.status(400).send({ status: false, message: "Order already cancled !!!" });
            }
        }


        if (orderFind.cancellable == false) {
            return res.status(400).send({ status: false, msg: "its not cancellable !!!" });
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

module.exports = { createOrder, updateOrder }