const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

router.post('/signup', (req,res,next) => {

    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user && user.length > 0) {
                return res.status(409).json({
                    message: "Email already exists"
                })
            }else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err) {
                        return res.status(500).json({
                            error: err
                        })
                    }
            
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
            
                    user.save()
                        .then(result => {
                            res.status(200).json({
                                message: 'User created'
                            })
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            })
                        })
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.post('/login', (req, res, next) => {
    User.findOne({email: req.body.email}).exec()
        .then(user => {
            if(user.length < 1) {
                return res.status(401).json({
                    message: "Authorization failed."
                })
            }

            bcrypt.compare(req.body.password, user.password, (err, response) => {
                if(err || response !== true) {
                    return res.status(401).json({
                        message: "Authorization failed."
                    })
                }

                if(response) {
                    const token = jwt.sign(
                        {
                            email: user.email,
                            userId: user._id
                        }, 
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        })

                    return res.status(200).json({
                        message: 'Auth Successful',
                        token: token
                    })
                }


            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.delete("/:userId", (req, res, next) => {
    User.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User has been deleted."
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})



module.exports = router;