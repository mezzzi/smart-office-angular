let fetch = require('node-fetch');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let config = require('../config')
let server = config.server.local

chai.use(chaiHttp);

describe('User', () => {
    describe('/user', () => {
        // fetch all active admin users
        it('it should fetch active users', done => {
            chai.request(server)
                .get('/api/v1/user')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('status', 200)
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array')
                    done()
                })
        })
    });
});