// import modules
const User = require('../models/user.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const userController = require('../controllers/user.controller')

// connect to db
dbConnectionUtil.connect()
// setup bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
const userRoute = new express.Router
app.use(express.static(__dirname + '/uploads'))
// api/v1/user/
userRoute.get('/', userController.getUsers)
userRoute.put('/:id', userController.updateUser)
userRoute.get('/image/:id', userController.fetchAvatar)
userRoute.post('/multiple', userController.addMultipleUsers)
module.exports = userRoute

