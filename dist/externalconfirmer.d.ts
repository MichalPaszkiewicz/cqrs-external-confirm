import { IAmACommand, ApplicationService } from "cqrs-react-router";
import { CommandEndPoint } from "./commandendpoints/commandendpoint";
import { CommandEndPointCollection } from "./commandendpoints/commandendpointcollection";
import { CommandEnquiry } from "./requestqueue/commandenquiry";
import { RequestQueueOptions } from "./requestqueue/requestqueue";
import { CommandIgnore } from "./commandendpoints/commandignore";
export declare enum ReconciliationModes {
    ReplayToFailure = 0,
    AllowRetry = 1,
}
export declare class ReconciliationOptions {
}
export declare class ExternalConfirmer {
    private _commandIgnoreCollection;
    private _commandEndPointCollection;
    private _requestQueue;
    private _commandHistory;
    private _applicationService;
    constructor(retryOptions?: RequestQueueOptions);
    attachToApplicationService(appService: ApplicationService): void;
    registerCommandEndPoint(commandName: string, endPoint: string): void;
    registerCommandEndPoints(endPoints: CommandEndPoint[] | {
        commandName: string;
        endPoint: string;
    }[]): void;
    registerCommandEndPointCollection(endPointCollection: CommandEndPointCollection): void;
    registerCommandToIgnore(commandName: string): void;
    registerCommandsToIgnore(ignoreList: CommandIgnore[] | {
        commandName: string;
    }[]): void;
    confirm(command: IAmACommand): void;
    onConfirmationFailed(callback: (enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[], errorMessage: string) => void): void;
    transformRequest(callback: (request: XMLHttpRequest) => void): void;
    transformCommand(callback: (c: IAmACommand) => void): void;
}
