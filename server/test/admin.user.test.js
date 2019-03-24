let config = require('../config')
let fetch = require('node-fetch');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = config.server.remote
let should = chai.should();

chai.use(chaiHttp);

describe('Admin User', () => {
    describe('/user/admin', () => {
        // fetch all active admin users
        it('it should fetch active admin users', done => {
            chai.request(server)
                .get('/api/v1/user/admin')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
        // add an admin user
        it('it should add an admin user', (done) => {
            let rand = Math.random() * 10000
            let user = {
                "name": "feleqech",
                "email": `feleqech${rand}@gmail.com`,
                "phone": "0900000000",
                "password": "byefeleqech"
            }
            chai.request(server)
                .post(config.urls.admin)
                .set('Content-Type', 'application/json; charset=utf-8')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 201)
                    res.body.data.should.be.a('object')
                    res.body.data.should.have.property('_id')
                    res.body.data.should.have.property('name')
                    res.body.data.should.have.property('email')
                    res.body.data.should.have.property('password')
                    done();
                });
        })
    })

});