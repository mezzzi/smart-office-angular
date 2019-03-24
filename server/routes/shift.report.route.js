const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shiftReportController = require('../controllers/shift.report.controller')
const shiftReportRouter = new express.Router
const dbConnectionUtil = require('../utils/dbConnection.util')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
// connect to db
dbConnectionUtil.connect()

shiftReportRouter.get('/', shiftReportController.getShiftReports)
shiftReportRouter.post('/', shiftReportController.addShiftReport)

module.exports = shiftReportRouter