'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('backbone-relational');

require('backbonefire');

var _backbone = require('backbone');

var _ModelsUser = require('../Models/User');

var _ModelsUser2 = _interopRequireDefault(_ModelsUser);

var Response = _backbone.RelationalModel.extend({});

exports['default'] = Response;
module.exports = exports['default'];

/*
	idAttribute : '_id',
    relations:[{
      type: HasOne,
      key: 'user',
      relatedModel: User,
      reverseRelation: {
        key: 'response',
        type: HasMany,
        includeInJSON: 'id'
      }
    }] 
*/
//# sourceMappingURL=Response.js.map