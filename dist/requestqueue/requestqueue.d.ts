import { CommandEnquiry } from "./commandenquiry";
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
    private _onEnquiryFailedHandlers;
    private _sending;
    private _messageBeingSent;
    private _options;
    private _currentDelay;
    private _currentRetry;
    constructor(options?: RequestQueueOptions);
    private resetRetry();
    push(enquiry: CommandEnquiry): void;
    startSending(): void;
    stopSending(): void;
    private sendRequest();
    private retry();
    private post();
    onEnquiryComplete(callback: (enquiry: CommandEnquiry) => void): void;
    onEnquiryFailed(callback: (enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[]) => void): void;
}
