const app = require('express')()
const supervisorUserService = require('../services/supervisor.user.service')
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
// get supervisor users
exports.getSupervisorUsers = (req, res, next) => {
    supervisorUserService.getSupervisorUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add a supervisor
exports.addSupervisorUser = (req, res, next) => {
    const _valid = !!req.body.name && !!req.body.email && !!req.body.password & !!req.body.phone
    if (!_valid) {
        res.status(400).json({
            status: 400,
            msg: "incomplete request body",
            success: false
        })
    } else {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                supervisorUserService.addSupervisorUser(req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })

    }
}
// remove a suprevisor
exports.removeSupervisor = (req, res, next) => {
    supervisorUserService.removeSupervisorUser(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// update a supervisor
exports.updateSupervisor = (req, res, next) => {
    if (req.body.password) {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                supervisorUserService.updateSupervisorUser(req.params.id, req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })
    } else {
        supervisorUserService.updateSupervisorUser(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }

}
// get supervisors by name
exports.getSupervisorByName = (req, res, next) => {
    supervisorUserService.getSupervisorsByName(req.params.name)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// get supervisor by id
exports.getSupervisorById = (req, res, next) => {
    supervisorUserService.getSupervisorUserById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

// add multiple supervisor users
exports.addMultipleSupervisorUsers = (req, res, next) => {
    const succeeded = []
    const failed = []
    // validate each supervisor object
    for (supervisor of req.body) {
        const _valid = !!supervisor.name && !!supervisor.email && !!supervisor.password & !!supervisor.phone
        if (!_valid) {
            failed.push(supervisor)
        } else {
            const salt = bcrypt.genSaltSync(config.salt_rounds)
            const hash = bcrypt.hashSync(supervisor.password.trim(), salt)
            supervisor.password = hash
            succeeded.push(supervisor)
        }
    }
    if (failed.length > 0) {
        res.status(400).json({
            status: 400,
            msg: "incomplete request body",
            failed: failed,
            success: false
        })
    } else if (succeeded.length > 0) {
        supervisorUserService.addMultipleSupervisorUsers(succeeded)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else {
        res.status(400).json({
            status: 400,
            msg: "incomplete request body",
            success: false,
            succeeded: succeeded,
            failed: failed
        })
    }
}