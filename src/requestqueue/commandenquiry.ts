import {CommandHistoryItem} from "../commandhistory/commandhistoryitem";

export class CommandEnquiry{
    constructor(public item: CommandHistoryItem, public endPoint: string){
        
    }
}