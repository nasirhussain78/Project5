const express = require("express");
const router = express.Router();
const control = require("../controllers/userController")
const Validation = require('../validations/validator')

//------------------API's------------------

router.post('/register', Validation.userValidation, control.createUser)
router.put('/user/:userId/profile', control.updateUser)

module.exports = router;