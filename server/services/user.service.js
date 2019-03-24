const User = require('../models/user.model')
const mongoose = require('mongoose')
// fetch all users
exports.getUsers = () => {
    return new Promise((succeed, fail) => {
        User.find({}, (err, users) => {
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

// update user
exports.updateUser = (id, user) => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "invalid id"
            })
        } else {
            User.findOneAndUpdate({
                _id: mongoose.Types.ObjectId(id)
            }, {
                    $set: {
                        ...user
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
                            status: 200,
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
// get user by id
exports.getUserAvatarByUserId = id => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "Trip not found"
            })
        } else {
            User.findOne({
                _id: mongoose.Types.ObjectId(id),
                account_status: 'active',
                avatar_url: {
                    $ne: null
                }
            }, (err, user) => {
                if (err) {
                    fail({
                        status: 500,
                        error: err,
                        success: false
                    })
                } else {
                    if (user) {
                        succeed({
                            status: 200,
                            success: true,
                            data: user.avatar_url
                        })
                    } else {
                        fail({
                            status: 404,
                            msg: "no user found; at least with an avatar",
                            success: false
                        })
                    }
                }
            })
        }
    })
}

// add multiple users
exports.addMultipleUsers = (users) => {
    let failed = []
    let succeeded = []
    async function saveCustomer(user) {
        let response = {
            succeeded: true,
            error: null,
            user: user
        }
        user = new User(user)
        await user.save(err => {
            if (err) {
                response.succeeded = false
                response.error = err
            } else {
                response.succeeded = true
            }
        })
        if (response.error) {
            failed.push(response)
        } else {
            succeeded.push(user)
        }
        return response
    }
    return new Promise((succeed, fail) => {
        async function save(users) {
            for (user of users) {
                await saveCustomer(user)
            }
        }
        save(users).then(()=>{
            if (failed.length > 0) {
                fail({
                    status: 500,
                    error: failed,
                    success: false
                })
            } else {
                succeed({
                    status: 201,
                    success: true,
                    data: succeeded
                })
            }
        })
    })
}