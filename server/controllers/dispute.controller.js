const disputeService = require('../services/dispute.service')
const app = require('express')()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: true
}))

// submit dispute
exports.addDispute = (req, res, next) => {
	const valid = !!req.body.body && !!req.body.customer && !!req.body.driver &&
					!! req.body.dispatcher
	if (valid) {
		req.body.submitted_by = req.decoded? req.decoded: req.body.submitted_by? req.body.submitted_by: null
		disputeService.addDispute(req.body)
		.then(data => res.status(data.status).json(data))
		.catch(err => res.status(err.status).json(err))
	} else {
		res.status(400).json({
			status: 400,
			msg: 'Incomplete request body',
			success: false
		})
	}
}

// get disputes
exports.getDisputes = (req, res, next) => {
	disputeService.getDisputes()
	.then(data => res.status(data.status).json(data))
	.catch(err => res.status(err.status).json(err))
}