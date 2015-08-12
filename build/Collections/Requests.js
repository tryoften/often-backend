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

var _ModelsRequest = require('../Models/Request');

var _ModelsRequest2 = _interopRequireDefault(_ModelsRequest);

/**
 * This class is responsible for maintaining and syncing Request collection.
 */

var Requests = (function (_Firebase$Collection) {
	function Requests() {
		_classCallCheck(this, Requests);

		if (_Firebase$Collection != null) {
			_Firebase$Collection.apply(this, arguments);
		}
	}

	_inherits(Requests, _Firebase$Collection);

	_createClass(Requests, [{
		key: 'initialize',

		/**
   * Initializes the requests collection.
   * @param {object} models - supporting models
   * @param {object} opts - supporting options
   *
   * @return {void}
   */
		value: function initialize(models, opts) {

			this.model = _ModelsRequest2['default'];
			this.url = '' + _config.BaseURL + '/requests';
			this.autoSync = true;
		}
	}]);

	return Requests;
})(_backbone.Firebase.Collection);

exports['default'] = Requests;
module.exports = exports['default'];
//# sourceMappingURL=Requests.js.map