const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("../validator/validation");
const middleware = require("../middlewares/auth");
const ProductController = require("../controllers/productController")
const cartController = require("../controllers/cartController")

// .......................................... User APIs ...................................//

router.post( "/register",userController.registerUser);
router.post('/login', userController.loginUser)
router.get('/user/:userId',middleware.Authentication, userController.getUserById)
router.put('/user/:userId',middleware.Authentication, userController.updateUserProfile)

// .......................................... Product APIs ...................................//

router.post( "/products",ProductController.createProduct);
router.get( "/products",ProductController.getProduct);
router.get( "/products/:productId",ProductController.getProductId);
router.put('/products/:productId', ProductController.updateProduct)
router.delete('/products/:productId', ProductController.deleteProductById)



// .......................................... Cart APIs ...................................//
router.post( "/users/:userId",middleware.Authentication,cartController.createCart);


module.exports = router;

