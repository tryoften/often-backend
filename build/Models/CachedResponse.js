'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _backbone = require('backbone');

/*
	This class is responsible for providing granular functionalities (mostly accessors) for cached responses.
*/

var CachedResponse = (function (_Model) {
	function CachedResponse() {
		_classCallCheck(this, CachedResponse);

		if (_Model != null) {
			_Model.apply(this, arguments);
		}
	}

	_inherits(CachedResponse, _Model);

	_createClass(CachedResponse, [{
		key: 'getTimeCompleted',

		/* 
  	Description: Return the time the cached response was last generated.
  	Parameters: N/A
  	Signature: () -> Integer
  */

		value: function getTimeCompleted() {

			return this.get('meta').time_completed;
		}
	}, {
		key: 'getResults',

		/* 
  	Description: Returns the results of the cached response.
  	Parameters: N/A
  	Signature: () -> Object
  */

		value: function getResults() {

			return this.get('results');
		}
	}]);

	return CachedResponse;
})(_backbone.Model);

exports['default'] = CachedResponse;
module.exports = exports['default'];
//# sourceMappingURL=CachedResponse.js.map