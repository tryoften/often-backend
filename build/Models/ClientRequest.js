'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('backbone-relational');

var _backbone = require('backbone');

var _ModelsUser = require('../Models/User');

var _ModelsUser2 = _interopRequireDefault(_ModelsUser);

var ClientRequest = _backbone.RelationalModel.extend({
  idAttribute: '_id',
  relations: [{
    type: _backbone.HasOne,
    key: 'user',
    relatedModel: _ModelsUser2['default'],
    reverseRelation: {
      key: 'clientRequests',
      type: _backbone.HasMany,
      includeInJSON: 'id'
    }
  }]
});

exports['default'] = ClientRequest;
module.exports = exports['default'];
//# sourceMappingURL=ClientRequest.js.map