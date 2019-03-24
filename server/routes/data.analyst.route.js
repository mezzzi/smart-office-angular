// import modules
const User = require('../models/user.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const dataAnalystUserController = require('../controllers/data.analyst.user.controller')

// connect to db
dbConnectionUtil.connect()
// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
const dataAnalystUserRoute = new express.Router

dataAnalystUserRoute.get('/', dataAnalystUserController.getDataAnalystUsers)
dataAnalystUserRoute.post('/', dataAnalystUserController.addDataAnalystUser)
dataAnalystUserRoute.put('/:id', dataAnalystUserController.updateDataAnalystUser)
dataAnalystUserRoute.get('/details/:id', dataAnalystUserController.getDataAnalystById)

module.exports = dataAnalystUserRoute

