// import modules
const Corporate = require('../models/corporate.client.model')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const authMiddleware = require('../middlewares/auth.middleware')
const config = require('../config')
const dbConnectionUtil = require('../utils/dbConnection.util')
const corporateClientController = require('../controllers/coporate.client.controller')
const supervisorMiddleware = require('../middlewares/supervisor.middleware')
// connect to db
dbConnectionUtil.connect()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

const corporateClientRoute = new express.Router
// corporateClientRoute.use(supervisorMiddleware.supervisorMiddleware)
corporateClientRoute.get('/', corporateClientController.getCorporateClients)
corporateClientRoute.get('/:name', corporateClientController.getCorporateClientByName)
corporateClientRoute.post('/', corporateClientController.addCorporateClient)
corporateClientRoute.delete('/:id', corporateClientController.removeCorporateClientById)
corporateClientRoute.put('/:id', corporateClientController.updateCorporateClientById)

module.exports = corporateClientRoute