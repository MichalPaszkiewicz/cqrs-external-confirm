"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commandendpoint_1 = require("./commandendpoint");
var CommandEndPointCollection = (function () {
    function CommandEndPointCollection() {
        this._endpoints = [];
    }
    CommandEndPointCollection.prototype.add = function (commandName, endPoint) {
        this._endpoints.push(new commandendpoint_1.CommandEndPoint(commandName, endPoint));
    };
    CommandEndPointCollection.prototype.concat = function (otherCollection) {
        this._endpoints.concat(otherCollection._endpoints);
    };
    CommandEndPointCollection.prototype.getEndPointForCommand = function (commandName) {
        for (var i = 0; i < this._endpoints.length; i++) {
            if (this._endpoints[i].commandName == commandName || this._endpoints[i].commandName == "*") {
                return this._endpoints[i].endPoint;
            }
        }
        return null;
    };
    return CommandEndPointCollection;
}());
exports.CommandEndPointCollection = CommandEndPointCollection;
//# sourceMappingURL=commandendpointcollection.js.map