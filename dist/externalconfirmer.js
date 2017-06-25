"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commandendpointcollection_1 = require("./commandendpoints/commandendpointcollection");
var commandenquiry_1 = require("./requestqueue/commandenquiry");
var requestqueue_1 = require("./requestqueue/requestqueue");
var commandhistory_1 = require("./commandhistory/commandhistory");
var commandhistoryitem_1 = require("./commandhistory/commandhistoryitem");
var ExternalConfirmer = (function () {
    function ExternalConfirmer(retryOptions) {
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
    ExternalConfirmer.prototype.confirm = function (command) {
        var self = this;
        self._requestQueue.push(new commandenquiry_1.CommandEnquiry(new commandhistoryitem_1.CommandHistoryItem(command), self._commandEndPointCollection.getEndPointForCommand(command.name)));
    };
    ExternalConfirmer.prototype.onConfirmationFailed = function (callback) {
        var self = this;
        self._requestQueue.onEnquiryFailed(callback);
    };
    return ExternalConfirmer;
}());
exports.ExternalConfirmer = ExternalConfirmer;
//# sourceMappingURL=externalconfirmer.js.map