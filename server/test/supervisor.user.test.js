let fetch = require("node-fetch")
let config = require('../config')
let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
let server = config.server.local

chai.use(chaiHttp);

describe("Supervisor", () => {
    /*
    * Test the /GET route
    */
    describe("/GET supervisors", () => {
        it("it should GET all the supervisors", (done) => {
            chai.request(server)
                .get(config.urls.supervisor)
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

    describe("/GET/:name supervisor", () => {
        it("it should GET supervisor by the given id", (done) => {
            // create test supervisor with required data
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.supervisor, {
                method: "POST",
                body: JSON.stringify({
                    "name": `test${rand}`,
                    "email": `testemail${rand}@example.com`,
                    "password": `testpassword${rand}`,
                    "phone": `${rand}56789`
                }),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .get(`${config.urls.supervisor}/` + response.body.data.name)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            done();
                        })
                })
                .catch((error) => {
                    // assert.isNotOk(error, 'Promise error');
                })
            done()
        });

        it("it should not GET supervisor with no proper name", (done) => {
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.supervisor, {
                method: "POST",
                body: JSON.stringify(supervisor),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .get(`${config.urls.supervisor}/` + "failTest")
                        .end((err, res) => {
                            console.log(res)
                            res.should.have.status(404);
                            res.body.should.be.a("object");
                            res.body.should.have.property("msg").eql("no user found");
                            done();
                        })
                })
        })
    });

    describe("/POST supervisor", () => {
        it("it should POST supervisor with proper fields", (done) => {
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            chai.request(server)
                .post(config.urls.supervisor)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(supervisor)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.should.be.a("object");
                    res.body.should.have.property("status")
                    res.body.should.have.property("data")
                    res.body.should.have.property("success", true)
                    done();
                })
        })

        it("it should not POST supervisor with missing fields", (done) => {
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": "test",
                "phone": `${rand}56789`
            }
            chai.request(server)
                .post(config.urls.supervisor)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(supervisor)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.be.a("object");
                    res.body.should.have.property("status");
                    res.body.should.have.property("msg").eql("incomplete request body");
                    done();
                })
        })

    })

    describe("/DELETE supervisosr", () => {
        it("should not DELETE supervisor with invalid proper id", (done) => {
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.supervisor, {
                method: "POST",
                body: JSON.stringify(supervisor),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .delete(`${config.urls.supervisor}/` + response.data._id)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status")
                            res.body.should.have.property("msg").eql("invalid id");
                            done();
                        })
                })
        })

        it("should DELETE supervisor with valid and proper id", (done) => {
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.supervisor, {
                method: "POST",
                body: JSON.stringify(supervisor),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .delete(`${config.urls.supervisor}/` + response.body._id)
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.account_status.eql("inactive")
                            done();
                        })
                })
        })

    })

    describe("/PUT supervisor", () => {
        let updatedSupervisor = {
            "name": "updatedTestName",
            "email": `updatedtestemail@example.com`,
        }

        it("should not UPDATE supervisor with invalid id", (done) => {
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.supervisor, {
                method: "POST",
                body: JSON.stringify(supervisor),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .put(`${config.urls.supervisor}/` + rand)
                        .send(updatedSupervisor)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.have.property("status");
                            res.body.should.have.property("msg").eql("supervisor not found")
                            done();
                        })
                })
        })

        it("should  UPDATE supervisor with valid id", (done) => {
            let rand = Math.random() * 1000;
            let supervisor = {
                "name": `test${rand}`,
                "email": `testemail${rand}@example.com`,
                "password": `testpassword${rand}`,
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.supervisor, {
                method: "POST",
                body: JSON.stringify(supervisor),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .put(`${config.urls.supervisor}/` + response.body._id)
                        .set('Content-Type', 'application/json; charset=UTF-8')
                        .send(updatedSupervisor)
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.email.eql(updatedSupervisor.email)
                            res.body.data.name.eql(updatedSupervisor.name)
                            done();
                        })
                })
        })
    })
});

