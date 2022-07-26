const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const middleware = require("../middlewares/auth");
const validation = require("../validator/validation");



// .......................................... User APIs ...................................//
router.post( "/register",userController.registerUser);
router.post('/login', userController.loginUser)

router.get('/user/:userId',middleware.Authentication, userController.getUser)


module.exports = router;



