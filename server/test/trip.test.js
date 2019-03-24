const config = require('../config')
const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()
const server = config.server.local
chai.use(chaiHttp)
describe('Trip', () => {
    describe('/GET', () => {
        // fetch all active trips
        it('it should fetch all active trips', done => {
            chai.request(server)
                .get(config.urls.trip)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
        // fetch montly report
        it('it should fetch all active trips within a month', done => {
            chai.request(server)
                .get(config.urls.trip + '/report/month')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
        // fetch weekly report
        it('it should fetch all active trips within a week', done => {
            chai.request(server)
                .get(config.urls.trip + '/report/week')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
        // fetch daily report
        it('it should fetch all active trips within a week', done => {
            chai.request(server)
                .get(config.urls.trip + '/report/week')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
    })
    describe('/POST /PUT', () => {
        // add a trip
        it('it should add a trip', done => {
            chai.request(server)
                .post(config.urls.trip)
                .set('Content-Type', 'application/json; charset=UTF-8')
                .send({
                    "customer": {},
                    "trip": {},
                    "driver": {},
                    "price": "",
                    "call_time": "",
                    "confirmation": "",
                    "et_fee": "",
                    "trip_status": "",
                    "km": "",
                    "ass_code": ""
                })
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 201)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('object')
                    done()
                })
        })
        // update a trip
        it('it should update a trip', done => {
            let trip = {
                "customer": {},
                "trip": {},
                "driver": {},
                "price": "",
                "call_time": "",
                "confirmation": "",
                "et_fee": "",
                "trip_status": "",
                "km": "",
                "ass_code": ""
            }
            let updatedTrip = {
                "trip_status": config.trip_status.ACCEPTED
            }
            fetch(server + config.urls.trip, {
                method: "POST",
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: trip
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .post(config.urls.trip)
                        .set('Content-Type', 'application/json; charset=UTF-8')
                        .send(updatedTrip)
                        .end((err, res) => {
                            res.should.have.status(201)
                            res.body.should.be.a('object')
                            res.body.should.have.property('status', 201)
                            res.body.should.have.property('data')
                            res.body.data.should.be.a('object')
                            res.body.data.should.have.property('trip_status', config.trip_status.ACCEPTED)
                            done()
                        })
                })

        })
        // get a trip by id
        it('it should update a trip', done => {
            let trip = {
                "customer": {},
                "trip": {},
                "driver": {},
                "price": "",
                "call_time": "",
                "confirmation": "",
                "et_fee": "",
                "trip_status": "",
                "km": "",
                "ass_code": ""
            }
            fetch(server + config.urls.trip, {
                method: "POST",
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: trip
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .get(config.urls.trip + '/' + response.data._id)
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.be.a('object')
                            res.body.should.have.property('status', 200)
                            res.body.should.have.property('data')
                            res.body.data.should.be.a('object')
                            res.body.data.should.have.property('_id', response.data._id)
                            done()
                        })
                })

        })
    })
    describe('/DELETE', () => {
        // delete a trip
        it('it should update a trip', done => {
            let trip = {
                "customer": {},
                "trip": {},
                "driver": {},
                "price": "",
                "call_time": "",
                "confirmation": "",
                "et_fee": "",
                "trip_status": "",
                "km": "",
                "ass_code": ""
            }
            fetch(server + config.urls.trip, {
                method: "POST",
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: trip
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .del(config.urls.trip + '/' + response.data._id)
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.be.a('object')
                            res.body.should.have.property('status', 200)
                            res.body.should.have.property('data')
                            res.body.data.should.be.a('object')
                            res.body.data.should.have.property('status', 'inactive')
                            done()
                        })
                })

        })
    })
})