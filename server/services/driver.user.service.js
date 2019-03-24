const User = require('../models/user.model')
const config = require('../config')
const mongoose = require('mongoose')

// get driver users
exports.getDriverUsers = (name) => {
    return new Promise((succeed, fail) => {
        User.find({
            account_status: "active",
            level: config.levels.driver
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
//get driver by name
exports.getDriverUserByName = (name) => {
    return new Promise((succeed, fail) => {
        User.find({
            name: new RegExp(`^${name.toLowerCase()}`, "i"),
            account_status: "active",
            level: config.levels.driver
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
                    msg: 'no user found'
                })
            }
        })
    })
}
//add a driver 
exports.addDriverUser = (user) => {
    return new Promise((succeed, fail) => {
        user.level = config.levels.driver
        user.driver_status = config.driver_status.AVIALABLE
        user.phone = user.phone.replace(/[-]/g, '');
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
// remove user by ID
exports.removeUserById = (id) => {
    return new Promise((success, fail) => {
        _id = mongoose.Types.ObjectId(id)
        if (!_id) {
            fail({
                status: 404,
                success: false,
                msg: "not Valid id"
            })
        } else {
            User.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    account_status: "active",
                    level: config.levels.driver
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
                        success({
                            status: 200,
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
// update user by ID
exports.updateUserById = (id, body) => {
    return new Promise((succeed, fail) => {
        _id = mongoose.Types.ObjectId(id);
        if (!_id) {
            console.log("in if")
            fail({
                status: 404,
                success: false,
                msg: "invalid object id"
            })
        } else {
            User.findByIdAndUpdate({
                _id: id,
                account_status: "active",
                level: config.levels.driver
            }, {
                $set: {
                    ...body
                }
            }, {
                new: true
            }, (err, user) => {

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
                        msg: "driver not found"
                    })
                }
            })
        }
    })
}
// get driver user details by id
exports.getDriverUserById = id => {
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
                level: config.levels.driver
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
// add multiple driver users
exports.addMultipleDriverUsers = drivers => {
    let failed = []
    let succeeded = []
    let promises = []
    let driverUsers = []
    async function saveDriver(driver) {
        driver.phone = driver.phone.replace(/[-]/g, '');
        let response = {
            succeeded: true,
            error: null,
            driver: driver
        }
        driver = new User(driver)
        await driver.save(err => {
            if (err) {
                response.succeeded = false
                response.error = err
                failed.push(response)

            } else {
                response.succeeded = true
                succeeded.push(driver)
            }
        })
        await User.findById(driver._id, (err, user) => console.log(err, user))
        return response

    }
    return new Promise((succeed, fail) => {
        for (driver of drivers) {
            driver.level = config.levels.driver
            driverUsers.push(driver)
        }
        async function save(_drivers) {
            for (driverUser of _drivers) {
                let response = await saveDriver(driverUser)
            }
        }
        save(driverUsers).then(() => {
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

exports.getActiveDrivers = () => {
    return new Promise((succeed, fail) => {
        User.find({
            level: config.levels.driver,
            account_status: 'active',
            driver_status: config.driver_status.AVIALABLE
        }, (err, drivers) => {
            if (err) {
                fail({
                    status: 500,
                    success: false,
                    error: err
                })
            } else {
                succeed({
                    status: 200,
                    success: true,
                    data: drivers
                })
            }
        })
    })
}

// search cusomer by phone
exports.getDriverUsersByPhone = phone => {
    return new Promise((succeed, fail) => {
        User.find({
            phone: new RegExp(`^${phone}`),
            account_status: "active",
            level: config.levels.driver
        }, (err, drivers) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (drivers.length > 0) {
                succeed({
                    status: 200,
                    data: drivers,
                    success: true
                })
            } else {
                fail({
                    status: 404,
                    success: false,
                    msg: `no drivers found by phone ${phone}`
                })
            }
        })
    })
}