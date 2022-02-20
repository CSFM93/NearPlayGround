import { context } from "near-sdk-as";


@nearBindgen
export class SmartContract {
    id: string;
    owner: string;
    name: string;
    type: String;
    constructor(_id: string, _name: string, _type: string) {
        this.id = _id;
        this.owner = context.sender;
        this.name = _name;
        this.type = _type;
    }
}


