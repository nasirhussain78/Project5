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
        const queryData = req.query
        let filter = { isDeleted:false }

        const { size, productName, priceGreaterThan, priceLessThan, sortPrice } = queryData;

        if(validator.isValidValue(size)){
            filter['availableSizes'] = size
        }

        if(validator.isValidValue(productName)){
            filter['title'] = {}
            filter['title']['$regex'] = productName
            filter['title']['$options'] = 'i'
        }

        if(validator.isValidValue(priceGreaterThan)){
            if (!(!isNaN(Number(priceGreaterThan)))) {
                return res.status(400).send({status:false, message: 'price should be a valid number' })
            }
            if (priceGreaterThan < 0) {
                return res.status(400).send({status:false, message: 'price can not be less than zero' })
            }
            if (!filter.hasOwnProperty('price'))
                filter['price'] = {}
                filter['price']['$gte'] = Number(priceGreaterThan)
        }

        if(validator.isValidValue(priceLessThan)){
            if (!(!isNaN(Number(priceLessThan)))) {
                return res.status(400).send({status:false, message: 'price should be a valid number' })
            }
            if (priceLessThan <= 0) {
                return res.status(400).send({status:false, message: 'price can not be zero or less than zero' })
            }
            if (!filter.hasOwnProperty('price'))
                filter['price'] = {}
                filter['price']['$lte'] = Number(priceLessThan)
        }

        if (validator.isValidValue(sortPrice)) {

            if (!((priceSort == 1) || (priceSort == -1))) {
                return res.status(400).send({ status: false, message: 'priceSort should be 1 or -1 '})
            }

            const products = await productModel.find(filter).sort({ price: priceSort })

            if (products.length === 0) {
                return res.status(404).send({ productStatus: false, message: 'No Product found' })
            }

            return res.status(200).send({ status: true, message: 'Product list', data: products })
        }

        const products = await productModel.find(filter)

        if (products.length === 0) {
            return res.status(404).send({ productStatus: false, message: 'No Product found' })
        }

        return res.status(200).send({ status: true, message: 'Product list', data: products })
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

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, msg: "product is deleted" });
        }

        return res.status(200).send({ status: true, message: 'Product found successfully', data: findProduct })
    }
    catch(error){
        return res.status(500).json({ status: false, message: error.message });
    }
}

//----------------------- update product-------------------------------------------------------------------------------------------------------

const updateProduct = async function (req,res){
    try {
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }
       
        const findProduct = await productModel.findById(productId)

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product does not exists' })
        }

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, msg: "product is deleted" });
        }

        if (!validator.isValidDetails(req.body)) {
            return res.status(400).send({ status: false, msg: "please provide details to update." });
        }

        let { title, description, price, currencyId, 
            isFreeShipping, productImage, style, availableSizes, installments } = req.body

        const dataToUpdate = {}

        if(title){
            if (!validator.isValidValue(title)) {
                return res.status(400).send({ status: false, messege: "title can not be an empty string." })
            }
            const isDuplicateTitle = await productModel.findOne({title});
            if (isDuplicateTitle) {
                return res.status(400).send({status: false,msg: "title already exists.",})
            }

            dataToUpdate['title'] = title
        }
        
        if(description){
            if (!validator.isValidValue(description)) {
                return res.status(400).send({ status: false, msg: "description can not be an empty string." });
            }
            
            dataToUpdate['description'] = description
        }

        if(price){
            if (!validator.isValidValue(price)) {
                return res.status(400).send({ status: false, messege: "price can not be empty." })
            }

            if (!(!isNaN(Number(price)))) {
                return res.status(400).send({ status: false, message: 'Price should be a valid number' })
            }

            if (price <= 0) {
                return res.status(400).send({ status: false, message: 'Price can not be zero or less than zero.' })
            }

            dataToUpdate['price'] = price
        }

        if(currencyId){
            if (!validator.isValidValue(currencyId)) {
                return res.status(400).send({ status: false, messege: "curencyId can not be empty." })
            }

            if (!(currencyId == "INR")) {
                return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
            }

            dataToUpdate['currencyId'] = currencyId
        }

        if(isFreeShipping){
            if (!validator.isValidValue(isFreeShipping)) {
                return res.status(400).send({ status: false, messege: "isFreeShipping can not be empty." })
            }

            if (!((isFreeShipping === true) || (isFreeShipping === false))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
            }
    
            dataToUpdate['isFreeShipping'] = isFreeShipping
        }

        productImage = req.files;
        if(productImage){
            if ((productImage && productImage.length > 0)) {
            let imageLink = await aws.uploadFile(productImage[0]);
            dataToUpdate['productImage'] = imageLink
            console.log(dataToUpdate)
        }
        }

        if(style){
            dataToUpdate['style'] = style
        }
        
        if(availableSizes){
            if (!validator.isValidSize(availableSizes)) {
                return res.status(400).send({ status: false, message: "Please provide valid size." }); //Enum is mandory
              }
            
              dataToUpdate['availableSizes'] = availableSizes
        }

        if(installments){
            if (!validator.isValidValue(installments)) {
                return res.status(400).send({ status: false, messege: "installments can not be empty." })
            }

            if (!(!isNaN(Number(installments)))) {
                return res.status(400).send({ status: false, message: 'installments should be a valid number' })
            }

            dataToUpdate['installments'] = installments
        }

        const updatedProduct = await productModel.findOneAndUpdate( { _id: productId }, dataToUpdate , { new: true, upsert: true } );

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