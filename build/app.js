'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('backbonefire');

var _ServicesClientRequestDispatcher = require('./Services/ClientRequestDispatcher');

var _ServicesClientRequestDispatcher2 = _interopRequireDefault(_ServicesClientRequestDispatcher);

var _CollectionsUsers = require('./Collections/Users');

var _CollectionsUsers2 = _interopRequireDefault(_CollectionsUsers);

var _ModelsCachedResultsManager = require('./Models/CachedResultsManager');

var _ModelsCachedResultsManager2 = _interopRequireDefault(_ModelsCachedResultsManager);

var crd = new _ServicesClientRequestDispatcher2['default']();
crd.process();
//# sourceMappingURL=app.js.map