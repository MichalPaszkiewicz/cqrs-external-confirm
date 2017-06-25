import {IAmACommand, Clock, ClockDate} from "cqrs-react-router";

export class CommandHistoryItem{
    created: ClockDate = Clock.now();

    constructor(public command: IAmACommand){

    }
}