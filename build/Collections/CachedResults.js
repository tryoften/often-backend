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

var _ModelsClientRequest = require('../Models/ClientRequest');

var _ModelsClientRequest2 = _interopRequireDefault(_ModelsClientRequest);

var ClientRequests = (function (_Firebase$Collection) {
	function ClientRequests() {
		_classCallCheck(this, ClientRequests);

		if (_Firebase$Collection != null) {
			_Firebase$Collection.apply(this, arguments);
		}
	}

	_inherits(ClientRequests, _Firebase$Collection);

	_createClass(ClientRequests, [{
		key: 'initialize',
		value: function initialize(models, opts) {
			this.model = _ModelsClientRequest2['default'];
			this.url = '' + _config.BaseURL + '/client-requests';
			this.autoSync = true;
		}
	}]);

	return ClientRequests;
})(_backbone.Firebase.Collection);

exports['default'] = ClientRequests;
module.exports = exports['default'];
//# sourceMappingURL=CachedResults.js.map