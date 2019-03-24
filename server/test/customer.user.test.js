let config = require('../config')
let fetch = require('node-fetch');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let server = config.server.local

chai.use(chaiHttp);

describe('Customer User', () => {
    describe('/user/customer', () => {
        // test to fetch all active customer users
        it('it should fetch active customers', done => {
            chai.request(server)
                .get(config.urls.customer)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
        // test to add a customer user
        it('it should add a customer', () => {
            let rand = Math.random() * 10000
            let customer = {
                "name": "testcustomer",
                "email": `customer${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000"
            }
            chai.request(server)
                .post(config.urls.customer)
                .set('Content-Type', 'application/json; charset=utf-8')
                .send(customer)
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 201)
                    res.body.should.have.property('success', true)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('object')
                    res.body.data.should.have.property('name', customer.name)
                    res.body.data.should.have.property('email', customer.email)
                    res.body.data.should.have.property('phone', customer.phone)
                    res.body.data.should.have.property('password')
                })
        })
        it('it should not add a customer user with incomplete request body fields', () => {
            chai.request(server)
                .post(config.urls.customer)
                .set('Content-Type', 'application/json; charset=utf-8')
                .send({})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 400)
                    res.body.should.have.property('success', false)
                })

        })
        // test to remove a customer user        
        it('it should change account_status of a customer user', () => {
            let rand = Math.random() * 10000
            let customer = {
                "name": "testcustomer",
                "email": `customer${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000",
                
            }
            fetch(server + config.urls.customer, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(customer)
            })
                .then(res => { res.json() })
                .then(response => {
                    chai.request(server)
                        .del(`${config.urls.customer}/${response.data._id}`)
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
        it('it should change account_status of a customer user', () => {
            chai.request(server)
                .del(`${config.urls.customer}/0`)
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.have.property('success', false)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 404)
                })
        })
        // test to update customer user 
        it('it should update customer user', () => {
            let rand = Math.random() * 10000
            let customer = {
                "name": "testcustomer",
                "email": `customer${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000"
                
            }
            let updatedCustomer = {
                "name": "updatedCustomer",
                "email": `customer${rand}@gmail.com`,
                "password": "updatedPassword",
                "phone": "0900000001"
            }
            fetch(server + config.urls.customer, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(customer)
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .post(`${config.urls.customer}/${response.data._id}`)
                        .set('Content-Type', 'application/json; charset=utf-8')
                        .send(updatedCustomer)
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.have.property('success', false)
                            res.body.should.be.a('object')
                            res.body.should.have.property('status', 200)
                            res.body.should.have.property('data')
                            res.body.data.should.have.property('email', updatedCustomer.email)
                            res.body.data.should.have.property('phone', updatedCustomer.phone)
                            res.body.data.should.have.property('name', updatedCustomer.name)
                        })
                })
        })
        // test to search customer users by name
        it('it should fetch customer users starting with the specified name', () => {
            let rand = Math.random() * 10000
            let customer = {
                "name": "testcustomer",
                "email": `customer${rand}@gmail.com`,
                "password": "password",
                "phone": "0900000000"
                
            }
            fetch(server + config.urls.customer, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify(customer)
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .get(`${config.urls.customer}/${customer.name}`)
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.be.a('object')
                            res.body.should.have.property('data')
                            res.body.data.should.be.a('array')
                            res.body.data.length.should.be.greaterThan(1)
                        })
                })

        })
    })
})