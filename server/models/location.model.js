const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Validator = require('validator')
const Schema = mongoose.Schema
const config = require('../config')

// var positionSchema = new Schema({
//     latitude: {
//         type: String,
//         required: true
//     },
//     longitude: {
//         type: String,
//         required: true
//     }
// },
// {
//     _id: true
// })
var LocationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        // required: true
    },
    position: {
        // type: mongoose.Schema.ObjectId,
        // ref: 'positionSchema',
        // unique: true,
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        }
    },
    location_status: {
        type: String,
        default: "active"
    },
    date_added: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Location", LocationSchema)