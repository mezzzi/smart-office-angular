const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ShiftReport = new Schema({
	accepted_trips: {
		type: Array,
		required: true
	},
	bookings: {
		type: Array
	},
	time_added: {
		type: Date,
		default: Date.now()
	},
	filled_by: {
		type: Object,
		required: true
	},
	remark: {
		type: String
	}
})

module.exports = mongoose.model('ShiftReport', ShiftReport)