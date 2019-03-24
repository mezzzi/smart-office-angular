const app = require('express')()
const dataAnalystUserService = require('../services/data.analyst.user.service')
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// get dataAnalyst users
exports.getDataAnalystUsers = (req, res, next) => {
    dataAnalystUserService.getDataAnalystUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add an dataAnalyst user
exports.addDataAnalystUser = (req, res, next) => {
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
                dataAnalystUserService.addDataAnalystUser(req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })

    }
}
// update a data analyst user
exports.updateDataAnalystUser = (req, res, next) => {
    if (req.body.password) {
        bcrypt.genSalt(config.salt_rounds, (err, salt) => {
            bcrypt.hash(req.body.password.trim(), salt, (err, hash) => {
                req.body.password = hash
                dataAnalystUserService.updateDataAnalystUser(req.params.id, req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })
    } else {
        dataAnalystUserService.updateDataAnalystUser(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }
}
// get data analyst by id
exports.getDataAnalystById = (req, res, next) => {
    dataAnalystUserService.getDataAnalystById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}