import {CommandHistoryItem} from "./commandhistoryitem";

export class CommandHistory{
    private _items: CommandHistoryItem[] = [];

    add(item: CommandHistoryItem){
        this._items.push(item);
    }
}