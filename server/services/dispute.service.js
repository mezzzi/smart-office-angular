const mongoose = require('mongoose')
const Dispute = require('../models/dispute.model')
const config = require('../config')
const customerService = require('./customer.user.service')
const dispatcherService = require('./dispatcher.user.service')
const driverService = require('./driver.user.service')

// submit dispute
exports.addDispute = dispute => (
	new Promise((succeed, fail) => {
		customerService.getCustomerById(dispute.customer._id)
		.then(data => dispatcherService.getDipatcherById(dispute.dispatcher._id))
		.then(data => driverService.getDriverUserById(dispute.driver._id))
		.then(data => {
			dispute = new Dispute(dispute)
			dispute.save(err => {
				if (err) {
					fail({
						error: err,
						success: false,
						status: 500
					})
				} else {
					succeed({
						data: dispute,
						status: 201,
						success: true
					})
				}
			})
		})
		.catch(err => {
			fail({
				error: err.error,
				success: false,
				status: err.status
			})
		})
	}))

// get disputes
exports.getDisputes = () => (
	new Promise((succeed, fail) => {
		Dispute.find({}, (err, disputes) => {
			if (err) {
				fail({
					error: err,
					success: false,
					status: 500
				})
			} else {
				succeed({
					data: disputes,
					status: 200,
					success: true
				})
			}	
		})
	}))
