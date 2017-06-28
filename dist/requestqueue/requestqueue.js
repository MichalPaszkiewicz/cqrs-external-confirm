"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RetryPolicy;
(function (RetryPolicy) {
    RetryPolicy[RetryPolicy["NoRetry"] = 0] = "NoRetry";
    RetryPolicy[RetryPolicy["Retry"] = 1] = "Retry";
    RetryPolicy[RetryPolicy["RetryExponential"] = 2] = "RetryExponential";
})(RetryPolicy = exports.RetryPolicy || (exports.RetryPolicy = {}));
var RequestQueueOptions = (function () {
    function RequestQueueOptions(retryPolicy, startRetryDelay, maxNumberOfRetries) {
        if (maxNumberOfRetries === void 0) { maxNumberOfRetries = 5; }
        this.retryPolicy = retryPolicy;
        this.startRetryDelay = startRetryDelay;
        this.maxNumberOfRetries = maxNumberOfRetries;
    }
    return RequestQueueOptions;
}());
exports.RequestQueueOptions = RequestQueueOptions;
var RequestQueue = (function () {
    function RequestQueue(options) {
        this._enquiries = [];
        this._onEnquiryCompleteHandlers = [];
        this._onEnquiryFailingHandlers = [];
        this._onEnquiryFailedHandlers = [];
        this._sending = false;
        var self = this;
        if (options == null) {
            self._options = new RequestQueueOptions(RetryPolicy.RetryExponential, 200, 5);
        }
        else {
            self._options = options;
        }
    }
    RequestQueue.prototype.resetRetry = function () {
        this._currentDelay = this._options.startRetryDelay;
        this._currentRetry = 0;
    };
    RequestQueue.prototype.push = function (enquiry) {
        this._enquiries.push(enquiry);
        if (!this._sending) {
            this.startSending();
        }
    };
    RequestQueue.prototype.startSending = function () {
        this._sending = true;
        this.sendRequest();
    };
    RequestQueue.prototype.stopSending = function () {
        this._sending = false;
    };
    RequestQueue.prototype.sendRequest = function () {
        var self = this;
        if (self._enquiries.length == 0) {
            self.stopSending();
        }
        if (!self._sending) {
            return;
        }
        self.resetRetry();
        self._messageBeingSent = self._enquiries[0];
        if (self._messageBeingSent.endPoint == null) {
            self.commandConfirmed(self._messageBeingSent);
        }
        self.post();
    };
    RequestQueue.prototype.retry = function () {
        var self = this;
        self._currentRetry++;
        if (self._options.retryPolicy == RetryPolicy.RetryExponential) {
            self._currentDelay = self._currentDelay * 2;
        }
        setTimeout(function () { return self.post(); }, self._currentDelay);
    };
    RequestQueue.prototype.failEnquiry = function (enquiry) {
        var self = this;
        self._sending = false;
        var stopOnFailed = self._onEnquiryFailingHandlers.some(function (oech) { return oech(enquiry, self); });
        if (!stopOnFailed) {
            var redundantEnquiries = self._enquiries;
            self._onEnquiryFailedHandlers.forEach(function (oech) { return oech(enquiry, redundantEnquiries); });
            self._enquiries = [];
        }
    };
    RequestQueue.prototype.retriesShouldStop = function () {
        var self = this;
        return self._options.retryPolicy == RetryPolicy.NoRetry
            || self._currentRetry > self._options.maxNumberOfRetries;
    };
    RequestQueue.prototype.post = function () {
        var self = this;
        var request = new XMLHttpRequest();
        var enquiry = self._messageBeingSent;
        var url = enquiry.endPoint;
        var data = enquiry.item.command;
        request.open("POST", url);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status >= 500 || request.status == 0) {
                    if (self.retriesShouldStop()) {
                        self.failEnquiry(enquiry);
                        return;
                    }
                    self.retry();
                    return;
                }
                if (request.status < 200 || request.status > 299) {
                    self.failEnquiry(enquiry);
                    return;
                }
                else {
                    self.commandConfirmed(enquiry);
                }
            }
        };
        request.send(JSON.stringify(data));
    };
    RequestQueue.prototype.commandConfirmed = function (enquiry) {
        var self = this;
        self._onEnquiryCompleteHandlers.forEach(function (oech) { return oech(enquiry); });
        self._enquiries.shift();
        self.sendRequest();
    };
    RequestQueue.prototype.onEnquiryComplete = function (callback) {
        this._onEnquiryCompleteHandlers.push(callback);
    };
    RequestQueue.prototype.onEnquiryFailing = function (stopOnEnquiryFailed) {
        this._onEnquiryFailingHandlers.push(stopOnEnquiryFailed);
    };
    RequestQueue.prototype.onEnquiryFailed = function (callback) {
        this._onEnquiryFailedHandlers.push(callback);
    };
    return RequestQueue;
}());
exports.RequestQueue = RequestQueue;
//# sourceMappingURL=requestqueue.js.map