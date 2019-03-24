const express = require('express')
const app = express()
const config = require('../config')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set('secret', config.secret)
let loginRoute = new express.Router()
// login route
loginRoute.post('/', (req, res, next) => {
    let _valid = !!req.body.email && !!req.body.password
    if (_valid) {
        User.findOne({
            account_status: "active",
            email: req.body.email
        }, (err, user) => {
            if (err) {
                res.status(500).json({
                    status: 500,
                    error: err
                })
            } else if (user) {
                let password = {
                    hash: user.password,
                    plain: req.body.password
                }
                bcrypt.compare(password.plain, password.hash, (err, response) => {
                    if (err) {
                        res.status(501).json({
                            status: 501,
                            success: false,
                            msg: "Internal server error"
                        })
                    } else if (response) {
                        const token = jwt.sign({
                            "_id": user._id,
                            "avatar_url": user.avatar_url,
                            "name": user.name,
                            "email": user.email,
                            "level": user.level,
                            "working_hours": user.working_hours,
                            "phone": user.phone,
                            "card_number": user.card_number
                        }, app.get('secret'), {
                            expiresIn: 8640000
                        })
                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: user,
                            msg: "Authentication success, token created",
                            token: token
                        })
                    } else {
                        res.status(403).json({
                            status: 403,
                            success: false,
                            msg: "Authentication failed..."
                        })
                    }
                })
            } else {
                res.status(403).json({
                    status: 403,
                    success: false,
                    message: "Authentication failed"
                })
            }
        })
    } else {
        res.status(401).json({
            status: 401,
            success: false,
            msg: "incomplete request body"
        })
    }

})
module.exports = loginRoute