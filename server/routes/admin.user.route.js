// import modules
const User = require('../models/user.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const adminUserController = require('../controllers/admin.user.controller')

// connect to db
dbConnectionUtil.connect()
// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
const adminUserRoute = new express.Router

adminUserRoute.get('/', adminUserController.getAdminUsers)
adminUserRoute.post('/', adminUserController.addAdminUser)

module.exports = adminUserRoute

