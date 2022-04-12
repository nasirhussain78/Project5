const productModel = require('../models/productModel')
const aws = require('../aws/aws')
const currencySymbol = require("currency-symbol-map")

//----------------------- create product ------------------------------------------------------------------------

const createProduct = async (req, res) => {
    try{
        let { title,description,price,currencyId,currencyFormat,
            availableSizes,isFreeShipping,installments,style } = req.body
        let files = req.files

        currencyFormat = currencySymbol('INR')

        if (!(files && files.length > 0)) {
            return res.status(400).send({ status: false, message: "Please provide product image" })
        }
        let productImage = await aws.uploadFile(files[0])

        let productData = { title,description,price,currencyId,currencyFormat,
            availableSizes,isFreeShipping,productImage,installments,style }

        let savedData = await productModel.create(productData)
        return res.status(201).send({ status: true, msg: "new product created successfully", data: savedData });
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = { createProduct }