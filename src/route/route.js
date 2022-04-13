const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const validate = require('../validations/validator')
const auth = require('../middleware/auth')

//------------------API's-----------------------------------------------------------------------------------

router.post('/register', validate.user, userController.createUser)
router.post('/login', validate.login,userController.userLogin)
router.get('/user/:userId/profile', auth.userAuth, userController.getUserDetail)
router.put('/user/:userId/profile', auth.userAuth, userController.updateUser)

router.post('/products',validate.product, productController.createProduct)
router.get('/products', productController.filterProducts)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)

module.exports = router;