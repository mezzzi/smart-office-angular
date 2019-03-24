const Corporate = require('../models/corporate.client.model')
const config = require('../config')
const mongoose = require('mongoose')

// get corporate clients
exports.getCorporateClients = () => {
    return new Promise((succeed, fail) => {
        Corporate.find({
            account_status: "active"
        }, (err, corporate) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (corporate) {
                succeed({
                    status: 200,
                    data: corporate,
                    success: true
                })
            }
        })
    })
}
//get corporate by name
exports.getCorporateClientByName = (name) => {
    return new Promise((succeed, fail) => {
        Corporate.find({
            name: new RegExp(`^${name.toLowerCase()}`, "i"),
            account_status: "active",
        }, (err, corporate) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else if (corporate.length > 0) {
                succeed({
                    status: 200,
                    data: corporate,
                    success: true
                })
            } else {
                fail({
                    status: 404,
                    success: false,
                    msg: 'no corporate found'
                })
            }
        })
    })
}
//add a corporate 
exports.addCorporateClient = (corporate) => {
    return new Promise((succeed, fail) => {
        // corporate.phone = corporate.phone.replace('-', '');        
        corporate = new Corporate(corporate)
        corporate.save(err => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 201,
                    data: corporate,
                    success: true
                })
            }
        })
    })
}
// remove corporate by ID
exports.removeCorporateClientById = (id) => {
    return new Promise((success, fail) => {
        _id = mongoose.Types.ObjectId(id)
        if (!_id) {
            fail({
                status: 404,
                success: fail,
                message: "note Valid id"
            })
        } else {
            Corporate.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    account_status: "active",
                }, {
                    $set: {
                        account_status: "inactive"
                    }
                }, {
                    new: true
                },
                (err, corporate) => {
                    if (err) {
                        fail({
                            status: 500,
                            error: err,
                            success: false
                        })
                    } else if (corporate) {
                        success({
                            status: 200,
                            data: corporate,
                            success: true
                        })
                    } else {
                        fail({
                            status: 404,
                            success: false,
                            msg: "corporate not found"
                        })
                    }
                })
        }
    })
}
// update corporate by ID
exports.updateCorporateClientById = (id, body) => {
    return new Promise((succeed, fail) => {
        _id = mongoose.Types.ObjectId(id)
        if (!_id) {
            fail({
                status: 404,
                success: false,
                msg: "invalid object id"
            })
        } else {
            Corporate.findByIdAndUpdate({
                _id: id,
                account_status: "active",
            }, {
                $set: { ...body
                }
            }, {
                new: true
            }, (err, corporate) => {
                if (err) {
                    fail({
                        status: 500,
                        error: err,
                        success: false
                    })
                } else if (corporate) {
                    succeed({
                        status: 201,
                        data: corporate,
                        success: true
                    })
                } else {
                    fail({
                        status: 404,
                        success: false,
                        msg: "corporate not found"
                    })
                }
            })
        }
    })
}
// add multiple corporate clients
exports.addMultipleCorporateClients = clients => {
    let failed = []
    let succeeded = []
    let promises = []
    let clientUsers = []
    async function saveCorporateClient(corporateUser) {
        let response = {
            succeeded: true,
            error: null,
            corporateUser: corporateUser
        }
        corporateUser.phone = corporateUser.phone.replace('-', '');        
        corporateUser = new User(corporateUser)
        await corporateUser.save(err => {
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
            succeeded.push(corporateUser)
        }
        return response

    }
    return new Promise((succeed, fail) => {
        for (corporateUser of clients) {
            corporateUser.level = config.levels.corporateUser
            clientUsers.push(corporateUser)
        }
        async function save(_clients) {
            for (corporateClient of _clients) {
                let response = await saveCorporateClient(corporateClient)
            }
        }
        save(clientUsers).then(() => {
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