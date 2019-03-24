let User = require('../models/user.model')
let config = require('../config')
let mongoose = require('mongoose')
// get all dispatcher users
exports.getDispatcherUsers = () => {
    return new Promise((succeed, fail) => {
        User.find({
            account_status: "active",
            level: config.levels.dispatcher
        }, (err, users) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: users,
                    success: true
                })
            }
        })
    })
}
// add a dispatcher user
exports.addDispatcherUser = (user) => {
    return new Promise((succeed, fail) => {
        user.level = config.levels.dispatcher
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
// remove dispatcher user
exports.removeDispatcherUser = id => {
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
                    level: config.levels.dispatcher
                }, {
                    $set: {
                        account_status: "inactive"
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
// edit dispatcher user
exports.updateDispatcherUser = (id, user) => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                message: "User not found"
            })
        } else {
            User.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    account_status: "active",
                    level: config.levels.dispatcher
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
// get dispatchers by name
exports.getDispatcherUsersByName = name => {
    return new Promise((succeed, fail) => {
        User.find({
            name: new RegExp(`^${name.toLowerCase()}`, "i"),
            account_status: "active",
            level: config.levels.dispatcher
        }, (err, users) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (users.length > 0) {
                succeed({
                    status: 200,
                    data: users,
                    success: true
                })
            } else {
                fail({
                    status: 404,
                    success: false,
                    msg: "no users found"
                })
            }
        })
    })
}
// set dispatcher schedule
exports.setDispatcherUserSchedule = (id, schedule) => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                message: "User not found"
            })
        } else {
            User.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    account_status: "active",
                    level: config.levels.dispatcher
                }, {
                    $set: {
                        'working_hours.start': schedule.working_hours.start,
                        'working_hours.end': schedule.working_hours.end
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
// get dispatcher details by id
exports.getDipatcherById = id => {
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
                level: config.levels.dispatcher
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
// add multiple dispatcher users
exports.addMultipleDispatcherUsers = dispatchers => {
    let failed = []
    let succeeded = []
    let promises = []
    let dispatcherUsers = []
    async function saveDispatcherUser(dispatcher) {
        let response = {
            succeeded: true,
            error: null,
            dispatcher: dispatcher
        }
        dispatcher.phone = dispatcher.phone.replace('-', '')
        dispatcher = new User(dispatcher)
        await dispatcher.save(err => {
            if (err) {
                response.succeeded = false
                response.error = err
            } else {
                response.dispatcher = dispatcher
                response.succeeded = true
            }
        })
        if (response.error) {
            failed.push(response)
        } else {
            succeeded.push(dispatcher)
        }
        return response
    }
    return new Promise((succeed, fail) => {
        for (dispatcher of dispatchers) {
            dispatcher.level = config.levels.dispatcher
            dispatcherUsers.push(dispatcher)
        }
        async function save(_dispatchers) {
            for (dispatcherUsers of _dispatchers) {
                let response = await saveDispatcherUser(dispatcherUsers)
            }
        }
        save(dispatcherUsers).then(() => {
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