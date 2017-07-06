import {IAmACommand, ApplicationService} from "cqrs-react-router";
import {CommandEndPoint} from "./commandendpoints/commandendpoint";
import {CommandEndPointCollection} from "./commandendpoints/commandendpointcollection";
import {CommandEnquiry} from "./requestqueue/commandenquiry";
import {RequestQueue, RequestQueueOptions, RetryPolicy} from "./requestqueue/requestqueue";
import {CommandHistory} from "./commandhistory/commandhistory";
import {CommandHistoryItem} from "./commandhistory/commandhistoryitem";

// todo: use these modes
export enum ReconciliationModes{
    ReplayToFailure,
    AllowRetry
}

// todo: set options
export class ReconciliationOptions{

}

export class ExternalConfirmer{
    
    private _commandEndPointCollection: CommandEndPointCollection = new CommandEndPointCollection();
    private _requestQueue: RequestQueue;
    private _commandHistory: CommandHistory = new CommandHistory();
    private _applicationService: ApplicationService;

    constructor(retryOptions?: RequestQueueOptions){
        var self = this;

         self._requestQueue = new RequestQueue(retryOptions);

         self._requestQueue.onEnquiryComplete((enquiry: CommandEnquiry) => {
            self._commandHistory.add(enquiry.item);
         });

         self._requestQueue.onEnquiryFailed((enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[]) => {

            // todo: provide options for when you might want to just retry connecting via RQ again.
            self._applicationService.hardReplayEvents(enquiry.item.created.addMilliSeconds(-1));
         });
    }

    attachToApplicationService(appService: ApplicationService){
        var self = this;
        
         self._applicationService = appService;
         self._applicationService.onCommandHandled((command: IAmACommand) => self.confirm(command));
    }

    registerCommandEndPoint(commandName: string, endPoint: string){
        this._commandEndPointCollection.add(commandName, endPoint);
    }

    registerCommandEndPoints(endPoints: CommandEndPoint[] | {commandName: string, endPoint: string}[]){
        var self = this;
        endPoints.forEach((ep) => {
            self._commandEndPointCollection.add(ep.commandName, ep.endPoint);
        });
    }

    registerCommandEndPointCollection(endPointCollection: CommandEndPointCollection){
        this._commandEndPointCollection.concat(endPointCollection);
    }

    confirm(command: IAmACommand){
        var self = this;
        self._requestQueue.push(
            new CommandEnquiry(
                new CommandHistoryItem(command), 
            self._commandEndPointCollection.getEndPointForCommand(command.name)));
    }

    onConfirmationFailed(callback: (enquiry: CommandEnquiry, unprocessedEnquiries: CommandEnquiry[], errorMessage: string) => void){
        var self = this;
        self._requestQueue.onEnquiryFailed(callback);
    }

    transformRequest(callback: (request: XMLHttpRequest) => void){
        this._requestQueue.transformRequest(callback);
    }
}