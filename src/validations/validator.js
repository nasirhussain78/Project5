const userModel = require('../models/userModel')

const isValidValue = function (value) {
    if (typeof value === "undefined" || value === null) return false; 
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidDetails = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

const userValidation = async (req, res, next) => {
    try {
        data = req.body
        let { fname, lname, email, password, phone, address } = data

        if (!isValidDetails(data)) {
            return res.status(400).send({ status: false, msg: "please provide user data" })
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
            return res.status(400).send({ status: false, msg: "Please provide valid Email Address" });
        }
    
        let isDuplicateEmail = await userModel.findOne({ email })
        if (isDuplicateEmail) {
            return res.status(401).send({ status: false, msg: "email already exists" })
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
            return res.status(400).send({ status: false, msg: "please provide valid phone number" })
        }
    
        let isDuplicatePhone = await userModel.findOne({ phone })
        if (isDuplicatePhone) {
            return res.status(401).send({ status: false, msg: "phone no. already exists" })
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
                        return res.status(400).send({status:false, msg:"please provide valid pincode"})
                    }
            }
            else{
                return res.status(400).send({status:false, msg:"please provide shipping details."})
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
                        return res.status(400).send({status:false, msg:"please provide valid pincode"})
                    }
            }
            else{
                return res.status(400).send({status:false, msg:"please provide billing details."})
            }
        
        next()
    }
    catch(error){
        return res.status(500).json({ status: false, msg: error.message });
    }
}

module.exports = { userValidation }


/*

 if (!validator.isValidDetails(data)) {
            return res.status(400).send({ status: false, msg: "please provide user data" })
        }

         if (!validator.isValidValue(fname)) {
            return res.status(400).send({ status: false, messege: "please provide name" })
        }
        if (!validator.isValidValue(lname)) {
            return res.status(400).send({ status: false, messege: "please provide lname" })
        }

        if (!validator.isValidValue(email)) {
            return res.status(400).send({ status: false, messege: "please provide email" })
        }

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, msg: "Please provide valid Email Address" });
        }

        let isDuplicateEmail = await userModel.findOne({ email })
        if (isDuplicateEmail) {
            return res.status(401).send({ status: false, msg: "email already exists" })
        }

        if (!validator.isValidValue(password)) {
            return res.status(400).send({ status: false, messege: "please provide password" })
        }

        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }

          if (!validator.isValidValue(phone)) {
            return res.status(400).send({ status: false, messege: "please provide phone number" })
        }

        let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
        if (!isValidPhone) {
            return res.status(400).send({ status: false, msg: "please provide valid phone number" })
        }

        let isDuplicatePhone = await userModel.findOne({ phone })
        if (isDuplicatePhone) {
            return res.status(401).send({ status: false, msg: "phone no. already exists" })
        }

         if (address){
            if(address.shipping){
                if(!validator.isValidValue(address.shipping.street)){
                    return res.status(400).send({ status: false, messege: "please provide street." })
                }
                else if (!validator.isValidValue(address.shipping.city)){
                        return res.status(400).send({ status: false, messege: "please provide city." })
                    }
                    else if (!validator.isValidValue(address.shipping.pincode)){
                        return res.status(400).send({ status: false, messege: "please provide pincode." })
                    }    
            }
            if(address.billing){
                if(!validator.isValidValue(address.shipping.street)){
                    return res.status(400).send({ status: false, messege: "please provide street." })
                }
                else if (!validator.isValidValue(address.shipping.city)){
                        return res.status(400).send({ status: false, messege: "please provide city." })
                    }
                    else if (!validator.isValidValue(address.shipping.pincode)){
                        return res.status(400).send({ status: false, messege: "please provide pincode." })
                    }    
            }

*/
