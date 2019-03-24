const app = require('express')()
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const corporateClientService = require('../services/corporate.client.service')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

//get all driver users
exports.getCorporateClients = (req, res, next) => {
    corporateClientService.getCorporateClients()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

//get driver by name
exports.getCorporateClientByName = (req, res, next) => {
    corporateClientService.getCorporateClientByName(req.params.name)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

// add new user
exports.addCorporateClient = (req, res, next) => {
    const _valid = !!req.body.name && !!req.body.day_deal && !!req.body.night_deal && !!req.body.waiting_deal 
    if (!_valid) {
        res.status(400).json({
            status: 400,
            msg: 'incomplete request body, some fields missing',
            success: false
        })
    } else {
        corporateClientService.addCorporateClient(req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }
}

// remove user by name
exports.removeCorporateClientById = (req, res, next) => {
    corporateClientService.removeCorporateClientById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

// update user by ID
exports.updateCorporateClientById = (req, res, next) => {
    corporateClientService.updateCorporateClientById(req.params.id, req.body)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// add multiple corporate clients
exports.addMultipleCorporateClients = (req, res, next) => {
    const succeeded = []
    const failed = []
    // validate each customer object
    for (client of req.body) {
        const _valid = !!client.name && !!client.password & !!client.phone
        if (!_valid) {
            failed.push(client)
        } else {
            const salt = bcrypt.genSaltSync(config.salt_rounds)
            const hash = bcrypt.hashSync(client.password.trim(), salt)
            client.password = hash
            succeeded.push(client)
        }
    }
    if (failed.length > 0) {
        res.status(400).json({
            status: 400,
            msg: "incomplete request body",
            failed: failed,
            success: false
        })
    } else if (succeeded.length > 0) {
        corporateClientService.addMultipleCorporateClients(succeeded)
            .then(data => {
                console.log(data);
                res.status(data.status).json(data)
            })
            .catch(err => {
                console.log(err)
                res.status(err.status).json(err)
            })
    } else {
        res.status(400).json({
            status: 400,
            msg: "incomplete request body",
            success: false,
            succeeded: succeeded,
            failed: failed
        })
    }
}