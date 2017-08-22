import { CommandEnquiry } from "./commandenquiry";
import { IAmACommand } from "cqrs-react-router";
export declare enum RetryPolicy {
    NoRetry = 0,
    Retry = 1,
    RetryExponential = 2,
}
export declare class RequestQueueOptions {
    retryPolicy: RetryPolicy;
    startRetryDelay: number;
    maxNumberOfRetries: number;
    constructor(retryPolicy: RetryPolicy, startRetryDelay?: number, maxNumberOfRetries?: number);
}
export declare class RequestQueue {
    private _enquiries;
    private _onEnquiryCompleteHandlers;
    private _onEnquiryFailingHandlers;
    private _onEnquiryFailedHandlers;
    private _sending;
    private _messageBeingSent;
    private _requestTransform;
    private _commandTransform;
    private _options;
    private _currentDelay;
    private _currentRetry;
    constructor(options?: RequestQueueOptions);
    private resetRetry();
    push(enquiry: CommandEnquiry): void;
    startSending(): void;
    stopSending(): void;
    private sendRequest();
    transformRequest(callback: (request: XMLHttpRequest) => void): void;
    transformCommand(callback: (command: IAmACommand) => void): void;
    private retry();
    private failEnquiry(enquiry, errorMessage);
    private retriesShouldStop();
    private post();
    private commandConfirmed(enquiry);
    onEnquiryComplete(callback: (enquiry: CommandEnquiry) => void): void;
    onEnquiryFailing(stopOnEnquiryFailed: (enquiry: CommandEnquiry, requestQueue: RequestQueue) => boolean): void;
    onEnquiryFailed(callback: (enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[], errorMessage: string) => void): void;
}
