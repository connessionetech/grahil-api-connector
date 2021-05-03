// interfaces

interface OSStats {
    arch: string;
    name: string;
    type: string;
    flavor: string;
    version: string;
    boot_time: number;
    uptime: number;
    datetime: string;
    timezone: string;
}


interface CPUStats {
    frequency: string;
    count: number;
    vendor: string;
    model: string;
    usage_percent: string;
}


interface MemoryStats {
    total: number;
    used: number;
    free: number;
    usage_percent: string;
    swap_total: number;
    swap_used: number;
    swap_free: number;
}


interface DiskStats {
    mountpoint: string,
    total: string,
    used: string,
    free: string,
    usage_percent: string
}


interface NetworkStats {
    id: string,
    bytes_sent: number,
    bytes_recv: number,
    packets_sent: number,
    packets_recv: number,
    errin: number,
    errout: number,
    dropin: number,
    dropout: number,
}


interface SystemStats {
    os: OSStats,
    cpu: CPUStats,
    memory: MemoryStats,
    disk: DiskStats,
    network: NetworkStats,
    timestamp:number
}


interface LogData {
    log_key: string,
    log_data: string,
    timestamp:number
}


interface SimpleNotificationObject {
    message: string,
    type:number
    timestamp:number
}

interface SimpleDataNotificationObject {
    data: object,
    timestamp:number
}


interface DataNotificationObject {
    message: string,
    type:number,
    data: object,
    timestamp:number
}


interface IRPC{
    requestid:string,
    type:string,
    intent:string
    params?:any
    timestamp?:number
}


interface SocketServiceObject {

}


interface IServiceSocket {
    host:string,
    port:number
    authtoken:string,
    autoconnect?:boolean
    queryparams?:string
}


interface GrahilServiceClient {
    
}