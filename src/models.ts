import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject("LogInfo")
export class LogInfo{
    @JsonProperty("name")
    name?: string;

    @JsonProperty("topic")
    topic?: string;

    constructor(name:string, topic:string){
        this.name = name
        this.topic = topic
    }
}


export class LogData{
    name?: string;

    log?: string;

    constructor(name:string, topic:string){
        this.name = name
        this.log = topic
    }
}



export enum ClientStateType {
    CONNECTING = 1,
    CONNECTED,
    CONNECTION_LOST,
    CONNECTION_TERMINATED,
    ERROR,
    EVENT_RECEIVED,
  }


export class ClientState{
    state: ClientStateType;
    timestamp?: number;

    constructor(state:ClientStateType, timestamp?:number){
        this.state = state
        this.timestamp = timestamp
    }
}
