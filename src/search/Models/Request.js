var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var backbone_1 = require('backbone');
/**
 * This class is responsible for providing granular functionalities (mostly accessors) for requests.
 */
var Request = (function (_super) {
    __extends(Request, _super);
    function Request() {
        _super.apply(this, arguments);
    }
    return Request;
})(backbone_1.Model);
exports["default"] = Request;
//# sourceMappingURL=Request.js.map