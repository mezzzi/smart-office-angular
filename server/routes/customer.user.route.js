// import modules
const User = require('../models/user.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const customerUserController = require('../controllers/customer.user.controller')
const dispatcherMiddleware = require('../middlewares/dispatcher.middleware')

// connect to db
dbConnectionUtil.connect()
// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const customerUserRoute = new express.Router

// customerUserRoute.use(dispatcherMiddleware.dispatcherMiddleware)
customerUserRoute.get('/', customerUserController.getCustomerUsers)
customerUserRoute.get('/corporate', customerUserController.getCorporateCustomerUsers)
customerUserRoute.get('/:name', customerUserController.getCustomerUserByName)
customerUserRoute.get('/search/phone/:phone', customerUserController.getCustomerUsersByPhone)
customerUserRoute.post('/', customerUserController.addCustomerUser)
customerUserRoute.post('/multiple', customerUserController.addMultipleCustomerUsers)
customerUserRoute.delete('/:id', customerUserController.removeCustomerUser)
customerUserRoute.put('/:id', customerUserController.updateCustomerUser)
customerUserRoute.get('/details/:id', customerUserController.getCustomerById)
module.exports = customerUserRoute