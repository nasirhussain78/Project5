const userModel = require('../models/userModel')
const productModel = require('../models/productModel')

const isValidValue = function (value) {
    if (typeof value === "undefined" || value === null) return false; 
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidDetails = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

const isValidString = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidSize = function (input) {
    return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(input) !== -1; //enum validation
};

const validInstallment = function isInteger(value) {
    if (value < 0) return false
    if (value % 1 == 0) return true;
}

//------------------------------------ user validations --------------------------------------------------------

const user = async (req, res, next) => {
    try {
        data = req.body
        let { fname, lname, email, password, phone, address } = data

        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, message: "please provide user data" })
        }
    
         if (!isValidValue(fname)) {
            return res.status(400).send({ status: false, messege: "please provide name" })
        }
        if (!isValidValue(lname)) {
            return res.status(400).send({ status: false, messege: "please provide lname" })
        }
    
        if (!isValidValue(email)) {
            return res.status(400).send({ status: false, messege: "please provide email" })
        }
    
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: "Please provide valid Email Address" });
        }
    
        let isDuplicateEmail = await userModel.findOne({ email })
        if (isDuplicateEmail) {
            return res.status(400).send({ status: false, message: "email already exists" })
        }
    
        if (!isValidValue(password)) {
            return res.status(400).send({ status: false, messege: "please provide password" })
        }
    
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }
    
          if (!isValidValue(phone)) {
            return res.status(400).send({ status: false, messege: "please provide phone number" })
        }
    
        let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
        if (!isValidPhone) {
            return res.status(400).send({ status: false, message: "please provide valid phone number" })
        }
    
        let isDuplicatePhone = await userModel.findOne({ phone })
        if (isDuplicatePhone) {
            return res.status(400).send({ status: false, message: "phone no. already exists" })
        }

            if(address.shipping){
                if(!isValidValue(address.shipping.street)){
                    return res.status(400).send({ status: false, messege: "please provide street for shipping." })
                }
                else if (!isValidValue(address.shipping.city)){
                        return res.status(400).send({ status: false, messege: "please provide city for shipping." })
                    }
                    else if (!isValidValue(address.shipping.pincode)){
                        return res.status(400).send({ status: false, messege: "please provide pincode for shipping." })
                    }
                    if (address.shipping.pincode.length != 6){
                        return res.status(400).send({status:false, message:"please provide valid pincode"})
                    }
            }
            else{
                return res.status(400).send({status:false, message:"please provide shipping details."})
            }

            if(address.billing){
                if(!isValidValue(address.billing.street)){
                    return res.status(400).send({ status: false, messege: "please provide street for billing." })
                }
                else if (!isValidValue(address.billing.city)){
                        return res.status(400).send({ status: false, messege: "please provide city for billing." })
                    }
                    else if (!isValidValue(address.billing.pincode)){
                        return res.status(400).send({ status: false, messege: "please provide pincode for billing." })
                    }
                    if (address.billing.pincode.length != 6){
                        return res.status(400).send({status:false, message:"please provide valid pincode"})
                    }
            }
            else{
                return res.status(400).send({status:false, message:"please provide billing details."})
            }
        
        next()
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//-------------------------------log in --------------------------------------------------------------------------------

const login = async (req, res, next) => {
    try {
        const data = req.body
        let {email, password} = data
        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, message: "please provide user credentials." })
        }

        if (!isValidValue(email)) {
            return res.status(400).send({ status: false, message: "Email-Id is required" })
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "Email should be a valid email address" })
        }

        if (!isValidValue(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

        next()
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//------------------------------- update user validations -------------------------------------------------------------

const updateUser = async (req, res, next) => {
    try{
        const dataToUpdate = req.body

        if (!isValidDetails(dataToUpdate)) {
            res.status(400).send({
                status: false,
                msg: "Please provide the user details to update",
            });
        }

        const { fname, lname, email, profileImage, phone, password, address } = dataToUpdate;

        if (!isValidString(fname)) {
            return res.status(400).send({ status: false, msg: "Please provide first name of the user." }); //Category is mandory
        }

        if (!isValidString(lname)) {
            return res.status(400).send({ status: false, msg: "Please provide last name of the user." }); //Category is mandory
        }

        if (!isValidString(email)) {
            return res.status(400).send({ status: false, msg: "Please provide email of the user." }); //Category is mandory
        }

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: "Please provide valid Email Address" });
        }

        const isDuplicateemail = await userModel.findOne({ email: email });
        if (isDuplicateemail) {
            return res.status(400).send({status: false,msg: "User with provided email is already present.",})
        }

        if (!isValidString(profileImage)) {
            return res.status(400).send({ status: false, msg: "Please provide profile image of the user." }); //Category is mandory
        }

        if (!isValidString(phone)) {
            return res.status(400).send({ status: false, msg: "Please provide phone number of the user." }); //Category is mandory
        }

        let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
        if (!isValidPhone) {
            return res.status(400).send({ status: false, message: "please provide valid phone number" })
        }

        const isDuplicatePhone = await userModel.findOne({ phone: phone });
        if (isDuplicatePhone) {
            return res.status(400).send({status: false,msg: "User with provided phone no. is already present.",})
        }

        if (!isValidString(password)) {
            return res.status(400).send({ status: false, msg: "Please provide password." }); //Category is mandory
        }

        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }

        if (address) {
            //converting shipping address to string them parsing it.
            let shippingAddressToString = JSON.stringify(address)
            let parsedShippingAddress = JSON.parse(shippingAddressToString)

            if (isValidRequestBody(parsedShippingAddress)) {
                if (parsedShippingAddress.hasOwnProperty('shipping')) {
                    if (parsedShippingAddress.shipping.hasOwnProperty('street')) {
                        if (!isValidValue(parsedShippingAddress.shipping.street)) {
                            return res.status(400).send({ status: false, message: "Please provide shipping address's Street" });
                        }
                    }
                    if (parsedShippingAddress.shipping.hasOwnProperty('city')) {
                        if (!isValidValue(parsedShippingAddress.shipping.city)) {
                            return res.status(400).send({ status: false, message: "Please provide shipping address's City" });
                        }
                    }
                    if (parsedShippingAddress.shipping.hasOwnProperty('pincode')) {
                        if (!isValidValue(parsedShippingAddress.shipping.pincode)) {
                            return res.status(400).send({ status: false, message: "Please provide shipping address's pincode" });
                        }
                    }

                    //using var to use these variables outside this If block.
                    var shippingStreet = address.shipping.street
                    var shippingCity = address.shipping.city
                    var shippingPincode = address.shipping.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: "Shipping address cannot be empty" });
            }
        }

        if (address) {

            //converting billing address to string them parsing it.
            let billingAddressToString = JSON.stringify(address)
            let parsedBillingAddress = JSON.parse(billingAddressToString)

            if (isValidRequestBody(parsedBillingAddress)) {
                if (parsedBillingAddress.hasOwnProperty('billing')) {
                    if (parsedBillingAddress.billing.hasOwnProperty('street')) {
                        if (!isValidValue(parsedBillingAddress.billing.street)) {
                            return res.status(400).send({ status: false, message: "Please provide billing address's Street" });
                        }
                    }
                    if (parsedBillingAddress.billing.hasOwnProperty('city')) {
                        if (!isValidValue(parsedBillingAddress.billing.city)) {
                            return res.status(400).send({ status: false, message: "Please provide billing address's City" });
                        }
                    }
                    if (parsedBillingAddress.billing.hasOwnProperty('pincode')) {
                        if (!isValidValue(parsedBillingAddress.billing.pincode)) {
                            return res.status(400).send({ status: false, message: "Please provide billing address's pincode" });
                        }
                    }

                    //using var to use these variables outside this If block.
                    var billingStreet = address.billing.street
                    var billingCity = address.billing.city
                    var billingPincode = address.billing.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: "Billing address cannot be empty" });
            }
        }

        next()
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//------------------------------- product validations --------------------------------------------------------------------------------

const product = async (req, res, next) => {
    try{
        let { title,description,price,currencyId,availableSizes,installments } = req.body

        if (!isValidDetails(req.body)) {
            return res.status(400).send({ status: false, message: "please provide product details" })
        }
    
        if (!isValidValue(title)) {
            return res.status(400).send({ status: false, messege: "please provide title" })
        }
        let isDuplicateTitle = await productModel.findOne({ title })
        if (isDuplicateTitle) {
            return res.status(400).send({ status: false, message: "title already exists" })
        }

        if (!isValidValue(description)) {
            return res.status(400).send({ status: false, messege: "please provide description" })
        }

        if (!isValidValue(price)) {
            return res.status(400).send({ status: false, messege: "please provide price" })
        }

        if (!isValidValue(currencyId)) {
            return res.status(400).send({ status: false, messege: "please provide currencyId" })
        }

        if (currencyId != "INR") {
            return res.status(400).send({ status: false, message: "currencyId should be INR" })
        }

        if(installments){
            if (!validInstallment(installments)) {
                return res.status(400).send({ status: false, message: "installments can not be a decimal number " })
            }
        }

        if (!isValidSize(availableSizes)) {
            return res.status(400).send({ status: false, message: "Please provide valid size." }); //Enum is mandory
          }

        next()
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = { user, login, product, updateUser }
