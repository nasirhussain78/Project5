const validator = require('../validations/validator')
const aws = require('../aws/aws')
const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')


const createUser = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let { fname, lname, email, password, phone, address } = data

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt)

        let profileImage = await aws.uploadFile(files[0])

        const finalDetails = { fname, lname, email, profileImage, password, phone, address }

        let savedData = await userModel.create(finalDetails)
        return res.status(201).send({ status: true,msg:"user created successfully", data: savedData });
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error })
    }
}

//**********************************  update user  ******************************************************************************************** */

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
        return res.status(500).json({ status: false, msg: error.message });
    }
}
module.exports = {
    createUser,
    updateUser
}