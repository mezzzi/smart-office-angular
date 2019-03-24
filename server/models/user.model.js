const mongoose = require('mongoose')
const Validator = require('validator')
const Schema = mongoose.Schema
const config = require('../config')

var UserSchema = new Schema({
    level: {
        type: String,
        required: true,
        validate: {
            validator: v => {
                return Object.keys(config.levels).indexOf(v) > -1
            },
            message: "invalid level type {VALUE}"
        }
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    avatar_url: {
        type: String,
        default: '/uploads/anonymous.png'
    },
    password: {
        // required: true,
        type: String
    },
    phone: {
        type: String
    },
    working_hours: {
        start: {
            type: String
        },
        end: {
            type: String
        }
    },
    attached_corporate: {
        type: Object
    },
    card_number: {
        type: String
    },
    home_phone_number: {
        type: String,
        minlength: 10,
        maxlength: 10
    },
    work_phone_number: {
        type: String,
        minlength: 10,
        maxlength: 10
    },
    address: {
        home: {
            type: Object
        },
        work: {
            type: Object
        }
    },
    history: {
        type: Array
    },
    account_status: {
        type: String,
        required: true,
        default: "active"
    },
    driver_status: {
        default: "available",
        type: String,
    },
    plate_number:{
        type: String,
        maxlength:11
    },
    time_added: {
        type: Date,
        default: Date.now()
    },
    driver_rating: {
        type: String
    }
})

module.exports = mongoose.model('User', UserSchema)