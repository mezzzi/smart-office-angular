const app = require('express')()
const customerUserService = require('../services/customer.user.service')
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// get customer users
exports.getCustomerUsers = (req, res, next) => {
    customerUserService.getCustomerUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add customer users
exports.addCustomerUser = (req, res, next) => {
    const _valid = !!req.body.name && !!req.body.password & !!req.body.phone
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
                customerUserService.addCustomerUser(req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })

    }
}
// remove a customer user
exports.removeCustomerUser = (req, res, next) => {
    customerUserService.removeCustomerUser(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// update a customer
exports.updateCustomerUser = (req, res, next) => {
    if (req.body.password) {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                customerUserService.updateCustomerUser(req.params.id, req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })
    } else {
        customerUserService.updateCustomerUser(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }
}
// get customers by name
exports.getCustomerUserByName = (req, res, next) => {
    customerUserService.getCustomerUsersByName(req.params.name)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// get customer by id
exports.getCustomerById = (req, res, next) => {
    customerUserService.getCustomerById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// get customers by phone
exports.getCustomerUsersByPhone = (req, res, next) => {
    customerUserService.getCustomerUsersByPhone(req.params.phone)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// get corporate customers
exports.getCorporateCustomerUsers = (req, res, next) => {
    customerUserService.getCorporateCustomerUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add multiple customer users
exports.addMultipleCustomerUsers = (req, res, next) => {
    const succeeded = []
    const failed = []
    // validate each customer object
    for (customer of req.body) {
        const _valid = !!customer.name && !!customer.password & !!customer.phone
        if (!_valid) {
            failed.push(customer)
        } else {
            const salt = bcrypt.genSaltSync(config.salt_rounds)
            const hash = bcrypt.hashSync(customer.password.trim(), salt)
            customer.password = hash
            succeeded.push(customer)
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
        customerUserService.addMultipleCustomerUsers(succeeded)
            .then(data => {
                console.log(data);
                res.status(data.status).json(data)
            })
            .catch(err => {
                console.log(err)
                res.status(err.status).json(err)
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