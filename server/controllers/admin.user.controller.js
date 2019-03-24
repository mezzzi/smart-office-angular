const app = require('express')()
const adminUserService = require('../services/admin.user.service')
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// get admin users
exports.getAdminUsers = (req, res, next) => {
    adminUserService.getAdminUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add an admin user
exports.addAdminUser = (req, res, next) => {
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
                adminUserService.addAdminUser(req.body)
                    .then(data => res.status(data.status).json(data))
                    .catch(err => res.status(err.status).json(err))
            })
        })

    }
}