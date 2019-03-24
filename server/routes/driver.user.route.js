// import modules
const User = require('../models/user.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const driverUserController = require('../controllers/dirver.user.controller')
const supervisorMiddleware = require('../middlewares/supervisor.middleware')
// connect to db
dbConnectionUtil.connect()

// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const driverUserRoute = new express.Router
// apply supervisor middleware
// driverUserRoute.use(supervisorMiddleware.supervisorMiddleware)
driverUserRoute.get('/', driverUserController.getDriverUsers)
driverUserRoute.get('/available', driverUserController.getActiveDrivers)
driverUserRoute.get('/search/name/:name', driverUserController.getDriverByName)
driverUserRoute.post('/', driverUserController.addDriverUser)
driverUserRoute.get('/search/phone/:phone', driverUserController.getDriverUsersByPhone)
driverUserRoute.post('/multiple', driverUserController.addMultipleDriverUsers)
driverUserRoute.delete('/:id', driverUserController.removeUserById)
driverUserRoute.put('/:id', driverUserController.updateUserById)
driverUserRoute.get('/details/:id', driverUserController.getDriverUserById)

module.exports = driverUserRoute