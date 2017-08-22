import {CommandEndPoint} from "./commandendpoint";

export class CommandEndPointCollection{

    private _endpoints: CommandEndPoint[] = [];

    add(commandName: string, endPoint: string){
        this._endpoints.push(new CommandEndPoint(commandName, endPoint));
    }

    concat(otherCollection: CommandEndPointCollection){
        this._endpoints.concat(otherCollection._endpoints);
    }

    getEndPointForCommand(commandName: string){
        for(var i = 0; i < this._endpoints.length; i++){
            if(this._endpoints[i].commandName == commandName || this._endpoints[i].commandName == "*"){
                return this._endpoints[i].endPoint;
            }
        }
        return null;
    }
}