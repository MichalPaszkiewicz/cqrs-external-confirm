export declare class CommandEndPointCollection {
    private _endpoints;
    add(commandName: string, endPoint: string): void;
    concat(otherCollection: CommandEndPointCollection): void;
    getEndPointForCommand(commandName: string): string;
}
