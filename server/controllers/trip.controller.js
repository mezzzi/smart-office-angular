const app = require('express')();
const mongoose = require('mongoose');
const tripService = require('../services/trip.service');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const main = require('../app');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// get all trips
exports.getAllTrips = (req, res, next) => {
    tripService.getAllTrips()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// add a trip
exports.addTrip = (req, res, next) => {
    const _valid = !!req.body.customer;
    if (_valid) {
        req.body.call_handler = req.decoded;
        tripService.addTrip(req.body)
            .then(data => {
                console.log(`HAS JSONED DATA`);
                res.status(data.status).json(data)
            })
            .then(() => {
                console.log(`HAS MADE PENDING REQUEST`);
                return tripService.getPendingTrips()
            })
            .then(data => {
                console.log(`HAS EMITTED PENDING TRIPS: ${data}`);
                main.io.sockets.emit('pending trips', data)
            })
            .catch(err => {
                console.log(`HAS JSONED ERROR`);
                res.status(err.status).json(err)
            })
    } else {
        res.status(400).json({
            status: 400,
            success: false,
            msg: "incomplete request body"
        })
    }
};
// update a trip
exports.updateTrip = (req, res, next) => {
    if (req.body.collected) {
        req.body.collected_by = req.decoded;
        req.body.collected_time = Date.now()
    }
    // just added a comment, don't mind it
    tripService.updateTrip(req.params.id, req.body)
        .then(data => res.status(data.status).json(data))
        .then(() => {
            return tripService.getPendingTrips();
        })
        .then(data => {
            main.io.sockets.emit('pending trips', data)
        })
        .then(() => {
            return tripService.getAcceptedTrips()
        })
        .then(data => {
            main.io.sockets.emit('accepted trips', data)
        })
        .then(() => {
            return tripService.getStartedTrips()
        })
        .then(data => {
            main.io.sockets.emit('started trips', data)
        })
        .then(() => {
            return tripService.getArrivedTrips()
        })
        .then(data => {
            main.io.sockets.emit('arrived trips', data)
        })
        .then(() => {
            return tripService.getCompletedTrips()
        })
        .then(data => {
            main.io.sockets.emit('completed trips', data)
        })
        .catch(err => {
            console.error(err);
            res.status(err.status).json(err)
        })
};
// update a trip
exports.updateLastNotified = (req, res, next) => {
    tripService.updateLastNotified(req.params.id, req.body)
        .then(data => res.status(data.status).json(data))
        .catch(err => {
            res.status(err.status).json(err)
        })
};
// remove a trip by id
exports.removeTripById = (req, res, next) => {
    tripService.removeTripById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get trip by id
exports.getTripById = (req, res, next) => {
    tripService.getTripById(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))

};
// get trip by dispatcher id
exports.getTripByDispatcherId = (req, res, next) => {
    tripService.getTripByDispatcherId(req.params.id)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))

};
// get trips within a month
exports.getTripsWithinMonth = (req, res, next) => {
    tripService.getTripsWithinMonth()
        .then(data => res.status(data.status).json(data))

        .catch(err => res.status(err.status).json(err))
};
// get trips within a week
exports.getTripsWithinWeek = (req, res, next) => {
    tripService.getTripsWithinWeek()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get trips within a day
exports.getTripsWithinDay = (req, res, next) => {
    tripService.getTripsWithinDay()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get trips in between two timestamps
exports.getTripsBetweenTimestamps = (req, res, next) => {
    tripService.getTripsBetweenTimestamps(req.params.start_time, req.params.end_time)
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// cancel a trip
exports.cancelTrip = (req, res, next) => {
    tripService.cancelTrip(req.params.id, req.query.code)
        .then(data => res.status(data.status).json(data))
        .then(() => {
            return tripService.getPendingTrips();
        })
        .then(data => {
            main.io.sockets.emit('pending trips', data)
        })
        .then(() => {
            return tripService.getAcceptedTrips()
        })
        .then(data => {
            main.io.sockets.emit('accepted trips', data)
        })
        .then(() => {
            return tripService.getStartedTrips()
        })
        .then(data => {
            main.io.sockets.emit('started trips', data)
        })
        .then(() => {
            return tripService.getArrivedTrips()
        })
        .then(data => {
            main.io.sockets.emit('arrived trips', data)
        })
        .then(() => {
            return tripService.getCompletedTrips()
        })
        .then(data => {
            main.io.sockets.emit('completed trips', data)
        })
        .catch(err => {
            console.error(err);
            res.status(err.status).json(err)
        })
};
// get due scheduled trips
exports.getDueScheduledTrips = (req, res, next) => {
    tripService.getDueScheduledTrips()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get pending trips
exports.getPendingTrips = (req, res, next) => {
    tripService.getPendingTrips()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get accepted trips
exports.getAcceptedTrips = (req, res, next) => {
    tripService.getAcceptedTrips()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get started trips
exports.getStartedTrips = (req, res, next) => {
    tripService.getStartedTrips()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get arrived trips
exports.getArrivedTrips = (req, res, next) => {
    tripService.getArrivedTrips()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
};
// get completed trips
exports.getCompletedTrips = (req, res, next) => {
    tripService.getCompletedTrips()
        .then(data => res.status(data.status).json(data))
        .catch(err => res.status(err.status).json(err))
}
// search trips
exports.searchTrips = (req, res, next) => {
    // search trips by location and driver name
    if (req.query.starting_location && req.query.destination_location && req.query.driver_name) {
        tripService.getTripsByLocationAndDriverName(req.query.starting_location, req.query.destination_location, req.query.driver_name)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.starting_location && req.query.destination_location && req.query.customer_name) {
        // search trips by location and customer name
        tripService.getTripsByLocationAndCustomerName(req.query.starting_location, req.query.destination_location, req.query.customer_name)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.starting_location && req.query.destination_location) {
        // search trips by starting location and destination location       
        tripService.getTripByStartingAndDestination(req.query.starting_location, req.query.destination_location)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.starting_location) {
        // search trips by starting location       
        tripService.getTripByStartingLocationName(req.query.starting_location)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.destination_location) {
        // search trips by destination location               
        tripService.getTripByDestinationLocationName(req.query.destination_location)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.driver_name) {
        // search trips by driver name        
        tripService.getTripsByDriverName(req.query.driver_name)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.customer_name) {
        // search trips by customer name                
        tripService.getTripsByCustomerName(req.query.customer_name)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.time_after) {
        // search trips after specified time        
        tripService.getTripsAfterTime(req.query.time_after)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else if (req.query.driver_id) {
        // search trip by driver id
        tripService.getTripsByDriverId(req.query.driver_id)
            .then(data => res.status(data.status).json(data))
            .catch(err => res.status(err.status).json(err))
    } else {
        res.status(400).json({
            status: 400,
            msg: "Incomplete request",
            success: false
        })
    }
};