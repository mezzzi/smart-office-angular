const User = require('../models/user.model')
const config = require('../config')
const mongoose = require('mongoose')

// get finance users
exports.getFinanceUsers = () => {
    return new Promise((succeed, fail) => {  
        User.find({
            account_status: "active",
            level: config.levels.finance
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

// add an finance user
exports.addFinanceUser = (user) => {
    return new Promise((succeed, fail) => {
        user.level = config.levels.finance
        user.phone = user.phone.replace('-', '')        
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
// update a finance user
exports.updateFinanceUser = (id, user) => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "User not found"
            })
        } else {
            User.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    account_status: "active",
                    level: config.levels.finance
                }, {
                    $set: { ...user
                    }
                }, {
                    new: true
                },
                (err, user) => {
                    if (err) {
                        fail({
                            status: 500,
                            error: err,
                            success: false
                        })
                    } else if (user) {
                        succeed({
                            status: 201,
                            data: user,
                            success: true
                        })
                    } else {
                        fail({
                            status: 404,
                            success: false,
                            msg: "User not found"
                        })
                    }
                })
        }

    })
}
// get finance details by id
exports.getFinanceById = id => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "User not found"
            })
        } else {
            User.findOne({
                _id: mongoose.Types.ObjectId(id),
                account_status: 'active',
                level: config.levels.finance
            }, (err, user) => {
                if (err) {
                    fail({
                        status: 500,
                        success: false,
                        error: err
                    })
                } else {
                    succeed({
                        status: 200,
                        data: user,
                        success: true
                    })
                }
            })
        }
    })
}