const mongoose = require('mongoose')
const Schema = mongoose.Schema

let DisputeSchema = new Schema({
	body: {
		type: String,
		required: true
	},
	customer: {
		type: Object,
		required: true
	},
	driver: {
		type: Object,
		required: true
	},
	dispatcher: {
		type: Object
	},
	submitted_by: {
		type: Object,
		required: true
	},
	added_time: {
		type: Date,
		required: true,
		default: Date.now()
	},
	fault_by: {
		type: Object,
		required: true
	},
	time_added: {
		type: Date,
		default: Date.now()
	}
})
module.exports = mongoose.model('Dispute', DisputeSchema)