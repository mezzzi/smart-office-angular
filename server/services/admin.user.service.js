const User = require('../models/user.model')
const config = require('../config')

// get admin users
exports.getAdminUsers = () => {
    return new Promise((succeed, fail) => {  
        User.find({
            account_status: "active",
            level: config.levels.admin
        }, (err, users) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (users) {
                succeed({
                    status: 200,
                    data: users,
                    success: true
                })
            }
        })
    })
}

// add an admin user
exports.addAdminUser = (user) => {
    return new Promise((succeed, fail) => {
        user.level = config.levels.admin
        user = new User(user)
        user.save(err => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 201,
                    data: user,
                    success: true
                })
            }
        })
    })
}