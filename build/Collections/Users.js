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

var _ModelsUser = require('../Models/User');

var _ModelsUser2 = _interopRequireDefault(_ModelsUser);

/*
	This class is responsible for maintaining the users collection.
*/

var Users = (function (_Firebase$Collection) {
	function Users() {
		_classCallCheck(this, Users);

		if (_Firebase$Collection != null) {
			_Firebase$Collection.apply(this, arguments);
		}
	}

	_inherits(Users, _Firebase$Collection);

	_createClass(Users, [{
		key: 'initialize',

		/* 
  	Description: Initializes the users collection.
  	Parameters: Models (supporting models), options (supporting options)
  	Signature: (Object, Object) -> Void
  */

		value: function initialize(models, opts) {

			this.model = _ModelsUser2['default'];
			this.url = '' + _config.BaseURL + '/users';
			this.autoSync = true;
		}
	}]);

	return Users;
})(_backbone.Firebase.Collection);

exports['default'] = Users;
module.exports = exports['default'];
//# sourceMappingURL=Users.js.map