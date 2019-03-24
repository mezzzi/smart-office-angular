// import modules
const User = require('../models/user.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const financeUserController = require('../controllers/finance.user.controller')

// connect to db
dbConnectionUtil.connect()
// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
const financeUserRoute = new express.Router

financeUserRoute.get('/', financeUserController.getFinanceUsers)
financeUserRoute.post('/', financeUserController.addFinanceUser)
financeUserRoute.put('/:id', financeUserController.updateFinanceUser)
financeUserRoute.get('/details/:id', financeUserController.getFinanceById)

module.exports = financeUserRoute

