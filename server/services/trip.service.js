const config = require('../config');
const Trip = require('../models/trip.model');
const mongoose = require('mongoose');
const User = require('../models/user.model');

// get all trips
exports.getAllTrips = () => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active'
        }, (err, trips) => {
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
                    data: trips
                })
            }
        })
    })
};
// remove a trip
exports.removeTripById = id => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "Trip not found"
            })
        } else {
            Trip.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    status: "active"
                }, {
                    $set: {
                        status: "inactive"
                    }
                }, {
                    new: true
                },
                (err, trip) => {
                    if (err) {
                        fail({
                            status: 500,
                            error: err,
                            success: false
                        })
                    } else if (trip) {
                        succeed({
                            status: 200,
                            data: trip,
                            success: true
                        })
                    } else {
                        fail({
                            status: 404,
                            success: false,
                            msg: "Trip not found"
                        })
                    }
                })
        }
    })
};
// add a trip
exports.addTrip = trip => {
    console.log(`ADD TRIP CALLED`);
    return new Promise((succeed, fail) => {
        // find driver
        if (trip.customer) {
            if (trip.customer.history) {
                delete trip.customer.history
            }
        }
        // got to update driver status
        new Promise((success, failure) => {
            if (!!trip.driver) {

                // cry if driver is not available
                if (!trip.driver._id) {
                    success();
                } else {
                    User.findById(trip.driver._id, (err, driver) => {
                        if (err) {
                            success();
                        } else {
                            if (driver) {
                                if (driver.driver_status !== config.driver_status.AVIALABLE) {
                                    failure({
                                        status: 404,
                                        success: false,
                                        msg: "Driver not available"
                                    });
                                } else {
                                    success();
                                }
                            } else {
                                failure({
                                    status: 404,
                                    success: false,
                                    msg: "Driver not available"
                                });
                            }
                        }
                    })
                }

            } else {
                success();
            }
        }).then(() => {

            // save trip
            return new Promise((success, failure) => {
                if (!!trip.driver && !!trip.driver._id) {
                    trip.driver.driver_status = config.driver_status.ASSIGNED;
                }
                trip = new Trip(trip);
                trip.save((err, _trip) => {
                    if (err) {
                        failure({
                            status: 500,
                            success: false,
                            error: err
                        })
                    } else {
                        success(_trip);
                    }
                })
            })
        })
            .then(_trip => {

                // update driver
                return new Promise((success, failure) => {
                    if (!!trip.driver && !!trip.driver._id) {

                        User.findOneAndUpdate({
                                _id: mongoose.Types.ObjectId(_trip.driver._id),
                                account_status: "active",
                                level: config.levels.driver
                            }, {
                                $set: {
                                    driver_status: config.driver_status.ASSIGNED
                                }
                            }, {
                                new: true
                            },
                            (err, driver) => {
                                if (err) {
                                    failure({
                                        status: 500,
                                        error: err,
                                        success: false
                                    })
                                } else if (driver) {
                                    _trip.driver = driver;
                                    success(_trip);
                                } else {
                                    failure({
                                        status: 404,
                                        success: false,
                                        msg: "Driver not found"
                                    })
                                }
                            })
                    } else {
                        success(_trip);
                    }
                })


            })
            .then(_trip => {

                return new Promise((success, failure) => {
                    if (!!trip.customer) {
                        if (!trip.customer._id) {
                            user = new User(trip.customer);
                            user.account_status = 'active';
                            user.level = config.levels.customer;
                            if (user._id) {
                                // new customer should not have an id
                                delete user._id;
                            }
                            user.save(function (err, usr) {
                                if (err) {
                                    failure({
                                        status: 500,
                                        error: err,
                                        success: false
                                    })
                                } else {
                                    _trip.customer = usr;
                                    success(_trip);
                                }
                            })
                        } else {
                            success(_trip);
                        }
                    } else {
                        failure({
                            status: 404,
                            success: false,
                            msg: "Customer not found"
                        })
                    }
                })
            })
            .then((_trip) => {
                // update trip customer so it contains valid id
                return new Promise((success, failure) => {
                    Trip.findByIdAndUpdate(_trip._id, {
                        $set: {
                            customer: _trip.customer
                        }
                    }, {
                        new: true
                    }, (err, __trip) => {
                        if (err) {
                            failure({
                                status: 500,
                                success: false,
                                error: err
                            })
                        } else {
                            success({
                                status: 201,
                                success: true,
                                data: __trip
                            })
                        }
                    })

                })
            })
            .then(response => {
                console.log('FINISHED WITH SUCCESSFUL RESPONSE')
                succeed(response)
            })
            .catch(error => fail(error))
    })

};
// update a trip
exports.updateLastNotified = (id, data) => {

    return new Promise((succeed, fail) => {

        if (mongoose.Types.ObjectId.isValid(id)) {

            Trip.findOneAndUpdate({
                    _id: mongoose.Types.ObjectId(id),
                    status: "active"
                }, {
                    $set: {
                        last_notified: data.last_notified,
                        notified: data.notified
                    }
                }, {
                    new: true
                },
                (err, trip) => {
                    if (err) {
                        fail({
                            status: 500,
                            error: err,
                            success: false
                        })
                    } else if (trip) {
                        succeed({
                            status: 201,
                            data: trip,
                            success: true
                        })
                    } else {
                        fail({
                            status: 404,
                            success: false,
                            msg: "Trip not found"
                        })
                    }
                })
        } else {
            fail({
                status: 500,
                success: false,
                msg: "Invalid Id: " + id
            })
        }

    })

};
// update a trip
exports.updateTrip = (id, trip) => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "Trip not found"
            })
        } else {
            if (trip.trip_status) {
                // calculate etta fee and total price
                if (trip.trip_status === config.trip_status.COMPLETED) {
                    // check if trip is booked after 10 PM (22:00 in 24-hr format)
                    if (new Date(trip.call_time).getHours() > 22) {
                        // mark trip as late
                        trip.late = true
                    }
                }
                // find the trip to modify
                new Promise((success, failure) => {
                    Trip.findById(id, (err, _trip) => {
                        if (err) {
                            failure({
                                status: 404,
                                success: false,
                                msg: "Trip not found"
                            })
                        } else {
                            success(_trip);
                        }
                    })
                }).then((_trip) => {
                    // update driver status
                    return new Promise((success, failure) => {
                        if (!_trip.driver || !mongoose.Types.ObjectId.isValid(_trip.driver._id)) {
                            // if fetched trip does not have a driver, then append the new driver
                            if (!trip.driver || !mongoose.Types.ObjectId.isValid(trip.driver._id)) {
                                // ok to update without a driver
                                success(_trip);
                            } else {
                                _trip.driver = trip.driver;
                            }
                        }
                        if (_trip.driver) {
                            // update driver status based on updated trip status
                            User.findOneAndUpdate({
                                    _id: mongoose.Types.ObjectId(_trip.driver._id),
                                    account_status: "active",
                                    level: config.levels.driver
                                }, {
                                    $set: {
                                        driver_status: config.driver_trip[trip.trip_status]
                                    }
                                }, {
                                    new: true
                                },
                                (err, driver) => {
                                    if (err) {
                                        failure({
                                            status: 500,
                                            error: err,
                                            success: false
                                        })
                                    } else {
                                        _trip.driver = driver;
                                        success(_trip);
                                    }
                                });
                        }
                    })
                })
                    .then(_trip => {
                        // get the customer
                        return new Promise((success, failure) => {
                            User.findOne({
                                _id: mongoose.Types.ObjectId(trip.customer._id),
                                account_status: 'active',
                                level: config.levels.customer
                            }, (err, user) => {
                                if (err) {
                                    failure({
                                        status: 500,
                                        success: false,
                                        error: err
                                    })
                                } else {
                                    if (user) {
                                        user.card_number = trip.customer.card_number ? trip.customer.card_number : '';
                                        user.attached_corporate = trip.customer.attached_corporate ? trip.customer.attached_corporate : user.attached_corporate;
                                        user.save(err => {
                                            if (err) {
                                                failure({
                                                    status: 500,
                                                    success: false,
                                                    error: err
                                                })
                                            } else {
                                                _trip.customer = user;
                                                success(_trip);
                                            }
                                        })

                                    }

                                }
                            })
                        })

                    })
                    .then((_trip) => {
                        // do update the trip now
                        return new Promise((success, failure) => {
                            Trip.findOneAndUpdate({
                                    _id: mongoose.Types.ObjectId(id),
                                    status: "active"
                                }, {

                                    $set: {
                                        ...trip,
                                        driver: _trip.driver,
                                        customer: _trip.customer
                                    }
                                }, {
                                    new: true
                                },
                                (err, __trip) => {
                                    if (err) {
                                        failure({
                                            status: 500,
                                            error: err,
                                            success: false
                                        })
                                    } else {
                                        success(__trip);
                                    }
                                });
                        })

                    })
                    .then(_trip => {
                        succeed({
                            status: 201,
                            success: true,
                            data: _trip,
                        })
                    })
                    .catch(err => fail(err));

            } else {
                fail({
                    status: 404,
                    success: false,
                    msg: "Trip has no trip_status"
                })
            }
        }

    })
};
// get trip by id
exports.getTripById = id => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "Trip not found"
            })
        } else {
            Trip.findOne({
                _id: mongoose.Types.ObjectId(id),
                status: 'active'
            }, (err, trip) => {
                if (err) {
                    fail({
                        status: 500,
                        error: err,
                        success: false
                    })
                } else {
                    succeed({
                        status: 200,
                        success: true,
                        data: trip
                    })
                }
            })
        }
    })
};
// get trip by dispatcher id
exports.getTripByDispatcherId = id => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "Trip not found"
            })
        } else {
            Trip.find({
                status: 'active'
            }, (err, trips) => {
                if (err) {
                    fail({
                        status: 500,
                        error: err,
                        success: false
                    })
                } else {
                    const customFilter = (tr) => {
                        const receivedByCondition = !!tr.received_by ? String(tr.received_by._id) === id.trim() : false;
                        const acceptedByCondition = !!tr.accepted_by ? String(tr.accepted_by._id) === id.trim() : false;
                        const startedByCondition = !!tr.started_by ? String(tr.started_by._id) === id.trim() : false;
                        const completedCondition = !!tr.completed_by ? String(tr.completed_by._id) === id.trim() : false;
                        const cancelledCondition = !!tr.cancelled_by ? String(tr.cancelled_by._id) === id.trim() : false;
                        return receivedByCondition || acceptedByCondition || startedByCondition || completedCondition
                            || cancelledCondition;

                    };
                    succeed({
                        status: 200,
                        success: true,
                        data: trips.filter(tr => customFilter(tr))
                    })
                }
            })
        }
    })
};
// get trips within the month
exports.getTripsWithinMonth = () => {
    return new Promise((succeed, fail) => {
        let day = 1000 * 3600 * 24;
        let trips = [];
        Trip.find({
            status: 'active'
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                trips = trips.filter(trip => (
                    (trip.time_added - Date.now()) / day <= 30
                ));
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips within the week
exports.getTripsWithinWeek = () => {
    return new Promise((succeed, fail) => {
        let day = 1000 * 3600 * 24;
        let trips = [];
        Trip.find({
            status: 'active'
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                trips = trips.filter(trip => (
                    (trip.time_added - Date.now()) / day <= 7
                ));
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips within the day
exports.getTripsWithinDay = () => {
    return new Promise((succeed, fail) => {
        let day = 1000 * 3600 * 24;
        let trips = [];
        Trip.find({
            status: 'active'
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                trips = trips.filter(trip => (
                    (trip.time_added - Date.now()) / day <= 1
                ));
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips between two timestamps
exports.getTripsBetweenTimestamps = (startTimestamp, endTimestamp) => {
    return new Promise((succeed, fail) => {
        if (startTimestamp.indexOf(':') > -1) {
            startTimestamp = new Date(startTimestamp).getTime();
        } else {
            startTimestamp = new Date(parseInt(startTimestamp)).getTime()
        }
        if (endTimestamp.indexOf(':') > -1) {
            endTimestamp = new Date(endTimestamp).getTime()
        } else {
            endTimestamp = new Date(parseInt(endTimestamp)).getTime()
        }
        Trip.find({
            status: 'active',
            time_added: {
                $gte: startTimestamp,
                $lte: endTimestamp
            }
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// cancel a trip
exports.cancelTrip = (id, code) => {
    return new Promise((succeed, fail) => {
        trip = {};
        if (!mongoose.Types.ObjectId.isValid(id)) {
            fail({
                status: 404,
                success: false,
                msg: "Trip not found"
            })
        } else {
            if (Object.keys(config.cancellation_codes).indexOf(code) > -1) {
                fail({
                    status: 400,
                    msg: "Invalid cancellation code",
                    success: false
                })
            } else {
                // hey coolie, got to set the status to CANCELLED first of course
                Trip.findOne({
                    _id: mongoose.Types.ObjectId(id),
                    status: "active"
                }).then((trip) => {
                    const formerStatus = trip.trip_status;
                    // console.log(`STATUS AT EXTRACTION: ${formerStatus}`);
                    trip.trip_status = config.trip_status.CANCELLED;
                    trip.cancellation_code = config.cancellation_codes[code];
                    return new Promise((resolve, failure) => {
                        trip.save((err, trip) => {
                            if (!!trip.driver) {
                                // send driver to next handler, to be made available
                                // console.log(`1: SET STATUS TO CANCEL, GOT DRIVER TOO`);
                                resolve(trip);
                            } else {
                                // pending and no driver is cool
                                if (formerStatus === config.trip_status.PENDING) {
                                    // console.log(`1: SET STATUS TO CANCEL, NO DRIVER B/C PENDING`);
                                    resolve(trip);
                                } else {
                                    // not pending and no driver is not cool
                                    // console.log(`1: SET STATUS TO CANCEL, IN TROUBLE: NO p AND d`);
                                    // console.log(`TRIP status is ${formerStatus}, and there is no driver, what?`);
                                    fail({
                                        status: 500,
                                        success: false,
                                        error: "Trip has no driver assigned"
                                    })
                                }
                            }
                        });
                    })
                }).then(trip => {
                    // console.log(`2: YEAH DRIVER, ABOUT TO MAKE IT AVAILABLE`);
                    // got to set the driver free
                    return new Promise((resolve, failure) => {
                        if (!trip.driver) {
                            resolve(trip);
                        } else {
                            User.findByIdAndUpdate(trip.driver._id, {
                                $set: {
                                    driver_status: config.driver_status.AVIALABLE
                                }
                            }, (err, driver) => {
                                if (err) {
                                    fail({
                                        status: 500,
                                        success: false,
                                        error: err
                                    })
                                } else {
                                    // console.log(`3: YEAH DRIVER IS MADE AVAILABLE, WHOOO!`);
                                    resolve(trip);
                                }
                            })
                        }
                    });

                }).then(data => {
                    succeed({
                        status: 200,
                        data: data,
                        success: true,
                        msg: 'Successfully Added'
                    })
                }).catch(error => fail(error));
            }
        }
    })
};
// get scheduled trips
exports.getDueScheduledTrips = () => {
    return new Promise((succeed, fail) => {
        Trip.find({
            scheduled_time: {
                $lte: Date.now(),
            },
            notified: false
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    success: true,
                    data: trips
                })
            }
        })
    })
};
// get pending trips
exports.getPendingTrips = () => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            trip_status: config.trip_status.PENDING
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                // trips.forEach(trip => {
                //     console.log('last_notified in trips: '+trip.last_notified);
                // })
                succeed({
                    status: 200,
                    data: trips,
                    success: true,
                    now: Date.now()
                })
            }
        })
    })
};
// get accepted trips
exports.getAcceptedTrips = () => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            trip_status: config.trip_status.ACCEPTED,
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get started trips
exports.getStartedTrips = () => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            trip_status: config.trip_status.STARTED,
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get started trips
exports.getArrivedTrips = () => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            trip_status: config.trip_status.ARRIVED,
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get completed trips
exports.getCompletedTrips = () => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            trip_status: config.trip_status.COMPLETED,
        }, (err, trips) => {
            const today = new Date();
            const midNight = new Date();
            midNight.setDate(today.getDate() + 1);
            midNight.setHours(0);
            midNight.setMinutes(0);
            midNight.setSeconds(0);
            midNight.setMilliseconds(0);
            if (!!trips) {
                trips.filter(tr => tr < midNight);
            }
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};

// get trip by starting location
exports.getTripByStartingLocationName = name => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            'starting_location.name': new RegExp(`^${name.toLowerCase()}`, "i"),
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trip by destination location
exports.getTripByDestinationLocationName = name => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            'destination_location.name': new RegExp(`^${name.toLowerCase()}`, "i"),
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips by starting and destination locatiion names
exports.getTripByStartingAndDestination = (starting, destination) => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            'starting_location.name': new RegExp(`^${starting.toLowerCase()}`, "i"),
            'destination_location.name': new RegExp(`^${destination.toLowerCase()}`, "i"),
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips after specified time
exports.getTripsAfterTime = time => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            time_added: {
                $gte: time
            }
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips by driver name
exports.getTripsByDriverName = driverName => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            "driver.name": new RegExp(`^${driverName.toLowerCase()}`, "i")
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips by driver id
exports.getTripsByDriverId = driverId => {
    return new Promise((succeed, fail) => {
        if (!mongoose.Types.ObjectId.isValid(driverId)) {
            fail({
                status: 404,
                success: false,
                msg: "Trip not found"
            })
        } else {
            Trip.find({
                status: 'active',
                "driver._id": new mongoose.Types.ObjectId(driverId)
            }, (err, trips) => {
                if (err) {
                    fail({
                        status: 500,
                        error: err,
                        success: false
                    })
                } else {
                    succeed({
                        status: 200,
                        data: trips,
                        success: true
                    })
                }
            })
        }

    })
};
// get trips by customer name
exports.getTripsByCustomerName = customerName => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            "customer.name": new RegExp(`^${customerName.toLowerCase()}`, "i")
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips by a combination of starting and destination locations and driver name
exports.getTripsByLocationAndDriverName = (starting_location, destination_location, driverName) => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            'destination_location.name': new RegExp(`^${destination_location.toLowerCase()}`, "i"),
            'starting_location.name': new RegExp(`^${starting_location.toLowerCase()}`, "i"),
            'driver.name': new RegExp(`^${driverName.toLowerCase()}`, 'i')
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};
// get trips by a combination of starting and destination locations and customer name
exports.getTripsByLocationAndCustomerName = (starting_location, destination_location, customerName) => {
    return new Promise((succeed, fail) => {
        Trip.find({
            status: 'active',
            'destination_location.name': new RegExp(`^${destination_location.toLowerCase()}`, "i"),
            'starting_location.name': new RegExp(`^${starting_location.toLowerCase()}`, "i"),
            'customer.name': new RegExp(`^${customerName.toLowerCase()}`, 'i')
        }, (err, trips) => {
            if (err) {
                fail({
                    status: 500,
                    error: err,
                    success: false
                })
            } else {
                succeed({
                    status: 200,
                    data: trips,
                    success: true
                })
            }
        })
    })
};