const express = require('express')
const dbConnectionUtil = require('../utils/dbConnection.util')
const authMiddleware = require('../middlewares/auth.middleware')
const dispatcherSupervisorController = require('../controllers/dispatcher_supervisor.user.controller')
const dispatcherSupervisorRoute = new express.Router

dispatcherSupervisorRoute.get('/', dispatcherSupervisorController.getDispatcherSupervisors)
dispatcherSupervisorRoute.get('/details/:id', dispatcherSupervisorController.getDispatcherSupervisorById)
dispatcherSupervisorRoute.post('/', dispatcherSupervisorController.addDispatcherSueprvisor)
dispatcherSupervisorRoute.put('/:id', dispatcherSupervisorController.updateDispatcherSupervisor)
dispatcherSupervisorRoute.delete('/:id', dispatcherSupervisorController.removeDispatcherSupervisor)
dispatcherSupervisorRoute.get('/search/name/:name', dispatcherSupervisorController.getDispatcherSupervisorsByName)
dispatcherSupervisorRoute.get('/search/phone/:phone', dispatcherSupervisorController.getDispatcherSupervisorsByPhone)

module.exports = dispatcherSupervisorRoute