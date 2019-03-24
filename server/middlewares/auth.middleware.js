const jwt = require('jsonwebtoken')
const app = require('express')()
const config = require('../config')

app.set('secret', config.secret)

exports.authMiddleware = (req, res, next) => {
    let _valid = true
    if (req.headers['authorization']) { _valid = req.headers['authorization'].indexOf("Bearer ") !== -1 }
    if (!_valid) {
        res.status(403).json({
            status: 403,
            message: "Access Denied"
        })
    }
    const token = !!req.headers['authorization'] ? req.headers['authorization'].split('Bearer ')[1].trim() : req.body.token
    if (token) {
        jwt.verify(token, app.get('secret'), (err, decoded) => {
            if (err) {
            	console.log('\n\n\n')
            	console.error(err)
            	console.log('\n\n\n')
                return res.status(403).json({
                    status: 403,
                    message: "Access Denied"
                })
            } else {
                req.decoded = decoded
                return next()
            }
        })
    } else {
        return res.status(403).json({
            status: 403,
            message: "Access Denied"
        })
    }
}