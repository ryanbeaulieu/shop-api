const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
   email: {
       type: String,
       required: true,
       unique: true,
       match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
   },
   password: {
       type: String,
       required: true
   },
   name: {
       type: String,
       required: true
   },
   roles: {
       type: [String],
       default: ["client"]
   }
})

module.exports = mongoose.model('User', userSchema);