let config = require('../config')
let fetch = require('node-fetch');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let server = config.server.local

chai.use(chaiHttp);

describe('Dispatcher User', () => {
    describe('/user/dispatcher', () => {
        // test to fetch all active dispatcher users
        it('it should fetch active dispatchers', done => {
            chai.request(server)
                .get(config.urls.dispatcher)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
        // test to add a dispatcher user
        it('it should add a dispatcher', () => {
            let rand = Math.random() * 10000
            let dispatcher = {
                "name": "testdispatcher",
                "email": `dispatcher${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000",
                "working_hours": {
                    "start": "6:30 AM",
                    "end": "3:30 PM"
                }
            }
            chai.request(server)
                .post(config.urls.dispatcher)
                .set('Content-Type', 'application/json; charset=utf-8')
                .send(dispatcher)
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 201)
                    res.body.should.have.property('success', true)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('object')
                    res.body.data.should.have.property('name', dispatcher.name)
                    res.body.data.should.have.property('email', dispatcher.email)
                    res.body.data.should.have.property('phone', dispatcher.phone)
                    res.body.data.should.have.property('password')
                    res.body.data.should.have.property('working_hours')
                })
        })
        it('it should not add a dispatcher user with incomplete request body fields', () => {
            chai.request(server)
                .post(config.urls.dispatcher)
                .set('Content-Type', 'application/json; charset=utf-8')
                .send({})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 400)
                    res.body.should.have.property('success', false)
                })

        })
        // test to remove a dispatcher user        
        it('it should change account_status of a dispatcher user', () => {
            let rand = Math.random() * 10000
            let dispatcher = {
                "name": "testdispatcher",
                "email": `dispatcher${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000",
                "working_hours": {
                    "start": "6:30 AM",
                    "end": "3:30 PM"
                }
            }
            fetch(server + config.urls.dispatcher, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(dispatcher)
            })
                .then(res => { res.json() })
                .then(response => {
                    chai.request(server)
                        .del(`${config.urls.dispatcher}/${response.data._id}`)
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.have.property('success', false)
                            res.body.should.be.a('object')
                            res.body.should.have.property('status', 200)
                            res.body.should.have.property('data')
                            res.body.data.should.have.property('account_status', 'inactive')
                        })
                })
        })
        it('it should change account_status of a dispatcher user', () => {
            chai.request(server)
                .del(`${config.urls.dispatcher}/0`)
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.have.property('success', false)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 404)
                })
        })
        // test to update dispatcher user 
        it('it should update dispatcher user', () => {
            let rand = Math.random() * 10000
            let dispatcher = {
                "name": "testdispatcher",
                "email": `dispatcher${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000",
                "working_hours": {
                    "start": "6:30 AM",
                    "end": "3:30 PM"
                }
            }
            let updatedDispatcher = {
                "name": "updatedDispatcher",
                "email": `dispatcher${rand}@gmail.com`,
                "password": "updatedPassword",
                "phone": "0900000001",
                "working_hours": {
                    "start": "8:30 AM",
                    "end": "4:30 PM"
                }
            }
            fetch(server + config.urls.dispatcher, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(dispatcher)
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .post(`${config.urls.dispatcher}/${response.data._id}`)
                        .set('Content-Type', 'application/json; charset=utf-8')
                        .send(updatedDispatcher)
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.have.property('success', false)
                            res.body.should.be.a('object')
                            res.body.should.have.property('status', 200)
                            res.body.should.have.property('data')
                            res.body.data.should.have.property('email', updatedDispatcher.email)
                            res.body.data.should.have.property('phone', updatedDispatcher.phone)
                            res.body.data.should.have.property('working_hours', updatedDispatcher.working_hours)
                            res.body.data.should.have.property('name', updatedDispatcher.name)
                        })
                })
        })
        // test to search dispatcher users by name
        it('it should fetch dispatcher users starting with the specified name', () => {
            let rand = Math.random() * 10000
            let dispatcher = {
                "name": "testdispatcher",
                "email": `dispatcher${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000",
                "working_hours": {
                    "start": "6:30 AM",
                    "end": "3:30 PM"
                }
            }
            fetch(server + config.urls.dispatcher, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(dispatcher)
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                    .get(`${config.urls.dispatcher}/${dispatcher.name}`)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.a('object')
                        res.body.should.have.property('data')
                        res.body.data.should.be.a('array')
                        res.body.data.length.should.be.greaterThan(1)
                    })
                })

        })
        // test to set dispatcher schedule
        it('it should set dispatcher schedule', () => {
            let rand = Math.random() * 10000
            let dispatcher = {
                "name": "testdispatcher",
                "email": `dispatcher${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000",
                "working_hours": {
                    "start": "6:30 AM",
                    "end": "3:30 PM"
                }
            }
            let updatedSchedule = {
                "working_hours": {
                    "start": "8:30 AM",
                    "end": "4:30"
                }
            }
            fetch(server + config.urls.dispatcher, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(dispatcher)
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                    .put(`${config.urls.dispatcher}/${response.data._id}`)
                    .send(updatedSchedule)
                    .end((err, res) => {
                        res.should.have.status(201)
                        res.body.should.be.a('object')
                        res.body.should.have.property('data')
                        res.body.data.should.be.a('object')
                        res.body.data.should.have.property('working_hours', updatedSchedule.working_hours)
                    })
                })
        })
    })
})