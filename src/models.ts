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
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    CONNECTION_LOST = "CONNECTION_LOST",
    CONNECTION_TERMINATED = "CONNECTION_TERMINATED",
    CONNECTION_ERROR = "ERROR",
    EVENT_RECEIVED = "EVENT_RECEIVED",
  }


export class ClientState{
    state: ClientStateType;
    timestamp?: number;

    constructor(state:ClientStateType, timestamp?:number){
        this.state = state
        this.timestamp = timestamp
    }
}


export class Credentials{
    username: string;
    password: string;

    constructor(username:string, password:string){
        this.username = username
        this.password = password
    }
}
