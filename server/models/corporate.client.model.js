const mongoose = require('mongoose')
const Validator = require('validator')
const Schema = mongoose.Schema
const config = require('../config')

var CorporateClient = new Schema({
    night_deal: {
        type: Number
    },
    day_deal: {
        type: Number
    },
    base_price: {
        type: Number
    },
    waiting_deal: {
        type: Number
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        minlength: 10,
        maxlength: 13
    },
    email: {
        type: String,
        validate: {
            validator: Validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    address: {
        type: "String"
    },
    card_number: {
        type: String
    },
    account_status: {
        type: String,
        default: "active"
    },
    time_added: {
        type: Date,
        default: Date.now()
    }
})
module.exports = mongoose.model("CorporateClient", CorporateClient)