const validator = require('../validations/validator')
const aws = require('../aws/aws')
const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//**********************************  create user  *****************************************************************

const createUser = async (req, res) => {
    try {
        let data = req.body
        let files = req.files
        let { fname, lname, email, password, phone, address } = data
        
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)

        if (!(files && files.length > 0)) {
            return res.status(400).send({ status: false, message: "Please provide your image" })
        }
        profileImage = await aws.uploadFile(files[0])

        const finalDetails = { fname, lname, email, profileImage, password, phone, address }
        let savedData = await userModel.create(finalDetails)
        return res.status(201).send({ status: true, msg: "user created successfully", data: savedData });
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

//**********************************  user login  ******************************************************************************************** */

const userLogin = async (req, res) => {
    try {
        const data = req.body
        let {email, password} = data

        let findUser = await userModel.findOne({email});
        
        if (!findUser)
            return res.status(404).send({
                status: false,
                msg: "Login failed! No user found with the provided email.",
        });

       const isValidPassword = await bcrypt.compare(password, findUser.password)

       if (!isValidPassword)
            return res.status(404).send({
                status: false,
                msg: "Login failed! Wrong password.",
        });

            let token = jwt.sign(
                {
                  userId: findUser._id,
                  iat: Math.floor(Date.now() / 1000),
                  exp: Math.floor(Date.now() / 1000) + 60 * 60
                }, "group9");
        
        res.header('Authorization', token);
        return res.status(200).send({ status: true, message: "User login successfull", data:{usedId:`${findUser._id}`, token: token }})
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


/**********************************  get user detail  ******************************************************************************************** */

const getUserDetail = async function (req, res) {
    try {
        const userIdFromParams = req.params.userId;
        const userIdFromToken = req.userId
        
        const userByuserId = await userModel.findById(userIdFromParams).lean();

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (userIdFromToken != userIdFromParams) {
            return res.status(403).send({
              status: false,
              message: "Unauthorized access.",
            });
        }

        return res.status(200).send({ status: true, message: "User details", data: userByuserId });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//**********************************  update user details ******************************************************************************************** */

const updateUser = async (req, res) => {
    try {
        const userIdFromParams = req.params.userId
        const userIdFromToken = req.userId
        let files = req.files
        const dataToUpdate = req.body
        
        if (!validator.isValidObjectId(userIdFromParams)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" });
        }

        const userByuserId = await userModel.findById(userIdFromParams);

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }

        if (userIdFromToken != userIdFromParams) {
            return res.status(403).send({
              status: false,
              message: "Unauthorized access.",
            });
        }

        if (!validator.isValidDetails(dataToUpdate)) {
            return res.status(400).send({ status: false, msg: "please provide details to update." });
        }

        const { fname, lname, email, phone, password, address } = dataToUpdate;

        if(fname){
            if (!validator.isValidValue(fname)) {
                return res.status(400).send({ status: false, msg: "Please provide first name of the user." });
            }
        }

        if(lname){
            if (!validator.isValidValue(lname)) {
                return res.status(400).send({ status: false, msg: "Please provide last name of the user." });
            }
        }

        if(email){
            if (!validator.isValidValue(email)) {
                return res.status(400).send({ status: false, msg: "Please provide email of the user." });
            }
    
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, message: "Please provide valid Email Address" });
            }
    
            const isDuplicateemail = await userModel.findOne({ email: email });
            if (isDuplicateemail) {
                return res.status(400).send({status: false,msg: "User with provided email is already present.",})
            }
        }

        if(phone){
            if (!validator.isValidValue(phone)) {
                return res.status(400).send({ status: false, msg: "Please provide phone number of the user." });
            }
    
            let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
            if (!isValidPhone) {
                return res.status(400).send({ status: false, message: "please provide valid phone number" })
            }
    
            const isDuplicatePhone = await userModel.findOne({ phone: phone });
            if (isDuplicatePhone) {
                return res.status(400).send({status: false,msg: "User with provided phone no. is already present.",})
            }
        }

        let holdPassword = password
        if(holdPassword){
            if (!validator.isValidValue(holdPassword)) {
                return res.status(400).send({ status: false, msg: "Please provide password." });
            }
    
            if (holdPassword.length < 8 || holdPassword.length > 15) {
                return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
            }

            const salt = await bcrypt.genSalt(10);
            var hashedPassword = await bcrypt.hash(holdPassword, salt)
        }

        if (address) {
            
            let stringifyShippingAddress = JSON.stringify(address)
            let parseShippingAddress = JSON.parse(stringifyShippingAddress)

            if (validator.isValidDetails(parseShippingAddress)) {
                if (parseShippingAddress.hasOwnProperty('shipping')) {
                    if (parseShippingAddress.shipping.hasOwnProperty('street')) {
                        if (!validator.isValidValue(parseShippingAddress.shipping.street)) {
                            return res.status(400).send({ status: false, message: "Please provide street of the shipping address." });
                        }
                    }
                    if (parseShippingAddress.shipping.hasOwnProperty('city')) {
                        if (!validator.isValidValue(parseShippingAddress.shipping.city)) {
                            return res.status(400).send({ status: false, message: "Please provide city of the shipping address." });
                        }
                    }
                    if (parseShippingAddress.shipping.hasOwnProperty('pincode')) {
                        if (!validator.isValidValue(parseShippingAddress.shipping.pincode)) {
                            return res.status(400).send({ status: false, message: "Please provide pincode of the shipping address." });
                        }
                    }
                }

            var shippingStreet = address.shipping.street
            var shippingCity = address.shipping.city
            var shippingPincode = address.shipping.pincode
            } else {
                return res.status(400).send({ status: false, message: "Shipping address cannot be empty" });
            }
        }

        if (address) {

            let stringifyBillingAddress = JSON.stringify(address)
            let parseBillingAddress = JSON.parse(stringifyBillingAddress)

            if (validator.isValidDetails(parseBillingAddress)) {
                if (parseBillingAddress.hasOwnProperty('billing')) {
                    if (parseBillingAddress.billing.hasOwnProperty('street')) {
                        if (!validator.isValidValue(parseBillingAddress.billing.street)) {
                            return res.status(400).send({ status: false, message: "Please provide street of the billing address." });
                        }
                    }
                    if (parseBillingAddress.billing.hasOwnProperty('city')) {
                        if (!validator.isValidValue(parseBillingAddress.billing.city)) {
                            return res.status(400).send({ status: false, message: "Please provide city of the billing address." });
                        }
                    }
                    if (parseBillingAddress.billing.hasOwnProperty('pincode')) {
                        if (!validator.isValidValue(parseBillingAddress.billing.pincode)) {
                            return res.status(400).send({ status: false, message: "Please provide billing address's pincode" });
                        }
                    }

                }
            var billingStreet = address.billing.street
            var billingCity = address.billing.city
            var billingPincode = address.billing.pincode
            } else {
                return res.status(400).send({ status: false, message: "Billing address cannot be empty" });
            }
        }
      
        profileImageLink = await aws.uploadFile(files[0])
    
        let updatedDetails = await userModel.findOneAndUpdate(
            { _id: userIdFromParams }, 
            {$set: {
                fname: fname,
                lname: lname,
                email: email,
                profileImage: profileImageLink,
                phone: phone,
                password: hashedPassword,
                'address.shipping.street': shippingStreet,
                'address.shipping.city': shippingCity,
                'address.shipping.pincode': shippingPincode,
                'address.billing.street': billingStreet,
                'address.billing.city': billingCity,
                'address.billing.pincode': billingPincode
            }
        }, { new: true })

        res.status(200).send({
            status: true,
            msg: "user details updated successfully",
            data: updatedDetails,
        });
    }
    catch (error) {
        return res.status(500).json({ status: false, msg: error.message });
    }
}

module.exports = {
    createUser,
    userLogin,
    getUserDetail,
    updateUser
}