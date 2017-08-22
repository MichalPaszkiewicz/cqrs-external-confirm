"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commandignore_1 = require("./commandignore");
var CommandIgnoreCollection = (function () {
    function CommandIgnoreCollection() {
        this._ignoreList = [];
    }
    CommandIgnoreCollection.prototype.add = function (commandName) {
        this._ignoreList.push(new commandignore_1.CommandIgnore(commandName));
    };
    CommandIgnoreCollection.prototype.concat = function (otherCollection) {
        this._ignoreList.concat(otherCollection._ignoreList);
    };
    CommandIgnoreCollection.prototype.shouldIgnoreCommand = function (commandName) {
        return this._ignoreList.some(function (ci) { return ci.commandName == commandName; });
    };
    return CommandIgnoreCollection;
}());
exports.CommandIgnoreCollection = CommandIgnoreCollection;
//# sourceMappingURL=commandignorecollection.js.map