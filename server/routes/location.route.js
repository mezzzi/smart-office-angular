// import modules
const Location = require('../models/location.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const locationController = require('../controllers/location.controller')
const supervisorMiddleware = require('../middlewares/supervisor.middleware')
// connect to db
dbConnectionUtil.connect()

// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const locationRoute = new express.Router
// apply supervisor middleware
// locationRoute.use(supervisorMiddleware.supervisorMiddleware)
locationRoute.get('/', locationController.getAllLocation)
locationRoute.get('/:name', locationController.getLocationByName)
locationRoute.post('/', locationController.addLocation)
locationRoute.delete('/:id', locationController.removeLocationById)
locationRoute.put('/:id', locationController.updateLocationById)
locationRoute.get('/details/:id', locationController.getLocationById)

module.exports = locationRoute