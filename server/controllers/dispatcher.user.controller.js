const app = require('express')()
const dispatcherUserService = require('../services/dispatcher.user.service')
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
// get all active dispatcher users
exports.getDispatcherUsers = (req, res, next) => {
    dispatcherUserService.getDispatcherUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add a dispatcher user
exports.addDispatcherUser = (req, res, next) => {
    const _valid = !!req.body.name && !!req.body.email && !!req.body.password && !!req.body.phone && req.body.working_hours
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
                dispatcherUserService.addDispatcherUser(req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })

    }
}
// remove a suprevisor
exports.removeDispatcherUser = (req, res, next) => {
    dispatcherUserService.removeDispatcherUser(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// update a dispatcher user
exports.updateDispatcherUser = (req, res, next) => {
    if (req.body.password) {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                dispatcherUserService.updateDispatcherUser(req.params.id, req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })
    } else {
        dispatcherUserService.updateDispatcherUser(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }
}
// get dispatcher users by name
exports.getDispatcherUsersByName = (req, res, next) => {
    dispatcherUserService.getDispatcherUsersByName(req.params.name)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// set dispatcher schedule
exports.setDispatcherUserSchedule = (req, res, next) => {
    const _valid = !!req.body.working_hours
    if (_valid) {
        dispatcherUserService.setDispatcherUserSchedule(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else {
        res.status(400).json({
            status: 400,
            msg: "incomplete request body",
            success: false
        })
    }
}
// get dispatcher by id
exports.getDispatcherById = (req, res, next) => {
    dispatcherUserService.getDipatcherById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add multiple dispatcher users
exports.addMultipleDispatcherUsers = (req, res, next) => {
    const succeeded = []
    const failed = []
    // validate each dispatcher user object
    for (dispatcher of req.body) {
        const _valid = !!dispatcher.name && !!dispatcher.email && !!dispatcher.password && !!dispatcher.phone && dispatcher.working_hours
        if (!_valid) {
            failed.push(dispatcher)
        } else {
            const salt = bcrypt.genSaltSync(config.salt_rounds)
            const hash = bcrypt.hashSync(dispatcher.password.trim(), salt)
            dispatcher.password = hash
            succeeded.push(dispatcher)
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
        dispatcherUserService.addMultipleDispatcherUsers(succeeded)
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