'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _backbone = require('backbone');

/*
	This class is responsible for providing granular functionalities (mostly accessors) for requests.
*/

var Request = (function (_Model) {
	function Request() {
		_classCallCheck(this, Request);

		if (_Model != null) {
			_Model.apply(this, arguments);
		}
	}

	_inherits(Request, _Model);

	return Request;
})(_backbone.Model);

exports['default'] = Request;
module.exports = exports['default'];
//# sourceMappingURL=Request.js.map