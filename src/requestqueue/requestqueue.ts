import {CommandHistory} from "../commandhistory/commandhistory";
import {CommandEnquiry} from "./commandenquiry";

export enum RetryPolicy{
    NoRetry,
    Retry,
    RetryExponential
}

export class RequestQueueOptions{
    constructor(public retryPolicy: RetryPolicy, public startRetryDelay?: number, public maxNumberOfRetries: number = 5){

    }
}

export class RequestQueue{

    private _enquiries: CommandEnquiry[] = [];
    private _onEnquiryCompleteHandlers: ((enquiry: CommandEnquiry) => void)[] = [];
    private _onEnquiryFailingHandlers: ((enquiry: CommandEnquiry, requestQueue: RequestQueue) => boolean)[] = [];
    private _onEnquiryFailedHandlers: ((enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[], errorMessage: string) => void)[] = [];
    private _sending: boolean = false;
    private _messageBeingSent: CommandEnquiry;
    private _requestTransform: (request: XMLHttpRequest) => void = null;

    private _options: RequestQueueOptions;

    private _currentDelay;
    private _currentRetry;

    constructor(options?: RequestQueueOptions){
        var self = this;
        if(options == null){
            self._options = new RequestQueueOptions(RetryPolicy.RetryExponential, 200, 5);
        }
        else{
            self._options = options;
        }
    }

    private resetRetry(){
        this._currentDelay = this._options.startRetryDelay;
        this._currentRetry = 0;
    }

    push(enquiry: CommandEnquiry){
        this._enquiries.push(enquiry);
        
        if(!this._sending){
            this.startSending();        
        }
    }

    startSending(){
        this._sending = true;
        this.sendRequest();
    }

    stopSending(){
        this._sending = false;
    }

    private sendRequest(){
        var self = this;
        if(self._enquiries.length == 0){
            self.stopSending();
        }
        if(!self._sending){
            return;
        }

        self.resetRetry();

        self._messageBeingSent = self._enquiries[0];

        if(self._messageBeingSent.endPoint == null){
            self.commandConfirmed(self._messageBeingSent);
            return;
        }

        self.post();
    }

    transformRequest(callback: (request: XMLHttpRequest) => void){
        this._requestTransform = callback;
    }

    private retry(){
        var self = this;
        self._currentRetry++;
        if(self._options.retryPolicy == RetryPolicy.RetryExponential){
            self._currentDelay = self._currentDelay * 2;
        }
        setTimeout(() => self.post(), self._currentDelay);
    }

    private failEnquiry(enquiry, errorMessage){
        var self = this;
        self._sending = false;
        var stopOnFailed = self._onEnquiryFailingHandlers.some((oech) => oech(enquiry, self));
        if(!stopOnFailed){
            var redundantEnquiries = self._enquiries;
            self._enquiries = [];
            self._onEnquiryFailedHandlers.forEach((oech) => oech(enquiry, redundantEnquiries, errorMessage)); 
        }        
    }

    private retriesShouldStop(){
        var self = this;
        return self._options.retryPolicy == RetryPolicy.NoRetry 
            || self._currentRetry >= self._options.maxNumberOfRetries;
    }

    private post(){
        var self = this;
        var request = new XMLHttpRequest();
        var enquiry = self._messageBeingSent;
        var url = enquiry.endPoint;
        var data = enquiry.item.command;
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        if(self._requestTransform){
            self._requestTransform(request);
        }
        request.onreadystatechange = () => {
            if(request.readyState == 4){
                if(request.status >= 500 || request.status == 0){
                    if(self.retriesShouldStop()){
                        self.failEnquiry(enquiry, request.response || request.responseText || request.statusText);
                        return;
                    }
                    self.retry()
                    return;
                }
                if(request.status < 200 || request.status > 299){              
                    self.failEnquiry(enquiry, request.response || request.responseText || request.statusText);
                    return;
                }
                else{
                    self.commandConfirmed(enquiry);
                }
            }
        }
        request.send(JSON.stringify(data));
    }

    private commandConfirmed(enquiry: CommandEnquiry){
        var self = this;
        self._onEnquiryCompleteHandlers.forEach((oech) => oech(enquiry));
        self._enquiries.shift();
        self.sendRequest();
    }

    onEnquiryComplete(callback: (enquiry: CommandEnquiry) => void){
        this._onEnquiryCompleteHandlers.push(callback);
    }

    onEnquiryFailing(stopOnEnquiryFailed: (enquiry: CommandEnquiry, requestQueue: RequestQueue) => boolean){
        this._onEnquiryFailingHandlers.push(stopOnEnquiryFailed);
    }

    onEnquiryFailed(callback: (enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[], errorMessage: string) => void){
        this._onEnquiryFailedHandlers.push(callback);
    }
}
