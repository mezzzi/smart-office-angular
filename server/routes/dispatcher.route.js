// import modules
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const dispatcherUserController = require('../controllers/dispatcher.user.controller')
const supervisorMiddleware = require('../middlewares/supervisor.middleware')

// connect to db
dbConnectionUtil.connect()
// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
const dispatcherUserRoute = new express.Router
// dispatcherUserRoute.use(supervisorMiddleware.supervisorMiddleware)
dispatcherUserRoute.get('/', dispatcherUserController.getDispatcherUsers)
dispatcherUserRoute.get('/:name', dispatcherUserController.getDispatcherUsersByName)
dispatcherUserRoute.post('/', dispatcherUserController.addDispatcherUser)
dispatcherUserRoute.post('/multiple', dispatcherUserController.addMultipleDispatcherUsers)
dispatcherUserRoute.delete('/:id', dispatcherUserController.removeDispatcherUser)
dispatcherUserRoute.put('/:id', dispatcherUserController.updateDispatcherUser)
dispatcherUserRoute.get('/details/:id', dispatcherUserController.getDispatcherById)
dispatcherUserRoute.post('/schedule/:id', dispatcherUserController.setDispatcherUserSchedule)
module.exports = dispatcherUserRoute