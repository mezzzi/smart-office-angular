const app = require('express')()
const financeUserService = require('../services/finance.user.service')
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// get finance users
exports.getFinanceUsers = (req, res, next) => {
    financeUserService.getFinanceUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add an finance user
exports.addFinanceUser = (req, res, next) => {
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
                financeUserService.addFinanceUser(req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })

    }
}
// update a finance user
exports.updateFinanceUser = (req, res, next) => {
    if (req.body.password) {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                financeUserService.updateFinanceUser(req.params.id, req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })
    } else {
        financeUserService.updateFinanceUser(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }
}
// get finance by id
exports.getFinanceById = (req, res, next) => {
    financeUserService.getFinanceById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}