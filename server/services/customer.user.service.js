const User = require('../models/user.model')
const config = require('../config')
const mongoose = require('mongoose')

// get customer users
exports.getCustomerUsers = () => {
    return new Promise((succeed, fail) => {
        User.find({
            account_status: "active",
            level: config.levels.customer
        }, (err, customers) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: customers,
                    success: true
                })
            }
        })
    })
}
// add a customer user
exports.addCustomerUser = user => {
    return new Promise((succeed, fail) => {
        user.level = config.levels.customer
        user.phone = user.phone.replace('-', '');        
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
// remove a customer user
exports.removeCustomerUser = id => {
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
                    level: config.levels.customer
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
// update a customer user
exports.updateCustomerUser = (id, user) => {
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
                    level: config.levels.customer
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
// search customer users by name
exports.getCustomerUsersByName = name => {
    return new Promise((succeed, fail) => {
        User.find({
            name: new RegExp(`^${name.toLowerCase()}`, "i"),
            account_status: "active",
            level: config.levels.customer
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
// get user details by id
exports.getCustomerById = id => {
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
                level: config.levels.customer
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
// search cusomer by phone
exports.getCustomerUsersByPhone = phone => {
    return new Promise((succeed, fail) => {
        User.find({
            phone: new RegExp(`^${phone}`),
            account_status: "active",
            level: config.levels.customer
        }, (err, customers) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (customers.length > 0) {
                succeed({
                    status: 200,
                    data: customers,
                    success: true
                })
            } else {
                fail({
                    status: 404,
                    success: false,
                    msg: `no customers found by phone ${phone}`
                })
            }
        })
    })
}

// get corporate customers
exports.getCorporateCustomerUsers = () => {
    return new Promise((succeed, fail) => {
        User.find({
            level: config.levels.customer,
            attached_corporate: {
                $ne: null
            }
        }, (err, customers) => {
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
                    data: customers
                })
            }
        })
    })
}

// add multiple customer users
exports.addMultipleCustomerUsers = customers => {
    let failed = []
    let succeeded = []
    let promises = []
    let customerUsers = []
    async function saveCustomer(customer) {
        let response = {
            succeeded: true,
            error: null,
            customer: customer
        }
        customer.phone = customer.phone.replace('-', '');
        customer = new User(customer)
        await customer.save(err => {
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
            succeeded.push(customer)
        }
        return response

    }
    return new Promise((succeed, fail) => {
        for (customer of customers) {
            customer.level = config.levels.customer
            customerUsers.push(customer)
        }
        async function save() {
            for (customerUser of customerUsers) {
                await saveCustomer(customerUser)
            }
        }
        save().then(() => {
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