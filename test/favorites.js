var should = require('chai').use(require('chai-as-promised')).should();
var expect = require('chai').expect;
var AssertionError = require('chai').AssertionError;

process.env.NODE_ENV = 'testing';
var konfig = require('../app/config');

import Favorites from '../app/Collections/Favorites';

describe('app/Collections/Favorites', function() {
	it('throws an error if not given a userID', function() {
		(() => {
			var collection = new Favorites();
		}).should.throw();
	});
});
