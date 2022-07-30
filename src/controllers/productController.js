const productModel = require("../models/productModel")
const mongoose = require("mongoose")
const { isValidObjectId } = require('mongoose')

const { uploadFile, isValid, isValidFiles, isValidRequestBody, nameRegex, emailRegex, phoneRegex, numRegex, passRegex, } = require("../validator/validation")


// *************************************************CREATE PRODUCT*******************************************
const createProduct = async function (req, res) {

    try {
        let data = req.body
        let files = req.files
        const { title, description, price, currencyId, currencyFormat, style, availableSizes, installments } = data

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
        if (!numRegex.test(price)) {
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

        if (!availableSizes) {
            return res.status(400).send({ status: false, msg: "please provide availableSizes" })
        }
        if (availableSizes.length < 1) {
            return res.status(400).send({ status: false, msg: "please enter size of product" })
        }
       


        sizeArr = availableSizes.replace(/\s+/g, "").split(",")
        let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        let flag
        for (let i = 0; i < sizeArr.length; i++) {
            flag = arr.includes(sizeArr[i])
        }
        if (!flag) {
            return res.status(400).send({ status: false, data: "Enter a valid size S or XS or M or X or L or XXL or XL ", });
        }


        data['availableSizes'] = sizeArr
        if (installments) {
            if (bodyFromReq.hasOwnProperty("installments"))
                if (!isValid(installments)) return res.status(400).send({ status: false, Message: "Please provide installments" })

            if (!numRegex.test(installments)) {
                return res.status(400).send({ status: false, msg: "please provide installement only numercial value" })
            }
        }
        let url = await uploadFile(files[0])
        data['productImage'] = url
        const product = await productModel.create(data)

        return res.status(201).send({ status: true, message: "product create successfully", data: product })
    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })

    }
}

//***************************************************GET PRODUCT******************************************************************** */

const getProduct = async function (req, res) {
    try {
        let query = req.query;
        let { size, name, priceGreaterThan, priceLessThan } = query
        let filter = { isDeleted: false }
        if (size) {
            size = size.split(",").map(ele => ele.trim())
            if (Array.isArray(size)) {
                let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                let uniqueSizes = [...new Set(size)]
                for (let ele of uniqueSizes) {
                    if (enumArr.indexOf(ele) == -1) { return res.status(400).send({ status: false, message: `'${ele}' is not a valid size, only these sizes are available [S, XS, M, X, L, XXL, XL]` }) }
                }
                filter["availableSizes"] = { $in: uniqueSizes }
            }
            else return res.status(400).send({ status: false, message: "size should be of type Array" })
        }
        //to do substring name
        if (name) {
            if (!isValid(name)) return res.status(400).send({ status: false, message: "name is in incorrect format" })
            filter["title"] = { "$regex": name };
        }
        if (priceGreaterThan) {
            if (!priceGreaterThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            filter["price"] = { $gte: priceGreaterThan }
        }
        if (priceLessThan) {
            if (!priceLessThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            filter["price"] = { $lte: priceLessThan }
        }

        if (priceGreaterThan && priceLessThan) {
            if (!priceLessThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            if (!priceGreaterThan.toString().match(priceReg)) return res.status(400).send({ status: false, message: "price should be in valid number/decimal format" })
            filter["price"] = { $gte: priceGreaterThan, $lte: priceLessThan }
        }
        const foundProducts = await productModel.find(filter).select({ id: 0, _v: 0 })
        foundProducts.sort((a, b) => {
            return a.price - b.price
        })
        if (foundProducts.length == 0) return res.status(404).send({ status: true, message: "no product found for the given query" })
        return res.status(200).send({ status: true, data: foundProducts })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
//*************************************************GET PRODUCT BY ID****************************************************************** */

const getProductId = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide a valid productId." })
        const productDetails = await productModel.findById(productId)
        if (!productDetails) return res.status(404).send({ status: false, message: "No such product found in the database." })
        if (productDetails.isDeleted === true) return res.status(400).send({ status: false, message: "This productDetails has already been deleted." })
        return res.status(200).send({ status: true, message: "Success", data: productDetails })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
// **********************************************UPDATE PRODUCT************************************************************************
const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        let data = req.body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        let bodyFromReq = JSON.parse(JSON.stringify(data));

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "invalid productId" })
        }

        const productData = await productModel.findOne({ __id: productId, isDeleted: false })
        if (!productData) return res.status(400).send({ status: false, msg: "Product is not present" })

        const titleData = await productModel.findOne({ title: title })
        if (titleData) return res.status(400).send({ status: false, msg: `${title} is already present` })

        let newObj = {}

        if (bodyFromReq.hasOwnProperty("title"))
            if (!isValid(title)) { return res.status(400).send({ status: false, msg: "Provide the title" }) }
        if (!nameRegex.test(title))
            return res.status(400).send({ status: false, message: "title should contain alphabets only." })
        newObj["title"] = title

        if (bodyFromReq.hasOwnProperty("description"))
            if (!isValid(description)) {
                return res.status(400).send({ status: false, msg: "please enter the description" })
            }
        newObj["description"] = description

        if (bodyFromReq.hasOwnProperty("price")) {
            if (!isValid(price)) {
                return res.status(400).send({ status: false, msg: "please enter the price" })
            }
            if (!numRegex.test(price)) {
                return res.status(400).send({ status: false, msg: "please provide numerical price" })
            }
            if (price <= 0) {
                return res.status(400).send({ status: false, msg: "please should not be zero" })
            }
            newObj["price"] = price
        }

        if (bodyFromReq.hasOwnProperty("currencyId")) {
            if (!isValid(currencyId)) {
                return res.status(400).send({ status: false, msg: "please provide currencyId" })
            }
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, msg: "please provide valid currencyId" })
            }
            newObj["currencyId"] = currencyId
        }
        if (bodyFromReq.hasOwnProperty("currencyFormat")) {
            if (!currencyFormat) {
                return res.status(400).send({ status: false, msg: "please provide currencyFormet" })
            }
            if (currencyFormat !== "₹") {
                return res.status(400).send({ status: false, msg: 'currencyFormat should be "₹" ' })
            }
            newObj["currencyFormat"] = currencyFormat
        }

        //check if isFreeShipping is present or not

        if (data.isFreeShipping || data.isFreeShipping === "") {
            if (!isValid(data.isFreeShipping)) return res.status(400).send({ status: false, message: "isFreeShipping cant be empty" })
            console.log("ahh")
            if (!data.isFreeShipping.toLowerCase().match(/^(true|false|True|False|TRUE|FALSE)$/))
                return res.status(400).send({
                    status: false,
                    message: "Please provide isFreeShipping true/false",
                })

            newObj["isFreeShipping"] = isFreeShipping
        }

        if (style) {
            if (!isValid(style)) {
                return res.status(400).send({ status: false, msg: "Provide the style " })
            }
            newObj["style"] = style
        }
        if (installments) {
            let bodyFromReq = JSON.parse(JSON.stringify(data));
            if (bodyFromReq.hasOwnProperty("installments"))
                if (!isValid(installments)) return res.status(400).send({ status: false, Message: "Please provide installments" })

            if (!numRegex.test(installments)) {
                return res.status(400).send({ status: false, msg: "please provide installement only numercial value" })
            }
            newObj["installements"] = installments
        }

        if (availableSizes) {
            let size = availableSizes.split(",")

            if (!Array.isArray(size)) return res.status(400).send({ status: false, msg: "availableSizes should be array of strings" })

            let Size = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']
            const subtrim = size.map(element => {
                return element.trim()

            })
            for (const element of subtrim) {

                console.log(availableSizes)
                if (Size.includes(element) === false) return res.status(400).send({ status: false, msg: 'Sizes should be in ["S", "XS", "M", "X", "L", "XXL", "XL"]' })

            }

            // newObj['availableSizes'] = {availableSizes}
        }
        let uploadedFileURL
        if (files) {
            if (files && files.length > 0) {
                let url = await uploadFile(files[0])
                data['profileImage'] = url
            }
            newObj['productImage'] = uploadedFileURL
        }
        //updation part
        const updateProduct = await productModel.findByIdAndUpdate({ _id: productId }, { $set: newObj, $push: { availableSizes: availableSizes } }, { new: true })
        return res.status(200).send({ status: true, "message": "Product updated", data: updateProduct })
    }
    catch (error) {

        return res.status(500).send({ status: false, err: error.message })
    }
}

// **********************************************DELETE PRODUCT**********************************************

const deleteProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please provide a valid productId." })
        let product = await productModel.findById(req.params.productId)
        if (!product) return res.status(400).send({ status: false, message: "product is not found" })
        if (product.isDeleted === true) return res.status(400).send({ status: false, message: "This product is already deleted." })

        await productModel.findOneAndUpdate(
            { _id: req.params.productId },
            { isDeleted: true, deletedAt: Date.now() })
        return res.status(200).send({ status: true, message: "product deleted succesfully." })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getProduct, getProductId, updateProduct, deleteProductById }