// Data objects

import { IRPC } from "./grahil_interfaces";


const UniqID = require('uniqid');

// RPC object
export class RPC implements IRPC{
    requestid!: string;
    type!: string;
    intent!: string;
    params?: any;
    timestamp?: number | undefined;

    constructor (options:any= {}) {
        this.type = "rpc"
        this.intent = options.name || undefined;
        this.params = options.params || {};
    }

    public build():IRPC{
        this.requestid = UniqID()
        this.timestamp = new Date().getUTCMilliseconds();
        return this
    }

    public toJSON():object{
        this.requestid = UniqID()
        this.timestamp = new Date().getUTCMilliseconds();
        return {"requestid": this.requestid, "type": this.type, "intent": this.intent, "params": this.params, "timestamp": this.timestamp};
    }
    
}