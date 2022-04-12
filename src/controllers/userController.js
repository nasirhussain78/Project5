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
        const userId = req.params.userId
        const dataToUpdate = req.body
        const files = req.files

        const IsValidUserId = await userModel.findById(userId)

        if (!IsValidUserId) {
            return res.status(404).send({ status: false, msg: "user not found." });
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
    userLogin,
    getUserDetail,
    updateUser
}