const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const disputeController = require('../controllers/dispute.controller')
const dbConnectionUtil = require('../utils/dbConnection.util')
const disputeRoute = new express.Router

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// connect to db
dbConnectionUtil.connect()

disputeRoute.get('/', disputeController.getDisputes)
disputeRoute.post('/', disputeController.addDispute)

module.exports = disputeRoute
