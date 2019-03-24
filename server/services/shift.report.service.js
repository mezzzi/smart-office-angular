const mongoose = require('mongoose')
const ShiftReport = require('../models/shift.report.model')

// add shift report
exports.addShiftReport = report => (
	new Promise((succeed, fail) => {
		report = new ShiftReport(report)
		report.save(err => {
			if (err) {
				fail({
					status: 500,
					error: err,
					success: false
				})
			} else {
				succeed({
					status: 201,
					data: report,
					success: true
				})
			}
		})
	}))

// get shift reports
exports.getShiftReports = () => (
	new Promise((succeed, fail) => {
		ShiftReport.find({}, (err, reports) => {
			if (err) {
				fail({
					status: 500,
					error: err,
					success: false
				})
			} else {
				succeed({
					status: 200,
					data: reports,
					success: true
				})
			}
		})
	}))
