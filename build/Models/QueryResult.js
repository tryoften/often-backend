'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

require('backbonefire');

var _backbone = require('backbone');

var _config = require('../config');

var CachedResult = (function (_Firebase$Model) {
	function CachedResult() {
		_classCallCheck(this, CachedResult);

		if (_Firebase$Model != null) {
			_Firebase$Model.apply(this, arguments);
		}
	}

	_inherits(CachedResult, _Firebase$Model);

	_createClass(CachedResult, [{
		key: 'initialize',
		value: function initialize(models, opts) {
			this.url = '' + _config.BaseURL + '/cached-results';
			this.autoSync = true;
		}
	}]);

	return CachedResult;
})(_backbone.Firebase.Model);

exports['default'] = CachedResult;
module.exports = exports['default'];
//# sourceMappingURL=QueryResult.js.map