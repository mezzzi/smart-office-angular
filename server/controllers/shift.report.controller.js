const app = require('express')()
const shiftReportService = require('../services/shift.report.service')

// add shift report
exports.addShiftReport = (req, res, next) => {
	const valid = !!req.body.accepted_trips && !!req.body.bookings
	if (valid) {
		req.body.filled_by = req.decoded
		shiftReportService.addShiftReport(req.body)
		.then(data => res.status(data.status).json(data))
		.catch(err => res.status(err.status).json(err))
	}
}
// get shift reports
exports.getShiftReports = (req, res, next) => {
	shiftReportService.getShiftReports()
	.then(data => res.status(data.status).json(data))
	.catch(err => res.status(err.status).json(err))
}