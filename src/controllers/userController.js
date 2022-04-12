const validator = require('../validations/validator')
const linkAws = require('../aws/aws')
const userModel = require('../models/userModel')


const userCreate = async function (req, res) {
    try {
        let data = req.body
        let files = req.files

        if (!validator.isValidDetails(data)) {
            return res.status(400).send({ status: false, msg: "please provide user data" })
        }

        const { fname, lname, email, password, phone, address, profileImage } = data

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
        let uploadedFileURL = await linkAws.uploadFile(files[0])

        if (!validator.isValidValue(password)) {
            return res.status(400).send({ status: false, messege: "please provide password" })
        }

        const encryptedPassword = await bcrypt.hash(password, 4)

        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "Password must be of 8-15 letters." })
        }

        if (!validator.isValidValue(phone)) {
            return res.status(400).send({ status: false, messege: "please provide password" })
        }

        let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
        if (!isValidPhone) {
            return res.status(400).send({ status: false, msg: "please provide valid phone" })
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
        }

        const finalDetails = {
            fname,
            lname, 
            email, 
            password : encryptedPassword, 
            phone, 
            address, 
            profileImage : uploadedFileURL
        }

        let savedData = await userModel.create(finalDetails)
        return res.status(201).send({ status: true, data: savedData });
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}



const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId
        const dataToUpdate = req.body
        const files = req.files

        const IsValidUserId = await userModel.findById(userId)

        if (!IsValidUserId) {
            return res.status(404).send({ status: false, msg: "user not found." });
        }

        if (!validator.isValidDetails(dataToUpdate)) {
            res.status(400).send({
                status: false,
                msg: "Please provide the user details to update",
            });
        }

        const { fname, lname, email, profileImage, phone, password, address } = dataToUpdate;

        if (!validator.isValidString(fname)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide first name of the user." }); //Category is mandory
        }

        if (!validator.isValidString(lname)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide last name of the user." }); //Category is mandory
        }

        if (!validator.isValidString(email)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide email of the user." }); //Category is mandory
        }

        const isDuplicateemail = await userModel.findOne({ email: email });

        if (isDuplicateemail) {
            return res.status(400).send({
                status: false,
                msg: "User with provided email is already present.",
            })
        }

        if (!validator.isValidString(profileImage)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide profile image of the user." }); //Category is mandory
        }

        if (!validator.isValidString(phone)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide phone number of the user." }); //Category is mandory
        }

        const isDuplicatePhone = await userModel.findOne({ phone: phone });

        if (isDuplicatePhone) {
            return res.status(400).send({
                status: false,
                msg: "User with provided phone no. is already present.",
            })
        }

        if (!validator.isValidString(password)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide password." }); //Category is mandory
        }

        if (!validator.isValidString(email)) {
            return res
                .status(400)
                .send({ status: false, msg: "Please provide email of the user." }); //Category is mandory
        }

        const updatedDetails = await userModel.findOneAndUpdate(
            { _id: userId }, //Find the bookId and update these title, excerpt & ISBN.
            {
                fname: fname,
                laname: lname,
                email: email,
                phone: phone
            },
            { new: true, upsert: true }
        );

        res.status(200).send({
            status: true,
            msg: "user details updated successfully",
            data: updatedDetails,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, msg: error.message });
    }
}
module.exports = {
    updateUser,
    userCreate
}