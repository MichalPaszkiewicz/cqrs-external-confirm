import {CommandIgnore} from "./commandignore";

export class CommandIgnoreCollection{

    private _ignoreList: CommandIgnore[] = [];

    add(commandName: string){
        this._ignoreList.push(new CommandIgnore(commandName));
    }

    concat(otherCollection: CommandIgnoreCollection){
        this._ignoreList.concat(otherCollection._ignoreList);
    }

    shouldIgnoreCommand(commandName: string) : boolean{
        return this._ignoreList.some((ci) => ci.commandName == commandName);
    }
}