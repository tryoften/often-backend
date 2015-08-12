'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

require('backbonefire');

var _backbone = require('backbone');

var _config = require('../config');

var _ModelsResponse = require('../Models/Response');

var _ModelsResponse2 = _interopRequireDefault(_ModelsResponse);

/**
 * This class is responsible for maintaining the responses collection.
 */

var Responses = (function (_Firebase$Collection) {
	function Responses() {
		_classCallCheck(this, Responses);

		if (_Firebase$Collection != null) {
			_Firebase$Collection.apply(this, arguments);
		}
	}

	_inherits(Responses, _Firebase$Collection);

	_createClass(Responses, [{
		key: 'initialize',

		/**
   * Initializes the responses collection.
   * @param {object} models - supporting models
   * @param {object} opts - supporting options
   *
   * @return {void}
   */
		value: function initialize(models, opts) {

			this.model = _ModelsResponse2['default'];
			this.url = '' + _config.BaseURL + '/responses';
			this.autoSync = true;
		}
	}, {
		key: 'createResponse',

		/**
   * Creates and adds a Response model to the collection, and then returns it.
   * @param {string} reqId - used in conjuction with provider to generate an id of new model
   * @param {string} provider - used in conjuction with reqId to generate an id of new model
   * @param {object} contents - object containing results to be added to the response 
   *
   * @return {object} - returns a Response object
   */
		value: function createResponse(reqId, provider, contents) {

			return this.create({
				id: '' + reqId + '/' + provider,
				meta: {
					time_completed: Date.now() },
				results: contents
			});
		}
	}]);

	return Responses;
})(_backbone.Firebase.Collection);

exports['default'] = Responses;
module.exports = exports['default'];
//# sourceMappingURL=Responses.js.map