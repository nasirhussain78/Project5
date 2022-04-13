const productModel = require('../models/productModel')
const aws = require('../aws/aws')
const currencySymbol = require("currency-symbol-map")
const validator = require('../validations/validator')

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
        return res.status(201).send({ status: true, message: "new product created successfully", data: savedData });
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//----------------------- filter products------------------------------------------------------------------------

const filterProducts = async (req, res) => {
    try{
        const querryData = req.query
        let filter = { isDeleted:false }

        const { size, productName, priceGreaterThan, priceLessThan, sortPrice } = querryData;

        if(validator.isValidValue(size)){
            querryData['availableSizes'] = size
        }

        if(validator.isValidValue(productName)){
            querryData['title'] = {}
            querryData['title']['$regex'] = productName
            querryData['title']['$options'] = 'i'
        }

        if(validator.isValidValue(priceGreaterThan)){
            if (!(!isNaN(Number(priceGreaterThan)))) {
                return res.status(400).send({status:false, message: 'priceGreaterThan should be a valid number' })
            }
            if (priceGreaterThan <= 0) {
                return res.status(400).send({status:false, message: 'priceGreaterThan can not be zero or less than zero' })
            }
        }
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//----------------------- get product byId------------------------------------------------------------------------

const getProductById = async (req, res) => {
    try{
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findById(productId)

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, msg: "product is deleted" });
        }

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }

        return res.status(200).send({ status: true, message: 'Product found successfully', data: findProduct })
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//----------------------- update product------------------------------------------------------------------------

const updateProduct = async function (req,res){
    try {
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }
       
        const findProduct = await productModel.findById(productId)

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, msg: "product is deleted" });
        }

        if (!validator.isValidDetails(req.body)) {
            return res.status(400).send({ status: false, msg: "please provide details to update." });
        }

        // const { title } = req.body

        if(req.body.title){
            if (!validator.isValidValue(req.body.title)) {
                return res.status(400).send({ status: false, msg: "Please provide title of the product." });
            }
        }
        
        const updatedProduct = await productModel.findOneAndUpdate( { _id: productId }, {title : req.body.title}, { new: true, upsert: true } );

        res.status(200).send({
            status: true,
            msg: "product details updated successfully",
            data: updatedProduct,
        });
    }
    catch (error) {
        return res.status(500).json({ status: false, msg: error.message });
    }
}

//----------------------- delete product ------------------------------------------------------------------------

const deleteProduct = async (req, res) => {
    try{
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findById(productId);

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }
        if (findProduct.isDeleted == true){
            return res.status(400).send({status:false, message:"product already deleted."})
        }

        const deletedDetails = await productModel.findOneAndUpdate(
            { _id: productId },
            { $set: { isDeleted: true, deletedAt: new Date() } }, {new:true})

        return res.status(200).send({ status: true, message: 'Product deleted successfully.', data:deletedDetails })
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = { createProduct, getProductById, deleteProduct, filterProducts, updateProduct }