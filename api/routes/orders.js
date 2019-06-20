const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../auth/auth');

const Order = require('../models/order.model');

router.get('/', auth, (req,res,next) => {
    Order
        .find({})
        .select('_id productId quantity')
        .exec()
        .then(results => {
            res.status(200).json({
                count: results.length,
                orders: results.map(result => {
                    return {
                        _id: result._id,
                        productId: result.productId,
                        quantity: result.quantity,
                        request: {
                            type: "GET",
                            url: `http://localhost:3000/orders/${result._id}`
                        }
                    }
                })
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post('/', auth, (req,res,next) => {
    const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity
    });

    order
        .save()
        .then(result => {
            res.status(201).json({
                message: "Order stored",
                createdOrder: {
                    _id: result._id,
                    productId: result.productId,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.get('/:orderId', auth, (req,res,next) => {
    const id = req.params.orderId;

    Order.findById(id)
    .select('_id productId quantity')
    .exec()
    .then(result => {
        res.status(200).json({
            order: result,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

router.delete('/:orderId', (req,res,next) => {
    Order.remove({_id: req.params.orderId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Order deleted"
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router;