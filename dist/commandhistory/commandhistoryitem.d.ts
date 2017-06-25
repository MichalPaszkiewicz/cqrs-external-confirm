import { IAmACommand, ClockDate } from "cqrs-react-router";
export declare class CommandHistoryItem {
    command: IAmACommand;
    created: ClockDate;
    constructor(command: IAmACommand);
}
