const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    category: {
      type: String,
      required: true  
    },
    price: {
        type: Number,
        required: true 
    },
    salePrice: {
        type: Number,
        default: null
    },
    productImages: {
        type: [String]
    },
    active: {
        type: Boolean,
        default: false
    },
    outOfStock: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Product', productSchema);