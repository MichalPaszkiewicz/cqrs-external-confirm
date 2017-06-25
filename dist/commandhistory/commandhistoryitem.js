"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cqrs_react_router_1 = require("cqrs-react-router");
var CommandHistoryItem = (function () {
    function CommandHistoryItem(command) {
        this.command = command;
        this.created = cqrs_react_router_1.Clock.now();
    }
    return CommandHistoryItem;
}());
exports.CommandHistoryItem = CommandHistoryItem;
//# sourceMappingURL=commandhistoryitem.js.map