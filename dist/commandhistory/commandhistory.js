"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommandHistory = (function () {
    function CommandHistory() {
        this._items = [];
    }
    CommandHistory.prototype.add = function (item) {
        this._items.push(item);
    };
    return CommandHistory;
}());
exports.CommandHistory = CommandHistory;
//# sourceMappingURL=commandhistory.js.map