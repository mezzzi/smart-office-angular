const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

let TripSchema = new Schema({
	customer_rating: {
		type: String
	},
	driver_rating: {
		type: String
	},
    late: {
        type: Boolean,
        default: false
    },
    file_id: {
        type: String
    },
    customer: {
        type: Object,
        required: true
    },
    driver: {
        type: Object,
    },
    call_handler: {
        type: Object
    },
    starting_location: {
        type: Object
    },
    destination_location: {
        type: Object
    },
    price: {
        type: Number
    },
    call_time: {
        type: Date,
    },
    confirmation: {
        type: Date,
    },
    start: {
        type: Date,
    },
    et_fee: {
        type: Number,
    },
    cancellation_code: {
        type: String
    },
    km: {
        type: Number,
    },
    status: {
        type: String,
        default: 'active'
    },
    trip_status: {
        type: String,
        default: config.trip_status.PENDING
    },
    time_added: {
        type: Date,
        default: Date.now()
    },
    time_updated: {
        type: Date
    },
    time_cancelled: {
        type: Date
    },
    notified: {
        type: Boolean,
        default: false
    },
    is_scheduled: {
        type: Boolean,
        default: false
    },
    scheduled_date: {
        type: Date,
        default: Date.now()
    }, 
    last_notified: {
        type: Date,
    },
    received_by: {
        type: Object,
        default: null
    },
    accepted_by: {
        type: Object,
        default: null
    },
    started_by: {
        type: Object,
        default: null
    },
    completed_by: {
        type: Object,
        default: null
    },
    cancelled_by: {
        type: Object,
        default: null
    },
    collected: {
        type: Boolean,
        default: false
    },
    collected_by: {
        type: Object
    },
    night:{
        type: Boolean,
        default: false
    },
    credit:{
        type: Boolean,
        default: false
    },
    collected_time: {
        type: Date
    },
    arrival_time: {
        type: Date
    },
    customer_satisfaction: {
        type: String
    },
    dispute: {
        type: Object
    },
    is_corporate: {
        type: Boolean,
        default: false
    }
});
module.exports = mongoose.model('Trip', TripSchema);