let config = require('../config')
let fetch = require('node-fetch');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = config.server.local
let should = chai.should();

chai.use(chaiHttp);

describe("Location", () => {
    /*
    * Test the /GET route
    */
    describe("/GET locations", () => {
        it("it should GET all the locations", (done) => {
            chai.request(server)
                .get(config.urls.location)
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

    describe("/GET/:name location", () => {
        it("it should GET location by the given id", (done) => {
            // create test location with required data
            let rand = Math.random() * 1000;
            let location = {
                "name": `testLocation${rand}`,
                "short_name":"tst",
                "city": `Addis Ababa`,
                "latitude":`12.3${rand}`,
                "longitude":`45.6${rand}`   
            }
            fetch(server + config.urls.location, {
                method: "POST",
                body: JSON.stringify(location),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .get(`${config.urls.location}/` + response.body.data.name)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.should.have.property("name", location.name)
                            res.body.data.should.have.property("city", location.city)
                            res.body.data.should.have.property("latitude", location.latitude)
                            res.body.data.should.have.property("longitude", location.longitude)
                            done();
                        })
                })
                .catch((error) => {
                    // assert.isNotOk(error, 'Promise error');
                })
            done()
        });

        it("it should not GET location with no proper name", (done) => {
            let rand = Math.random() * 1000;
            let location = {
                "name": `testLocation${rand}`,
                "short_name":"tst",
                "city": `Addis Ababa`,
                "latitude":`12.3${rand}`,
                "longitude":`45.6${rand}`   
            }
            fetch(server + config.urls.location, {
                method: "POST",
                body: JSON.stringify(location),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .get(`${config.urls.location}/` + "failTest")
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a("object");
                            res.body.should.have.property("msg", "no users found");
                            done();
                        })
                })
        })
    });

    describe("/POST location", () => {
        it("it should POST location with proper fields", (done) => {
            let rand = Math.random() * 1000;
            let location = {
                "name": `testLocation${rand}`,
                "short_name":"tst",
                "city": `Addis Ababa`,
                "latitude":`12.3${rand}`,
                "longitude":`45.6${rand}` 
            }
            chai.request(server)
                .post(config.urls.location)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(location)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.should.be.a("object");
                    res.body.should.have.property("status")
                    res.body.should.have.property("data")
                    res.body.should.have.property("success", true)
                    res.body.data.should.have.property("name", location.name)
                    res.body.data.should.have.property("city", location.city)
                    res.body.data.should.have.property("latitude", location.latitude)
                    res.body.data.should.have.property("longitude", location.longitude)
                    done();
                })
        })

        it("it should not POST location with missing fields", (done) => {
            let rand = Math.random() * 1000;
            let location = {
                "name": "test",
                "phone": `${rand}56789`
            }
            chai.request(server)
                .post(config.urls.location)
                .set("Content-Type", "application/json; charset=UTF-8")
                .send(location)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.should.be.a("object");
                    res.body.should.have.property("status");
                    res.body.should.have.property("msg").eql("incomplete request body, some fields missing");
                    done();
                })
        })

    })

    describe("/DELETE location", () => {
        it("should not DELETE location with invalid id", (done) => {
            let rand = Math.random() * 1000;
            let location = {
                "name": `testLocation${rand}`,
                "short_name":"tst",
                "city": `Addis Ababa`,
                "latitude":`12.3${rand}`,
                "longitude":`45.6${rand}` 
            }
            fetch(server + config.urls.location, {
                method: "POST",
                body: JSON.stringify(location),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .delete(`${config.urls.location}/` + rand)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status")
                            res.body.should.have.property("msg").eql("not Valid id");
                            done();
                        })
                })
        })

        it("should DELETE location with valid and proper id", (done) => {
            let rand = Math.random() * 1000;
            let location = {
                "name": `testLocation${rand}`,
                "short_name":"tst",
                "city": `Addis Ababa`,
                "latitude":`12.3${rand}`,
                "longitude":`45.6${rand}` 
            }
            fetch(server + config.urls.location, {
                method: "POST",
                body: JSON.stringify(location),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .delete(`${config.urls.location}/` + res.body._id)
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.should.have.property("location_status", "inactive")
                            done();
                        })
                })
        })

    })

    describe("/PUT location", () => {
        let rand = Math.random() * 1000;
        let updatedSupervisor = {
            "name": "updatedTestName",
            "latitude": `updatedlatitude${rand}`,
        }

        it("should not UPDATE location with invalid id", (done) => {
            let location = {
                "name": `testLocation${rand}`,
                "short_name":"tst",
                "city": `Addis Ababa`,
                "latitude":`12.3${rand}`,
                "longitude":`45.6${rand}`
            }
            fetch(server + config.urls.location, {
                method: "POST",
                body: JSON.stringify(location),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .put(`${config.urls.location}/` + rand)
                        .send(updatedSupervisor)
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.have.property("status");
                            res.body.should.have.property("msg").eql("location not found")
                            done();
                        })
                })
        })

        it("should  UPDATE location with valid id", (done) => {
            let rand = Math.random() * 1000;
            let location = {
                "name": `testLocation${rand}`,
                "short_name":"tst",
                "city": `Addis Ababa`,
                "latitude":`12.3${rand}`,
                "longitude":`45.6${rand}`
            }
            fetch(server + config.urls.location, {
                method: "POST",
                body: JSON.stringify(location),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .put(`${config.urls.location}/` + res.body._id)
                        .send(updatedSupervisor)
                        .end((err, res) => {
                            res.should.have.status(201);
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.should.have.property("latitude", location.latitude)
                            res.body.data.should.have.property("name", location.name)
                            done();
                        })
                })
        })
    })
});

