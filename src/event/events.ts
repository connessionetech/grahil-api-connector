// custom event constants
export const NOTIFICATION_EVENT = "NotificationReceived";
export const DATA_NOTIFICATION_EVENT = "DataNotificationReceived";
export const DATA_EVENT = "DataReceived";


// Event topics

export const TOPIC_LOG_ACTIONS = "/log/actions"

export const TOPIC_LOGMONITORING = "/logging"

export const TOPIC_SYSMONITORING = "/stats"

export const TOPIC_PING = "/ping"

export const TOPIC_EVENTS = "/events"

export const TOPIC_SCRIPTS = "/script"


export class GrahilEvent{
    name:String
    state!:string
    topic!:string    
    data!:any
    note!:string
    timestamp!:number

    constructor(name:String){
        this.name = name
    }

}