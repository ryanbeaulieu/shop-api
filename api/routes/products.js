const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const auth = require('../auth/auth')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    acceptedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];

    if(acceptedTypes[file.mimetype] != -1) {
        cb(null, true);
    }else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb limit
    },
    fileFilter: fileFilter
});

const Product = require('../models/product.model');

router.get('/', (req,res,next) => {
   Product.find()
    .exec()
    .then(results => {
        const response = {
            count: results.length,
            products: results.map(doc => {
                return {
                    _id: doc._id,
                    name: doc.name,
                    category: doc.category,
                    price: doc.price,
                    salePrice: doc.salePrice,
                    productImages: doc.productImages.map(product => {
                        return `http://localhost:3000/uploads/${product}`
                    }),
                    active: doc.active,
                    outOfStock: doc.outOfStock,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/products/${doc._id}`
                    }
                }
            })
        }

        res.status(200).json(response)
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});

router.post('/', auth, upload.array('productImages'),(req,res,next) => {
    console.log(req.files)
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        salePrice: req.body.salePrice,
        productImages: req.files.map(file => {
            return file.filename
        }),
        active: req.body.active,
        outOfStock: req.body.outOfStock
    });

    product.save()
    .then(result => {
        res.status(200).json({
            createdProduct: {
                _id: result._id,
                name: result.name,
                category: result.category,
                price: result.price,
                salePrice: result.salePrice,
                productImages: result.productImages,
                active: result.active,
                outOfStock: result.outOfStock,
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/products/${result._id}`
                }
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });

   
});

router.get('/:productId', (req,res,next) => {
    const id = req.params.productId;

    Product.findById(id)
        .select('_id name price productImage')
        .exec()
        .then(doc => {
            if(doc) res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: "Get all products",
                    url: 'http://localhost:3000/products'
                }
            });
            else res.status(404).json({
                message: "Invalid entry"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.patch('/:productId', auth, (req,res,next) => {
    const id = req.params.productId;
    let updateOps = {};

    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    Product.updateOne({ _id: id }, {$set: updateOps }).exec()
    .then(result => {
        res.status(200).json({
            message: "Product has been successfully updated",
            request: {
                type: 'GET',
                url: `http://localhost:3000/products/${id}`
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.delete('/:productId', auth, (req,res,next) => {
    const id = req.params.productId;
    
    Product.deleteOne({_id: id})
    .then(result => {
        res.status(200).json({
            message: 'Product has been successfully deleted'
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;