const mongoose = require('mongoose')
const User = require('../models/user.model')
const config = require('../config')

// get all dispatcher supervisor users
exports.getDispatcherSupervisors = () => (
	new Promise((succeed, fail) => {
		User.find({
			account_status: 'active',
			level: config.levels.dispatcher_supervisor
		}, (err, users) => {
			if (err) {
				fail({
					status: 500,
					error: err,
					success: false
				})
			} else {
				succeed({
					status: 200,
					data: users,
					success: true
				})
			}
		})
	}))

// add a dispatcher supervisor user
exports.addDispatcherSupervisor = user => (
	new Promise((succeed, fail) => {
		user = new User(user)
		user.save(err => {
			if (err) {
				fail({
					success: false,
					error: err,
					status: 500
				})
			} else {
				succeed({
					success: true,
					status: 201,
					data: user
				})
			}
		})
	}))

// update a dispatcher supervisor user
exports.updateDispatcherSupervisor = (id, user) => (
	new Promise((succeed, fail) => {
		console.log(mongoose.Types.ObjectId(id), user)
		if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "User not found"
            })
        } else {
        	User.findOneAndUpdate({
			_id: mongoose.Types.ObjectId(id),
			account_status: 'active',
			level: config.levels.dispatcher_supervisor
		}, {
			$set: {
				...user
			}
		}, {
			new: true
		}, (err, user) => {
			console.log(user, err)
			if (err) {
				fail({
					success: false,
					error: err,
					status: 500
				})
			} else if (user) {
				succeed({
					success: true,
					status: 201,
					data: user
				})
			} else {
				fail({
					status: 404,
					msg: 'User not found',
					success: false
				})
			}
		})
        }
		
	}))

// remove a dispatcher supervisor user
exports.removeDispatcherSupervisor = id => (
	new Promise((succeed, fail) => {
		User.findOneAndUpdate({
			_id: mongoose.Types.ObjectId(id),
			account_status: 'active',
			level: config.levels.dispatcher_supervisor
		}, {
			$set: {
				account_status: 'inactive'
			}
		}, {
			new: true
		}, (err, user)=> {
			if (err) {
				fail({
					success: false,
					error: err,
					status: 500
				})
			} else if (user) {
				succeed({
					success: true,
					status: 200,
					data: user
				})
			} else {
				fail({
					status: 404,
					msg: 'dispatcher supervisor not found',
					success: false
				})
			}
		})
	}))

// get dispatcher supervisor users by name
exports.getDispatcherSupervisorsByName = name => (
	new Promise((succeed, fail) => {
		User.find({
			account_status: 'active',
			name: new RegExp(`^${name.toLowerCase()}`, "i"),
			level: config.levels.dispatcher_supervisor
		}, (err, users) => {
			if (err) {
				fail({
					status: false,
					error: err,
					success: false
				})
			} else {
				succeed({
					status: 200,
					data: users,
					success: true
				})
			}
		})
	}))

// get dispatcher supervisor by phone number
exports.getDispatcherSupervisorsByPhone = phone => (
	new Promise((succeed, fail) => {
		User.find({
			account_status: 'active',
			phone: new RegExp(`^${phone.trim()}`, "i"),
			level: config.levels.dispatcher_supervisor
		}, (err, users) => {
			if (err) {
				fail({
					status: false,
					error: err,
					success: false
				})
			} else {
				succeed({
					status: 200,
					data: users,
					success: true
				})
			}
		})
	}))

// add multiple dispatcher supervisor users
exports.addMultipleDispatcherUsers = users => {
    let failed = []
    let succeeded = []
    let promises = []
    let dispatcherUsers = []
    async function saveDispatcherUser(dispatcher) {
        let response = {
            succeeded: true,
            error: null,
            dispatcher: dispatcher
        }
        dispatcher.phone = dispatcher.phone.replace(/[-]/g, '');
        dispatcher = new User(dispatcher)
        await dispatcher.save(err => {
            if (err) {
                response.succeeded = false
                response.error = err
            } else {
                response.dispatcher = dispatcher
                response.succeeded = true
            }
        })
        if (response.error) {
            failed.push(response)
        } else {
            succeeded.push(dispatcher)
        }
        return response
    }
    return new Promise((succeed, fail) => {
        for (dispatcher of users) {
            dispatcher.level = config.levels.dispatcher
            dispatcherUsers.push(dispatcher)
        }
        async function save(_dispatchers) {
            for (dispatcherUsers of _dispatchers) {
                let response = await saveDispatcherUser(dispatcherUsers)
            }
        }
        save(dispatcherUsers).then(() => {
            if (failed.length > 0) {
                fail({
                    status: 500,
                    error: failed,
                    success: false
                })
            } else {
                succeed({
                    status: 201,
                    success: true,
                    data: succeeded
                })
            }
        })

    })
}

// get dispatcher supervisor user by id
exports.getDispatcherSupervisorById = id => (
	new Promise((succeed, fail) => {
		User.findById(id, (err, user) => {
			if (err) {
				fail({
					status: 500,
					success: false,
					error: err
				})
			} else {
				succeed({
					status: 200,
					success: true,
					data: user
				})
			}
		})
	}))