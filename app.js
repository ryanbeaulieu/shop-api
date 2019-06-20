const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productsRoute = require('./api/routes/products');
const ordersRoute = require('./api/routes/orders');
const userRoute = require('./api/routes/users');

mongoose.connect('mongodb://localhost/shop',{ useNewUrlParser: true })

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');

    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-=Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.use('/products', productsRoute);
app.use('/orders', ordersRoute);
app.use('/users', userRoute);

app.use((req,res,next) => {
    const error = new Error('Not Found');
    
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: error.message
    })
})

module.exports = app;