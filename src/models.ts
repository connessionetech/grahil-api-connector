
import { Expose, Type } from 'class-transformer';

export class OSStats {

    arch!: string;

    name!: string;

    type!: string;

    flavor!: string;

    version!: string;

    boot_time!: number;

    uptime!: number;

    system_datetime!: string;

    timezone!: string;

}


export class CPUStats {

    frequency!: string;

    count!: number;

    vendor!: string;

    model!: string;

    percent!: string;
}


export class MemoryStats {

    total!: number;

    used!: number;

    free!: number;

    swap_total!: number;

    swap_used!: number;

    swap_free!: number;

    percent!: string;    
}



export class DiskStats {

    mountpoint!: string;

    fstype!:String;

    total!: string;

    used!: string;

    free!: string;

    percent!: string;
}




export class NetworkStats {

    id!: string;

    bytes_sent!: number;

    bytes_recv!: number;

    packets_sent!: number;

    packets_recv!: number;

    errin!: number;

    errout!: number;

    dropin!: number;

    dropout!: number;
}


export class SystemStats {

    @Type(() => OSStats)
    os!: OSStats;

    @Type(() => CPUStats)
    cpu!: CPUStats;

    @Type(() => MemoryStats)
    memory!: MemoryStats;

    @Type(() => DiskStats)
    disk!: DiskStats;

    @Type(() => NetworkStats)
    network!: NetworkStats;
}



export class Stats {

    @Type(() => SystemStats)
    system!: SystemStats;

    target!: any;
}




export class LogInfo {
    name?: string;

    topic?: string;

    constructor(name: string, topic: string) {
        this.name = name
        this.topic = topic
    }
}


export class LogData {
    name!: string;    
    data!: string;
}


export class ScriptData {
    name!: string;    
    data!: string;
}



export enum ClientStateType {
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    CONNECTION_LOST = "CONNECTION_LOST",
    CONNECTION_TERMINATED = "CONNECTION_TERMINATED",
    CONNECTION_ERROR = "ERROR",
    EVENT_RECEIVED = "EVENT_RECEIVED",
}


export class ClientState {
    state: ClientStateType;
    timestamp?: number;

    constructor(state: ClientStateType, timestamp?: number) {
        this.state = state
        this.timestamp = timestamp
    }
}


export class Credentials {
    username: string;
    password: string;

    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}


export class TopicData {
    topic: string
    data!: any
    timestamp!: number

    constructor(topic: string, data?: object) {
        this.topic = topic
        this.data = (data == undefined || data == null) ? undefined : data
    }

}
