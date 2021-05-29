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