var should = require('chai').use(require('chai-as-promised')).should();
var expect = require('chai').expect;
var AssertionError = require('chai').AssertionError;
var reload = require('require-reload')(require);

var config = require('./original_config');
var konfig = require('../app/config');

describe('app/config', function() {
  it('is equal to old config', function() {
    expect(konfig).to.deep.equal(config);
  });

  context('when --firebase-root is provided', function() {
    var test_database = 'https://often-dev.firebaseio.com';
    before(function() {
      process.argv.push('--firebase-root');
      process.argv.push(test_database);
      config = reload('./original_config');
      konfig = reload('../app/config');
    });

    it('uses correct firebase host', function() {
      konfig.firebase.BaseURL.should.equal(test_database);
      konfig.firebase.BaseURL.should.equal(config.firebase.BaseURL);
    });

    it('adjusts queue URLs accordingly', function() {
      konfig.firebase.queues.default.url.should.equal(config.firebase.queues.default.url);
    });
  });

  context('when no --firebase-url is provided', function() {
    it('provides default URL'); // pending
  });
});
