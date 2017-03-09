'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const url = `http://localhost:${process.env.PORT}`;


const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};
const updatedUser = {
  username: 'updateduser',
  password: '1234',
  email: 'exampleuser@test.com'
};
const invalidUser = {
  username: 1,
  password: '1234',
  email: 'exampleuser@test.com'
};
const exampleGallery = {
  name: 'test gallery',
  desc: 'test gallery description'
};

describe('Gallery Routes', function() {
  afterEach(done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/gallery', () => {
    beforeEach( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });
    beforeEach( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user =>  {
        this.tempUser = user;
        console.log('intermediate value?:', user);
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    afterEach( done => {
      User.remove({})
      .then( () => done())
      .catch(done);
    });
    it('should return a gallery', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('invalid date');
        expect(res.status).to.equal(200);
        done();
      });
    });
    it('should return 401, no token', done => {
      request.post(`${url}/api/gallery`)
      .send(exampleGallery)
      .set({
        Authorization: 'Bearer '
      })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
    it('should return 400, invalid body', done => {
      request.post(`${url}/api/gallery`)
      .send({})
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });
  describe('GET: /api/gallery/:id', function() {
    beforeEach( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete exampleGallery.userID;
    });

    it('should return a gallery', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleGallery.name);
        expect(res.body.desc).to.equal(exampleGallery.desc);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(res.status).to.equal(200);
        expect(date).to.not.equal('invalid date');
        done();
      });
    });
    it('should return 401, no token', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: 'Bearer '
      })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
    it('should return 404', done => {
      request.get(`${url}/apu/test`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });
  describe('PUT: /api/gallery/:id', () => {
    beforeEach(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    beforeEach( done => {
      exampleGallery.userID = this.tempUser._id.toString();
      new Gallery(exampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    it('should update a gallery', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send(updatedUser)
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.status).to.equal(200);
        expect(date).to.not.equal('invalid date');
        done();
      });
    });
    it('should return 401, no token', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: 'Bearer '
      })
      .send(updatedUser)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
    it('should return 400, invalid body', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .send(invalidUser)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });
});
