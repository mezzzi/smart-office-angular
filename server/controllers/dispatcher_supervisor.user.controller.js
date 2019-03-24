const mongoose = require('mongoose')
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const app = require('express')()

const dispatcherSupervisorService = require('../services/dispatcher_supervisor.user.service')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// get all dispatcher supervisors
exports.getDispatcherSupervisors = (req, res, next) => {
	dispatcherSupervisorService.getDispatcherSupervisors()
	.then(data => res.status(data.status).json(data))
	.catch(err => res.status(err.status).json(err))
}

// add a dispatcher supervisor user
exports.addDispatcherSueprvisor = (req, res, next) => {
	req.body.level = config.levels.dispatcher_supervisor
	const valid = !!req.body.name && !!req.body.phone && !!req.body.password
	if (valid) {
		bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                dispatcherSupervisorService.addDispatcherSupervisor(req.body)
				.then(data => res.status(data.status).json(data))
				.catch(err => res.status(err.status).json(err))
            })
        })
		
	} else {
		res.status(400).json({
			status: 400,
			msg: 'incomplete request body',
			success: false
		})
	}
}

// update a dispatcher supervisor user
exports.updateDispatcherSupervisor = (req, res, next) => {
	if (req.body.password) {
		bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                console.log(req.params.id)
                dispatcherSupervisorService.updateDispatcherSupervisor(req.params.id, req.body)
				.then(data => res.status(data.status).json(data))
				.catch(err => res.status(err.status).json(err))
            })
        })
	}
}

// get dispatcher supervisor users by name
exports.getDispatcherSupervisorsByName = (req, res, next) => {
	dispatcherSupervisorService.getDispatcherSupervisorsByName(req.params.name)
	.then(data => res.status(data.status).json(data))
	.catch(err => res.status(err.status).json(err))
}

// get dispatcher suprevisor users by phone
exports.getDispatcherSupervisorsByPhone = (req, res, next) => {
	dispatcherSupervisorService.getDispatcherSupervisorsByPhone(req.params.phone)
	.then(data => res.status(data.status).json(data))
	.catch(err => res.status(err.status).json(err))
}

// get dispatcher suprevisor users by id
exports.getDispatcherSupervisorById = (req, res, next) => {
	dispatcherSupervisorService.getDispatcherSupervisorById(req.params.id)
	.then(data => res.status(data.status).json(data))
	.catch(err => res.status(err.status).json(err))
}

// delete dispatcher supervisor 
exports.removeDispatcherSupervisor = (req, res, next) => {
	dispatcherSupervisorService.removeDispatcherSupervisor(req.params.id)
	.then(data => res.status(data.status).json(data))
	.catch(err => res.status(err.status).json(err))
}

