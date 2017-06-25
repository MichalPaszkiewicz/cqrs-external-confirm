import {CommandHistory} from "../commandhistory/commandhistory";
import {CommandEnquiry} from "./commandenquiry";

export enum RetryPolicy{
    NoRetry,
    Retry,
    RetryExponential
}

export class RequestQueueOptions{
    constructor(public retryPolicy: RetryPolicy, public startRetryDelay?: number, public maxNumberOfRetries: number = 0){

    }
}

export class RequestQueue{

    private _enquiries: CommandEnquiry[] = [];
    private _onEnquiryCompleteHandlers: ((enquiry: CommandEnquiry) => void)[] = [];
    private _onEnquiryFailedHandlers: ((enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[]) => void)[] = [];
    private _sending: boolean = false;
    private _messageBeingSent: CommandEnquiry;

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
        self.post();
    }

    private retry(){
        var self = this;
        self._currentRetry++;
        if(self._options.retryPolicy == RetryPolicy.RetryExponential){
            self._currentDelay = self._currentDelay * 2;
        }
        setTimeout(() => self.post(), self._currentDelay);
    }

    private post(){
        var self = this;
        var request = new XMLHttpRequest();
        var enquiry = self._messageBeingSent;
        var url = enquiry.endPoint;
        var data = enquiry.item.command;
        request.open("POST", url);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onreadystatechange = () => {
            if(request.readyState == 4){
                if(request.status >= 500){
                    if(self._options.retryPolicy == RetryPolicy.NoRetry
                        || self._options.maxNumberOfRetries >= self._currentRetry){
                        self._onEnquiryFailedHandlers.forEach((oech) => oech(enquiry, self._enquiries));
                        return;
                    }
                    self.retry()
                    return;
                }
                if(request.status < 200 || request.status > 299){
                    self._onEnquiryFailedHandlers.forEach((oefh) => oefh(enquiry, self._enquiries));
                }
                else{
                    self._onEnquiryCompleteHandlers.forEach((oech) => oech(enquiry));
                    self._enquiries.shift();
                    self.sendRequest();
                }
            }
        }
        request.send(JSON.stringify(data));
    }

    onEnquiryComplete(callback: (enquiry: CommandEnquiry) => void){
        this._onEnquiryCompleteHandlers.push(callback);
    }

    onEnquiryFailed(callback: (enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[]) => void){
        this._onEnquiryFailedHandlers.push(callback);
    }
}
