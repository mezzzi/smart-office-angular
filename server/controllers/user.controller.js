const userService = require('../services/user.service')
const express = require('express')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')
const config = require('../config')
const app = express()
app.use(express.static(__dirname + '/../uploads'))

// fetch all users
exports.getUsers = (req, res, next) => {
    userService.getUsers()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

// update user
exports.updateUser = (req, res, next) => {
    userService.updateUser(req.params.id, req.body)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

// fetch avatar
exports.fetchAvatar = (req, res, next) => {
    userService.getUserAvatarByUserId(req.params.id)
        .then(data => {
            let ext = path.parse(data.data).ext
            const map = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg'
            }
            fs.readFile(__dirname + '/..' + data.data, (err, file) => {
                if (err) {
                    res.status(500).json({
                        status: 500,
                        error: err,
                        success: false
                    })
                } else {
                    res.setHeader('Content-Type', map[ext] || 'text/plain')
                    res.end(file)
                }
            })
        })
        .catch(err => res.status(err.status).json(err))
}

// add multiple users
exports.addMultipleUsers = (req, res, next) => {
    const succeeded = []
    const failed = []
    // validate each user object
    for (user of req.body) {
        if (user.password) {
            const salt = bcrypt.genSaltSync(config.salt_rounds)
            const hash = bcrypt.hashSync(user.password.trim(), salt)
            user.password = hash
        }
        if (!!user.name && !!user.phone && !!user.plate_number && !!user.card_number && !!user.working_hours) {
            user.level = config.levels.driver
            succeeded.push(user)
            console.log('adding driver')
        } else if (!!user.name && !!user.email && !!user.password && !!user.phone && !!user.working_hours) {
            user.level = config.levels.dispatcher
            succeeded.push(user)
            console.log('adding dispatcher')
        } else if (!!user.name && !!user.phone && !!user.address && !!user.price_deal) {
            user.level = config.levels.corporate_client
            succeeded.push(user)
            console.log('adding corporate Client')
        } else if (!!user.name && !!user.email && !!user.password & !!user.phone) {
            user.level = config.levels.supervisor
            succeeded.push(user)
            console.log('adding supervisor')
        } else if (!!user.name && !!user.password & !!user.phone) {
            user.level = config.levels.customer
            succeeded.push(user)
            console.log('adding customer')
        } else {
            failed.push(user)
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
        userService.addMultipleUsers(succeeded)
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