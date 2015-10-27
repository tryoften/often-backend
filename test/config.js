var should = require('chai').use(require('chai-as-promised')).should();
var AssertionError = require('chai').AssertionError;

var config = require('./original_config');
var konfig = require('konfig')({path: './configs'}).app;

describe('app/config', function() {
  context('when --firebase-url is provided', function() {
    before(function() {
      process.argv.push('--firebase-url');
      process.argv.push('often-dev.firebaseio.com');
    });

    it('uses correct firebase host', function() {
      konfig.firebase.BaseURL.should.equal(config.firebase.BaseURL);
    });

    it('adjusts queue URLs accordingly', function() {
      konfig.firebase.queues.default.url.should.equal(config.firebase.queues.default.url);
    });
  });

  context('when no --firebase-url is provided', function() {
    it('provides default URL'); // pending
  });

  it('is equal to old config', function() {
    konfig.should.equal(config);
  });
});
