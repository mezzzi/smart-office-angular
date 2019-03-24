const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const tripController = require('../controllers/trip.controller');
const tripRoute = new express.Router;
const dispatcherMiddleware = require('../middlewares/dispatcher.middleware');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// tripRoute.use(dispatcherMiddleware.dispatcherMiddleware)
tripRoute.get('/', tripController.getAllTrips);
tripRoute.post('/', tripController.addTrip);
// get pending trips
tripRoute.get('/pending', tripController.getPendingTrips);
// get accepted trips
tripRoute.get('/accepted', tripController.getAcceptedTrips);
// get started trips
tripRoute.get('/started', tripController.getStartedTrips);
// get arrived trips
tripRoute.get('/arrived', tripController.getArrivedTrips);
// get completed trips
tripRoute.get('/completed', tripController.getCompletedTrips);
// search trips
tripRoute.get('/search', tripController.searchTrips);
tripRoute.get('/:id', tripController.getTripById);
tripRoute.get('/dispatcher/:id', tripController.getTripByDispatcherId);
tripRoute.put('/:id', tripController.updateTrip);
tripRoute.put('/notified/:id', tripController.updateLastNotified);
tripRoute.delete('/:id', tripController.removeTripById);
tripRoute.get('/report/month', tripController.getTripsWithinMonth);
tripRoute.get('/report/week', tripController.getTripsWithinWeek);
tripRoute.get('/report/day', tripController.getTripsWithinDay);
tripRoute.get('/report/:start_time/:end_time', tripController.getTripsBetweenTimestamps);
tripRoute.get('/cancel/:id', tripController.cancelTrip);
tripRoute.get('/scheduled/due', tripController.getDueScheduledTrips);

module.exports = tripRoute;