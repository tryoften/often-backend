'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _restler = require('restler');

/* 
	This class is responsible for fetching data from the Giphy API
*/

var RestfulService = (function (_Service) {

	/* 
 	Description: Initializes the giphy service provider.
 	Parameters: Models (supporting models)
 	Signature: (Object) -> Void
 */

	function RestfulService(models, opts) {
		_classCallCheck(this, RestfulService);

		_get(Object.getPrototypeOf(RestfulService.prototype), 'constructor', this).call(this, {
			baseURL: models.base_url,
			parser: _restler.parsers.json }, opts);
	}

	_inherits(RestfulService, _Service);

	_createClass(RestfulService, [{
		key: 'getRawData',

		/* 
  	Description: Main method for obtaining raw data. Results are returned as a promise.
  	Parameters: Query (search term)
  	Signature: (String) -> Promise
  */

		value: function getRawData(url, opts) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				_this2.get(url, {
					query: opts
				}).on('success', function (data) {
					resolve(data);
				}).on('error', function (err) {
					console.log('err' + err);
					reject(err);
				});
			});
		}
	}]);

	return RestfulService;
})(_restler.Service);

exports['default'] = RestfulService;
module.exports = exports['default'];
//# sourceMappingURL=RestfulService.js.map