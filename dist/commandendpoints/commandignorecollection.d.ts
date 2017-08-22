export declare class CommandIgnoreCollection {
    private _ignoreList;
    add(commandName: string): void;
    concat(otherCollection: CommandIgnoreCollection): void;
    shouldIgnoreCommand(commandName: string): boolean;
}
