const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")
const Authentication = async function (req, res, next) {
  try {

    let tokenWithBearer = req.headers["authorization"];
    if (!tokenWithBearer) {
      return res.status(400).send({ status: false, msg: "token not found" })
    }
    let tokenArray = tokenWithBearer.split(" ");

    let token = tokenArray[1];


    let decodedtoken = jwt.verify(token, "project5")
    if (!decodedtoken) {
      return res.status(401).send({ status: false, message: "invalid token" })
    }
    req.userId = decodedtoken.userId
    next()
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

module.exports = { Authentication }