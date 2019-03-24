const app = require('express')()
const config = require('../config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const locationService = require('../services/location.service')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//get all location users
exports.getAllLocation = (req, res, next) => {
    locationService.getAllLocation()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

//get location by name
exports.getLocationByName = (req, res, next) => {
    locationService.getLocationByName(req.params.name)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

// add new location
exports.addLocation = (req, res, next) => {
    const _valid = !!req.body.name && !!req.body.city && !!req.body.position.latitude && !!req.body.position.longitude && !!req.body.short_name
    if (!_valid) {
        res.status(400).json({
            status: 400,
            msg: 'incomplete request body, some fields missing',
            success: false
        })
    } else {
        locationService.addLocation(req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    }
}

// remove location by Id
exports.removeLocationById = (req, res, next) => {
    locationService.removeLocationById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}

// update user by ID
exports.updateLocationById = (req, res, next) => {
        locationService.updateLocationById(req.params.id, req.body)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
}

// get location user by id
exports.getLocationById = (req, res, next) => {
    locationService.getLocationById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}