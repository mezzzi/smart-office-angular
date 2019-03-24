const User = require('../models/user.model')
const config = require('../config')
const mongoose = require('mongoose')
// get supervisor users
exports.getSupervisorUsers = () => {
    return new Promise((succeed, fail) => {
        User.find({
            account_status: "active",
            level: config.levels.supervisor
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
// add supervisor user
exports.addSupervisorUser = user => {
    return new Promise((succeed, fail) => {
        user.level = config.levels.supervisor
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
// remove supervisor user
exports.removeSupervisorUser = id => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "invalid id"
            })
        } else {
            User.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    account_status: "active",
                    level: config.levels.supervisor
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
// edit supervisor
exports.updateSupervisorUser = (id, user) => {
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
                    level: config.levels.supervisor
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
                            msg: "user not found"
                        })
                    }
                })
        }

    })
}
// get supervisors by name
exports.getSupervisorsByName = name => {
    return new Promise((succeed, fail) => {
        User.find({
            name: new RegExp(`^${name}`),
            account_status: "active",
            level: config.levels.supervisor
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
// get supervisor details by id
exports.getSupervisorUserById = id => {
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
                level: config.levels.supervisor
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
// add multiple supervisor users
exports.addMultipleSupervisorUsers = supervisors => {
    let failed = []
    let succeeded = []
    let promises = []
    let supervisorUsers = []
    async function saveSupervisor(supervisor) {
        let response = {
            succeeded: true,
            error: null,
            supervisor: supervisor
        }
        supervisor.phone = supervisor.phone.replace('-', '')
        supervisor = new User(supervisor)
        await supervisor.save(err => {
            if (err) {
                response.succeeded = false
                response.error = err
                failed.push(response)
            } else {
                response.succeeded = true
                succeeded.push(supervisor)
            }
        })
        if (response.error) {
            failed.push(response)
        } else {
            succeeded.push(supervisor)
        }
        return response
    }
    return new Promise((succeed, fail) => {
        for (supervisor of supervisors) {
            supervisor.level = config.levels.supervisor
            supervisorUsers.push(supervisor)
        }
        async function save(_supervisors) {
            for (supervisorUser of _supervisors) {
                let response = await saveSupervisor(supervisorUser)
            }
        }
        save(supervisorUsers).then(() => {
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