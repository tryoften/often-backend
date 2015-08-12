'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _backbone = require('backbone');

/**
 * This class is responsible for providing granular functionalities (mostly accessors) for cached responses. 
 */

var Response = (function (_Model) {
  function Response() {
    _classCallCheck(this, Response);

    if (_Model != null) {
      _Model.apply(this, arguments);
    }
  }

  _inherits(Response, _Model);

  return Response;
})(_backbone.Model);

exports['default'] = Response;
module.exports = exports['default'];
//# sourceMappingURL=Response.js.map