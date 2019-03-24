// import node modules
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const excelExport = require('excel-export');

// import local modules
const config = require('./config');
const connectionUtil = require('./utils/dbConnection.util');

// import routes
const userRoute = require('./routes/user.route');
const adminUserRoute = require('./routes/admin.user.route');
const financeUserRoute = require('./routes/finance.user.route');
const dataAnalystUserRoute = require('./routes/data.analyst.route');
const supervisorUserRoute = require('./routes/supervisor.route');
const dispatcherUserRoute = require('./routes/dispatcher.route');
const driverUserRoute = require('./routes/driver.user.route');
const corporateClientRoute = require('./routes/corporate.client.route');
const loginRoute = require('./routes/login.route');
const customerUserRoute = require('./routes/customer.user.route');
const locationRoute = require('./routes/location.route');
const tripRoute = require('./routes/trip.route');
const dispatcherSupervisorRoute = require('./routes/dispatcher_supervisor.route');
const disputeRoute = require('./routes/dispute.route');
const shiftReportRoute = require('./routes/shift.report.route');

// import services
const tripService = require('./services/trip.service');
const customerService = require('./services/customer.user.service');
const driverService = require('./services/driver.user.service');
const dispatcherService = require('./services/dispatcher.user.service');
const supervisorService = require('./services/supervisor.user.service');
const adminService = require('./services/admin.user.service');
const corporateClientService = require('./services/corporate.client.service');
const authMiddleware = require('./middlewares/auth.middleware');

// connect to database
connectionUtil.connect();

// register the middleware for serving static pages
app.use(express.static(`${ __dirname }/uploads`));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, `${ __dirname}/uploads`)
	},
	filename: function (req, file, cb) {
		const file_extension = file.originalname.split('.')[1];
		file_name = `${Date.now()}.${file_extension}`;
		cb(null, `${ file_name }`);
	}
});

// allow CORS
app.use(function (req, resp, next) {
	resp.header("Access-Control-Allow-Origin", "*");
	resp.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	resp.header("Access-Control-Allow-Headers", "*");
	next();
});
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Authorization', '*');
	res.setHeader('Access-Control-Allow-Credentials', true);
	if (req.method === "OPTIONS") {
		res.sendStatus(200);
	} else {
		next();
	}
});
// setup bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.post('/images/', function (req, res, next) {
		next();
	},
	multer({
		storage: storage
	}).any(),
	function (req, res, next) {
		res.json({
			success: true,
			file_name: file_name
		})
	});
app.set('secret', config.secret);
app.get(config.urls.timestamp, (req, res, next) => {
	res.status(200).json({
		status: 200,
		success: true,
		data: Date.now()
	})
});


app.get('/upload_location', (req, res, next) => {
	let fs = require('fs');
	let CsvReadableStream = require('csv-reader');
	 
	let inputStream = fs.createReadStream('unique_list.csv', 'utf8');
	const locationService = require('./services/location.service');

	inputStream
		.pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
		.on('data', function (row) {
			locationService.addLocation({
				name: row[0],
				position: {
					latitude: row[1],
					longitude: row[2]
				},
				type: row[3]
			})
		})
		.on('end', function (data) {
			console.log('No more rows!');
		});
	res.status(200).json({
		status: 200,
		success: true,
		data: Date.now()
	})
});// handle user routes
app.use(config.urls.user, userRoute);
// handle admin user routes
app.use(config.urls.admin, adminUserRoute);
// handle finance user routes
app.use(config.urls.finance, financeUserRoute);
// handle data analyst user routes
app.use(config.urls.data_analyst, dataAnalystUserRoute);
// handle supervisor user routes
app.use(config.urls.supervisor, supervisorUserRoute);
// handle driver user routes
app.use(config.urls.driver, driverUserRoute);
// handle corporate client routes 
app.use(config.urls.corporate, corporateClientRoute);
// handle dispatcher user routes
app.use(config.urls.dispatcher, dispatcherUserRoute);
// handle location 
app.use(config.urls.location, locationRoute);
// handle login route
app.use(config.urls.login, loginRoute);
// handle customer routes
app.use(config.urls.customer, customerUserRoute);
// handle trip routes
app.use(config.urls.trip, tripRoute);
// handle data analyst routes
app.use(config.urls.data_analyst, dataAnalystUserRoute);
// handle dispatcher supervisor routes
app.use(config.urls.dispatcher_supervisor, dispatcherSupervisorRoute);
// handle dispute routes
app.use(authMiddleware.authMiddleware);
app.use(config.urls.dispute, disputeRoute);
// handle shift report routes
app.use(config.urls.shift_report, shiftReportRoute);

const http = require('http').createServer(app);
const io = require('socket.io')(http);

let hasNotified = false;
const pendingExpirationPeriod = 5; // in minutes


io.listen(
	app.listen(process.env.PORT || 3000)
);
io.on('connection', socket => {
	socket.on('notified', () => {
		console.log('NOTIFICATION ECHO  RECEIVED HELLO, hasNotified set to FALSE');
		hasNotified = false;
		console.log('hasNotified set to false ');
	});
	console.log('client connected to socket ');
    setInterval(() => {
        tripService.getPendingTrips().then(res => {
            const trips = res.data;
            trips.map(tr => {
                if (!hasNotified) {
                    let lastNotified = '';
                    if (tr.notified) {
                        lastNotified = tr.last_notified;
                    } else {
                        if (tr.is_scheduled) {
                            lastNotified = tr.scheduled_date.toString();
                        } else {
                            lastNotified = tr.call_time;
                        }
                    }
                    const lastMilliSeconds = isNaN(Number(lastNotified)) ? Date.parse(lastNotified) :
                        Number(lastNotified);
                    const elapsedMilliSeconds = (Date.now() - lastMilliSeconds);
					const elapsedMinutes = elapsedMilliSeconds / 60000;
					const earlyScheduled = (tr.scheduled_date - tr.call_time) < 30 * 60 * 1000;
                    const late = tr.is_scheduled && !tr.notified ? (earlyScheduled? elapsedMinutes > 0: elapsedMinutes > -30 ):
                        elapsedMinutes > pendingExpirationPeriod;
                    if (late) {
                        hasNotified = true;
                        // console.log('NOTIFICATION  SENT');
                        // io.sockets.emit('notification', {
                        //     success: true,
                        //     data: tr,
                        //     msg: 'Pending Notification'
                        // });
                    }
                }
            });
        })
    }, 200);
});

// export trip data
app.get(config.urls.export__trip, (req, res, next) => {
	let conf = {};
	// define column headers
	conf.cols = [{
		// increasing count; from 0
		caption: 'No',
		type: 'number',
		width: 4
	}, {
		// call time
		caption: 'Call Time',
		type: 'string',
		width: 15
	}, {
		// arrival time
		caption: 'Arrival Time',
		type: 'string',
		width: 15
	}, {
		// call accepted by (a dispatcher's name)
		caption: 'Call Accepted By',
		type: 'string',
		width: 30
	}, {
		// starting location
		caption: 'Starting Location',
		type: 'string',
		width: 50
	}, {
		// destination location
		caption: 'Destination Location',
		type: 'string',
		width: 50
	}, {
		// driver name
		caption: 'Driver Name',
		type: 'string',
		width: 50
	}, {
		// driver phone
		caption: 'Driver Phone',
		type: 'string',
		width: 50
	}, {
		// customer name
		caption: 'Customer Name',
		type: 'string',
		width: 50
	}, {
		// customer phone
		caption: 'Customer Phone',
		type: 'string',
		width: 50
	}, {
		// km
		caption: 'KM',
		type: 'string',
		width: 10
	}, {
		// price
		caption: 'Price',
		type: 'string',
		width: 15
	}, {
		// ETTA fee
		caption: 'ETTA FEE',
		type: 'string',
		width: 15
	}, {
		// total price
		caption: 'Total Price',
		type: 'string',
		width: 15
	}, {
		// type of trip (cash/credit)
		caption: 'Trip Type',
		type: 'string',
		width: 20
	}, {
		// collected/not collected
		caption: 'Collection',
		type: 'string',
		width: 30
	}];
	tripService.getAllTrips()
		.then(data => {
			let rowCount = 0;
			conf.rows = [];
			data.data.map(trip => {
				conf.rows.push([
					++rowCount,
					trip.call_time,
					trip.time_arrived,
					trip.accepted_by ? trip.accepted_by.name : '-',
					trip.starting_location ? trip.starting_location.name : '-',
					trip.destination_location ? trip.destination_location.name : '-',
					trip.driver ? trip.driver.name : '-',
					trip.driver.phone,
					trip.customer ? trip.customer.name : '-',
					trip.customer ? trip.customer.phone : '-',
					trip.km,
					trip.price,
					trip.et_fee,
					trip.total_price,
					"cash",
					trip.collected ? 'collected' : '-'
				])
			});
			excelExport.executeAsync(conf, (file) => {
				res.setHeader('Content-Type', 'application/vnd.openxmlformates');
				res.setHeader('Content-Disposition', 'attachement; filename=' + 'trips.xlsx');
				res.end(file, 'binary')
			})
		})
});
// export customer data
app.get(config.urls.export__customer, (req, res, next) => {
	let conf = {};
	// define column headers
	conf.cols = [{
		// increasing count; from 0
		caption: 'No',
		type: 'number',
		width: 4
	}, {
		caption: 'Name',
		type: 'string',
		width: 30
	}, {
		caption: 'Phone',
		type: 'string',
		width: 30
	}, {
		caption: 'Email',
		type: 'string',
		width: 30
	}, {
		caption: 'Password',
		type: 'string',
		width: 40
	}];
	customerService.getCustomerUsers()
		.then(data => {
			let rowCount = 0;
			conf.rows = [];
			data.data.map(customer => {
				conf.rows.push([
					++rowCount,
					customer.name,
					customer.phone,
					customer.email ? customer.email : '-',
					customer.password
				])
			});
			excelExport.executeAsync(conf, (file) => {
				res.setHeader('Content-Type', 'application/vnd.openxmlformates');
				res.setHeader('Content-Disposition', 'attachement; filename=' + 'customers.xlsx');
				res.end(file, 'binary')
			})
		})
});
// export driver users
app.get(config.urls.export__driver, (req, res, next) => {
	let conf = {};
	// define column headers
	conf.cols = [{
		// increasing count; from 0
		caption: 'No',
		type: 'number',
		width: 4
	}, {
		caption: 'Name',
		type: 'string',
		width: 30
	}, {
		caption: 'Phone',
		type: 'string',
		width: 30
	}, {
		caption: 'Email',
		type: 'string',
		width: 30
	}];
	driverService.getDriverUsers()
		.then(data => {
			let rowCount = 0;
			conf.rows = [];
			data.data.map(driver => {
				conf.rows.push([
					++rowCount,
					driver.name,
					driver.phone,
					driver.email ? driver.email : '-'
				])
			});
			excelExport.executeAsync(conf, (file) => {
				res.setHeader('Content-Type', 'application/vnd.openxmlformates');
				res.setHeader('Content-Disposition', 'attachement; filename=' + 'customers.xlsx');
				res.end(file, 'binary')
			})
		})
});
// export dispatcher users
app.get(config.urls.export__dispatcher, (req, res, next) => {
	let conf = {};
	// define column headers
	conf.cols = [{
		// increasing count; from 0
		caption: 'No',
		type: 'number',
		width: 4
	}, {
		caption: 'Name',
		type: 'string',
		width: 30
	}, {
		caption: 'Phone',
		type: 'string',
		width: 30
	}, {
		caption: 'Email',
		type: 'string',
		width: 30
	}, {
		caption: 'Working Hours',
		type: 'string',
		width: 30
	}];
	dispatcherService.getDispatcherUsers()
		.then(data => {
			let rowCount = 0;
			conf.rows = [];
			data.data.map(dispatcher => {
				conf.rows.push([
					++rowCount,
					dispatcher.name,
					dispatcher.phone,
					dispatcher.email ? dispatcher.email : '-',
					dispatcher.working_hours ? dispatcher.working_hours : '-'
				])
			});
			excelExport.executeAsync(conf, (file) => {
				res.setHeader('Content-Type', 'application/vnd.openxmlformates');
				res.setHeader('Content-Disposition', 'attachement; filename=' + 'customers.xlsx');
				res.end(file, 'binary')
			})
		})
});
// export supervisor users
app.get(config.urls.export__supervisor, (req, res, next) => {
	let conf = {};
	// define column headers
	conf.cols = [{
		// increasing count; from 0
		caption: 'No',
		type: 'number',
		width: 4
	}, {
		caption: 'Name',
		type: 'string',
		width: 30
	}, {
		caption: 'Phone',
		type: 'string',
		width: 30
	}, {
		caption: 'Email',
		type: 'string',
		width: 30
	}, {
		caption: 'Password',
		type: 'string',
		width: 40
	}];
	supervisorService.getSupervisorUsers()
		.then(data => {
			let rowCount = 0;
			conf.rows = [];
			data.data.map(supervisor => {
				conf.rows.push([
					++rowCount,
					supervisor.name,
					supervisor.phone,
					supervisor.email ? supervisor.email : '-',
					supervisor.password
				])
			});
			excelExport.executeAsync(conf, (file) => {
				res.setHeader('Content-Type', 'application/vnd.openxmlformates');
				res.setHeader('Content-Disposition', 'attachement; filename=' + 'customers.xlsx');
				res.end(file, 'binary')
			})
		})
});
// export admin users
app.get(config.urls.export__admin, (req, res, next) => {
	let conf = {};
	// define column headers
	conf.cols = [{
		// increasing count; from 0
		caption: 'No',
		type: 'number',
		width: 4
	}, {
		caption: 'Name',
		type: 'string',
		width: 30
	}, {
		caption: 'Phone',
		type: 'string',
		width: 30
	}, {
		caption: 'Email',
		type: 'string',
		width: 30
	}, {
		caption: 'Password',
		type: 'string',
		width: 40
	}];
	adminService.getAdminUsers()
		.then(data => {
			let rowCount = 0;
			conf.rows = [];
			data.data.map(admin => {
				conf.rows.push([
					++rowCount,
					admin.name,
					admin.phone,
					admin.email ? admin.email : '-',
					admin.password
				])
			});
			excelExport.executeAsync(conf, (file) => {
				res.setHeader('Content-Type', 'application/vnd.openxmlformates');
				res.setHeader('Content-Disposition', 'attachement; filename=' + 'customers.xlsx');
				res.end(file, 'binary')
			})
		})
});

// export admin users
app.get(config.urls.export__corporate_client, (req, res, next) => {
	let conf = {};
	// define column headers
	conf.cols = [{
		// increasing count; from 0
		caption: 'No',
		type: 'number',
		width: 4
	}, {
		caption: 'Name',
		type: 'string',
		width: 30
	}, {
		caption: 'Phone',
		type: 'string',
		width: 30
	}, {
		caption: 'Email',
		type: 'string',
		width: 30
	}, {
		caption: 'Price Deal',
		type: 'string',
		width: 15
	}, {
		caption: 'Night Deal',
		type: 'string',
		width: 15
	}, {
		caption: 'Card No',
		type: 'string',
		width: 15
	}, {
		caption: 'Address',
		type: 'string',
		width: 15
	}];
	corporateClientService.getCorporateClients()
		.then(data => {
			let rowCount = 0;
			conf.rows = [];
			data.data.map(corporateClient => {
				conf.rows.push([
					++rowCount,
					corporateClient.name,
					corporateClient.phone,
					corporateClient.email ? corporateClient.email : '-',
					corporateClient.price_deal ? corporateClient.price_deal : '-',
					corporateClient.night_deal ? corporateClient.night_deal : '-',
					corporateClient.card_number ? corporateClient.card_number : '-',
					corporateClient.address ? corporateClient.address : '-'
				])
			});
			excelExport.executeAsync(conf, (file) => {
				res.setHeader('Content-Type', 'application/vnd.openxmlformates');
				res.setHeader('Content-Disposition', 'attachement; filename=' + 'customers.xlsx');
				res.end(file, 'binary')
			})
		})
});
exports.io = io;

