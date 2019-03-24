const app = require('express')()
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const driverUserService = require('../services/driver.user.service')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

//get all driver users
exports.getDriverUsers = (req, res, next) => {
    driverUserService.getDriverUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

//get driver by name
exports.getDriverByName = (req, res, next) => {
    driverUserService.getDriverUserByName(req.params.name)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add new user
exports.addDriverUser = (req, res, next) => {
    const _valid = !!req.body.name && !!req.body.phone && 
    !!req.body.plate_number
    if (!_valid) {
        res.status(400).json({
            status: 400,
            msg: 'incomplete request body, some fields missing',
            success: false
        })
    } else {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                driverUserService.addDriverUser(req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })
    }
}

// remove user by name
exports.removeUserById = (req, res, next) => {
    driverUserService.removeUserById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// update user by ID
exports.updateUserById = (req, res, next) => {
    console.log(req.params.id);
    if (req.body.password) {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                req.body.password = hash
                driverUserService.updateUserById(req.params.id, req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })
    } else {
        driverUserService.updateUserById(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }
}
// get driver user by id
exports.getDriverUserById = (req, res, next) => {
    driverUserService.getDriverUserById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add multiple driver users
exports.addMultipleDriverUsers = (req, res, next) => {
    const succeeded = []
    const failed = []
    // validate each driver object
    for (driver of req.body) {
        const _valid = !!driver.name && !!driver.phone && !!driver.plate_number
        if (!_valid) {
            failed.push(driver)
        } else {
            const salt = bcrypt.genSaltSync(config.salt_rounds)
            const hash = bcrypt.hashSync(driver.password.trim(), salt)
            driver.password = hash
            succeeded.push(driver)
        }
    }
    if (succeeded.length > 0) {
        driverUserService.addMultipleDriverUsers(succeeded)
            .then(data => {
                res.status(data.status).json(data)
            })
            .catch(err => {
                console.log(err)
                res.status(err.status).json(err)
            })
    } else if (failed.length > 0) {
        res.status(400).json({
            status: 400,
            msg: "incomplete request body",
            failed: failed,
            success: false
        })
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


// get drivers by phone
exports.getDriverUsersByPhone = (req, res, next) => {
    driverUserService.getDriverUsersByPhone(req.params.phone)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

exports.getActiveDrivers = (req, res, next) => {
    driverUserService.getActiveDrivers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}