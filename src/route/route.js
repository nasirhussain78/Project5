const express = require("express");
const router = express.Router();
const control = require("../controllers/userController");

//------------------API's------------------

router.post('/register', control.userCreate)
router.put('/user/:userId/profile', control.updateUser)

module.exports = router;