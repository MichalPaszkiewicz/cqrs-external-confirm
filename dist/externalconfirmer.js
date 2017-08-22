"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commandendpointcollection_1 = require("./commandendpoints/commandendpointcollection");
var commandenquiry_1 = require("./requestqueue/commandenquiry");
var requestqueue_1 = require("./requestqueue/requestqueue");
var commandhistory_1 = require("./commandhistory/commandhistory");
var commandhistoryitem_1 = require("./commandhistory/commandhistoryitem");
var commandignorecollection_1 = require("./commandendpoints/commandignorecollection");
// todo: use these modes
var ReconciliationModes;
(function (ReconciliationModes) {
    ReconciliationModes[ReconciliationModes["ReplayToFailure"] = 0] = "ReplayToFailure";
    ReconciliationModes[ReconciliationModes["AllowRetry"] = 1] = "AllowRetry";
})(ReconciliationModes = exports.ReconciliationModes || (exports.ReconciliationModes = {}));
// todo: set options
var ReconciliationOptions = (function () {
    function ReconciliationOptions() {
    }
    return ReconciliationOptions;
}());
exports.ReconciliationOptions = ReconciliationOptions;
var ExternalConfirmer = (function () {
    function ExternalConfirmer(retryOptions) {
        this._commandIgnoreCollection = new commandignorecollection_1.CommandIgnoreCollection();
        this._commandEndPointCollection = new commandendpointcollection_1.CommandEndPointCollection();
        this._commandHistory = new commandhistory_1.CommandHistory();
        var self = this;
        self._requestQueue = new requestqueue_1.RequestQueue(retryOptions);
        self._requestQueue.onEnquiryComplete(function (enquiry) {
            self._commandHistory.add(enquiry.item);
        });
        self._requestQueue.onEnquiryFailed(function (enquiry, unprocessedEnquiries) {
            // todo: provide options for when you might want to just retry connecting via RQ again.
            self._applicationService.hardReplayEvents(enquiry.item.created.addMilliSeconds(-1));
        });
    }
    ExternalConfirmer.prototype.attachToApplicationService = function (appService) {
        var self = this;
        self._applicationService = appService;
        self._applicationService.onCommandHandled(function (command) { return self.confirm(command); });
    };
    ExternalConfirmer.prototype.registerCommandEndPoint = function (commandName, endPoint) {
        this._commandEndPointCollection.add(commandName, endPoint);
    };
    ExternalConfirmer.prototype.registerCommandEndPoints = function (endPoints) {
        var self = this;
        endPoints.forEach(function (ep) {
            self._commandEndPointCollection.add(ep.commandName, ep.endPoint);
        });
    };
    ExternalConfirmer.prototype.registerCommandEndPointCollection = function (endPointCollection) {
        this._commandEndPointCollection.concat(endPointCollection);
    };
    ExternalConfirmer.prototype.registerCommandToIgnore = function (commandName) {
        this._commandIgnoreCollection.add(commandName);
    };
    ExternalConfirmer.prototype.registerCommandsToIgnore = function (ignoreList) {
        var self = this;
        ignoreList.forEach(function (ci) {
            self._commandIgnoreCollection.add(ci.commandName);
        });
    };
    ExternalConfirmer.prototype.confirm = function (command) {
        var self = this;
        if (self._commandIgnoreCollection.shouldIgnoreCommand(command.name)) {
            return;
        }
        self._requestQueue.push(new commandenquiry_1.CommandEnquiry(new commandhistoryitem_1.CommandHistoryItem(command), self._commandEndPointCollection.getEndPointForCommand(command.name)));
    };
    ExternalConfirmer.prototype.onConfirmationFailed = function (callback) {
        var self = this;
        self._requestQueue.onEnquiryFailed(callback);
    };
    ExternalConfirmer.prototype.transformRequest = function (callback) {
        this._requestQueue.transformRequest(callback);
    };
    ExternalConfirmer.prototype.transformCommand = function (callback) {
        this._requestQueue.transformCommand(callback);
    };
    return ExternalConfirmer;
}());
exports.ExternalConfirmer = ExternalConfirmer;
//# sourceMappingURL=externalconfirmer.js.map