let config = require('../config')
let fetch = require('node-fetch');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = config.server.local
let should = chai.should();

chai.use(chaiHttp);

describe("Driver", () => {
    /*
    * Test the /GET route
    */
    describe("/GET drivers", () => {
        it("it should GET all the drivers", (done) => {
            chai.request(server)
                .get(config.urls.driver)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("Object");
                    res.body.data.should.be.a("array");
                    res.body.should.have.property("status");
                    res.body.should.have.property("data");
                    done();
                });
        });
    });

    describe("/GET/:name driver", () => {
        it("it should GET driver by the given id", (done) => {
            // create test driver with required data
            let rand = Math.random() * 1000;
            let driver = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "plate_number":"AA-3-B12345",
                "card_number":"12341234AS",
                "working_hours":{
                    "start": "9AM",
                    "end":"7PM"
                },
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.driver, {
                method: "POST",
                body: JSON.stringify(driver),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .get(`${config.urls.driver}/` + response.body.data.name)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.should.have.property("name", driver.name)
                            res.body.data.should.have.property("email", driver.email)
                            res.body.data.should.have.property("phone", driver.phone)
                            done();
                        })
                })
                .catch((error) => {
                    // assert.isNotOk(error, 'Promise error');
                })
            done()
        });

        it("it should not GET driver with no proper name", (done) => {
            let rand = Math.random() * 1000;
            let driver = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "plate_number":"AA-3-B12345",
                "card_number":"12341234AS",
                "working_hours":{
                    "start": "9AM",
                    "end":"7PM"
                },
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.driver, {
                method: "POST",
                body: JSON.stringify(driver),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .get(`${config.urls.driver}/` + "failTest")
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a("object");
                            res.body.should.have.property("msg", "no users found");
                            done();
                        })
                })
        })
    });

    describe("/POST driver", () => {
        it("it should POST driver with proper fields", (done) => {
            let rand = Math.random() * 1000;
            let driver = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "plate_number":"AA-3-B12345",
                "card_number":"12341234AS",
                "working_hours":{
                    "start": "9AM",
                    "end":"7PM"
                },
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            chai.request(server)
                .post(config.urls.driver)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(driver)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.should.be.a("object");
                    res.body.should.have.property("status")
                    res.body.should.have.property("data")
                    res.body.should.have.property("success", true)
                    res.body.data.should.have.property("name", driver.name)
                    res.body.data.should.have.property("card_number", driver.card_number)
                    res.body.data.should.have.property("phone", driver.phone)
                    res.body.data.should.have.property("plate_number", driver.plate_number)
                    done();
                })
        })

        it("it should not POST driver with missing fields", (done) => {
            let rand = Math.random() * 1000;
            let driver = {
                "name": "test",
                "phone": `${rand}56789`
            }
            chai.request(server)
                .post(config.urls.driver)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(driver)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.be.a("object");
                    res.body.should.have.property("status");
                    res.body.should.have.property("msg").eql("incomplete request body, some fields missing");
                    done();
                })
        })

    })

    describe("/DELETE driver", () => {
        it("should not DELETE driver with invalid id", (done) => {
            let rand = Math.random() * 1000;
            let driver = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "plate_no":"AA-3-B12345",
                "card_number":"12341234AS",
                "working_hours":{
                    "start": "9AM",
                    "end":"7PM"
                },
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.driver, {
                method: "POST",
                body: JSON.stringify(driver),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .delete(`${config.urls.driver}/` + rand)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status")
                            res.body.should.have.property("msg").eql("not Valid id");
                            done();
                        })
                })
        })

        it("should DELETE driver with valid and proper id", (done) => {
            let rand = Math.random() * 1000;
            let driver = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "plate_no":"AA-3-B12345",
                "card_number":"12341234AS",
                "working_hours":{
                    "start": "9AM",
                    "end":"7PM"
                },
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.driver, {
                method: "POST",
                body: JSON.stringify(driver),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .delete(`${config.urls.driver}/` + res.body._id)
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.should.have.property("account_status", "inactive")
                            done();
                        })
                })
        })

    })

    describe("/PUT driver", () => {
        let updatedSupervisor = {
            "name": "updatedTestName",
            "email": `updatedtestemail@example.com`,
        }

        it("should not UPDATE driver with invalid id", (done) => {
            let rand = Math.random() * 1000;
            let driver = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "plate_no":"AA-3-B12345",
                "card_number":"12341234AS",
                "working_hours":{
                    "start": "9AM",
                    "end":"7PM"
                },
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.driver, {
                method: "POST",
                body: JSON.stringify(driver),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .put(`${config.urls.driver}/` + rand)
                        .send(updatedSupervisor)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.have.property("status");
                            res.body.should.have.property("msg").eql("driver not found")
                            done();
                        })
                })
        })

        it("should  UPDATE driver with valid id", (done) => {
            let rand = Math.random() * 1000;
            let driver = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "plate_no":"AA-3-B12345",
                "card_number":"12341234AS",
                "working_hours":{
                    "start": "9AM",
                    "end":"7PM"
                },
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.driver, {
                method: "POST",
                body: JSON.stringify(driver),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .put(`${config.urls.driver}/` + res.body._id)
                        .send(updatedSupervisor)
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.email.eql("updatedtestemail@example.com")
                            res.body.data.name.eql("updatedTestName")
                            done();
                        })
                })
        })
    })
});

