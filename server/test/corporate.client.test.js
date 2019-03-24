let config = require('../config')
let fetch = require('node-fetch');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = config.server.local
let should = chai.should();

chai.use(chaiHttp);

describe("Corporate", () => {

    /*
     * Test the /GET route
     */
    describe("/GET corporate", () => {
        it('it should GET all corporate clients', (done) => {
            chai.request(server)
                .get(config.urls.corporate)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("Object");
                    res.body.data.should.be.a("array");
                    res.body.should.have.property("status");
                    res.body.should.have.property("data");
                    done();
                })
        })


        it("it should GET corporate by the given name", (done) => {
            // create test corporate with required data
            let rand = Math.random() * 1000;
            let corporate = {
                "name": `testcorporate${rand}`,
                "email": `testcorporateemail${rand}@example.com`,
                "address": "Kazanchis",
                "price_deal": "19",
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.corporate, {
                    method: "POST",
                    body: JSON.stringify(corporate),
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    }
                })
                .then(res => res.json())
                .then(response => {
                    chai.request(server)
                        .get(`${config.urls.corporate}/` + response.body.data.name)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("object");
                            res.body.should.have.property("status");
                            res.body.should.have.property("data");
                            res.body.data.should.have.property("name", corporate.name)
                            res.body.data.should.have.property("address", corporate.address)
                            res.body.data.should.have.property("phone", corporate.phone)
                            res.body.data.should.have.property("price_deal", corporate.price_deal)
                            done();
                        })
                })
                .catch((error) => {
                    // assert.isNotOk(error, 'Promise error');
                })
        })


        it("it should not GET corporate with no proper name", (done) => {
            let rand = Math.random() * 1000;
            let corporate = {
                "name": `testcorporate${rand}`,
                "email": `testcorporateemail${rand}@example.com`,
                "address": "Kazanchis",
                "price_deal": "19",
                "phone": `${rand}56789`
            }
            fetch(server + config.urls.corporate, {
                    method: "POST",
                    body: JSON.stringify(corporate),
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    }
                })
                .then(res => res.json())
                .then(res => {
                    chai.request(server)
                        .get(`${config.urls.corporate}/` + "failTest")
                        .end((err, res) => {
                            res.should.have.status(404);
                            res.body.should.be.a("object");
                            res.body.should.have.property("msg", "no corpo found");
                            done();
                        })
                })
        })
    })

});

describe("/POST corporate", () => {
    it("it should POST corporate with proper fields", (done) => {
        let rand = Math.random() * 1000;
        let corporate = {
            "name": `testcorporate${rand}`,
            "email": `testcorporateemail${rand}@example.com`,
            "address": "Kazanchis",
            "price_deal": "19",
            "phone": `${rand}56789`
        }
        chai.request(server)
            .post(config.urls.corporate)
            .set("Content-Type", "application/json; charset=UTF-8")
            .send(corporate)
            .end((err, res) => {
                res.should.have.status(201);
                res.should.be.a("object");
                res.body.should.have.property("status")
                res.body.should.have.property("data")
                res.body.should.have.property("success", true)
                res.body.data.should.have.property("name", corporate.name)
                res.body.data.should.have.property("address", corporate.address)
                res.body.data.should.have.property("phone", corporate.phone)
                res.body.data.should.have.property("price_deal", corporate.price_deal)
                done();
            })
    })

    it("it should not POST corporate with missing fields", (done) => {
        let rand = Math.random() * 1000;
        let corporate = {
            "name": "test",
            "phone": `${rand}56789`
        }
        chai.request(server)
            .post(config.urls.corporate)
            .set("Content-Type", "application/json; charset=UTF-8")
            .send(corporate)
            .end((err, res) => {
                res.should.have.status(400);
                res.should.be.a("object");
                res.body.should.have.property("status");
                res.body.should.have.property("msg").eql("incomplete request body, some fields missing");
                done();
            })
    })

})

describe("/DELETE corporate", () => {
    it("should not DELETE corporate with invalid id", (done) => {
        let rand = Math.random() * 1000;
        let corporate = {
            "name": `testcorporate${rand}`,
            "email": `testcorporateemail${rand}@example.com`,
            "address": "Kazanchis",
            "price_deal": "19",
            "phone": `${rand}56789`
        }
        fetch(server + config.urls.corporate, {
                method: "POST",
                body: JSON.stringify(corporate),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
            .then(res => res.json())
            .then(res => {
                chai.request(server)
                    .delete(`${config.urls.corporate}/` + rand)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.be.a("object");
                        res.body.should.have.property("status")
                        res.body.should.have.property("msg").eql("not Valid id");
                        done();
                    })
            })
    })

    it("should DELETE corporate with valid and proper id", (done) => {
        let rand = Math.random() * 1000;
        let corporate = {
            "name": `testcorporate${rand}`,
            "email": `testcorporateemail${rand}@example.com`,
            "address": "Kazanchis",
            "price_deal": "19",
            "phone": `${rand}56789`
        }
        fetch(server + config.urls.corporate, {
                method: "POST",
                body: JSON.stringify(corporate),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
            .then(res => res.json())
            .then(res => {
                chai.request(server)
                    .delete(`${config.urls.corporate}/` + res.body._id)
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

describe("/PUT corporate", () => {
    let updatedSupervisor = {
        "name": "updatedTestName",
        "email": `updatedtestemail@example.com`,
    }

    it("should not UPDATE corporate with invalid id", (done) => {
        let rand = Math.random() * 1000;
        let corporate = {
            "name": `testcorporate${rand}`,
            "email": `testcorporateemail${rand}@example.com`,
            "address": "Kazanchis",
            "price_deal": "19",
            "phone": `${rand}56789`
        }
        fetch(server + config.urls.corporate, {
                method: "POST",
                body: JSON.stringify(corporate),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
            .then(res => res.json())
            .then(res => {
                chai.request(server)
                    .put(`${config.urls.corporate}/` + rand)
                    .send(updatedSupervisor)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property("status");
                        res.body.should.have.property("msg").eql("corporate not found")
                        done();
                    })
            })
    })

    it("should UPDATE corporate with valid id", (done) => {
        let rand = Math.random() * 1000;
        let corporate = {
            "name": `testcorporate${rand}`,
            "email": `testcorporateemail${rand}@example.com`,
            "address": "Kazanchis",
            "price_deal": "19",
            "phone": `${rand}56789`
        }
        fetch(server + config.urls.corporate, {
                method: "POST",
                body: JSON.stringify(corporate),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            })
            .then(res => res.json())
            .then(res => {
                chai.request(server)
                    .put(`${config.urls.corporate}/` + res.body._id)
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