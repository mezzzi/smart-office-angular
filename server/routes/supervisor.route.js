// import modules
const User = require('../models/user.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const supervisorUserController = require('../controllers/supervisor.user.controller')
const adminMiddleware = require('../middlewares/admin.middleware.js')

// connect to db
dbConnectionUtil.connect()
// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
const supervisorUserRoute = new express.Router

// supervisorUserRoute.use(adminMiddleware.adminMiddleware)
supervisorUserRoute.get('/', supervisorUserController.getSupervisorUsers)
supervisorUserRoute.get('/:name', supervisorUserController.getSupervisorByName)
supervisorUserRoute.post('/', supervisorUserController.addSupervisorUser)
supervisorUserRoute.post('/multiple', supervisorUserController.addMultipleSupervisorUsers)
supervisorUserRoute.delete('/:id', supervisorUserController.removeSupervisor)
supervisorUserRoute.put('/:id', supervisorUserController.updateSupervisor)
supervisorUserRoute.get('/details/:id', supervisorUserController.getSupervisorById)
module.exports = supervisorUserRoute