// Core api client

import 'reflect-metadata';
import { IServiceClient, IServiceSocket, IClientConfig } from "./grahil_interfaces";
import { WSClient} from "./wsclient";
import { sha256, sha224 } from 'js-sha256';
import { EventList, IEventHandler } from "strongly-typed-events";
import { ClientEventProvider } from "./event/eventprovider";
import { Base64 } from 'js-base64';
import { ClientStateType, ClientState, TopicData, LogData, LogInfo, Credentials, ScriptData, Stats } from "./models";
import { GrahilEvent, TOPIC_SCRIPT_MONITORING, TOPIC_LOG_MONITORING, TOPIC_STATS_MONITORING} from "./event/events";
import * as CHANNEL_STATES from './event/channelstates'
import { plainToClass } from "class-transformer";

const axios = require('axios');
require('better-logging')(console);


export class GrahilApiClient extends ClientEventProvider implements IServiceClient {

    host: string;
    port: number;
    autoconnect?: boolean;
    reconnectOnFailure?: boolean;

    private _socketservice!: IServiceSocket;
    private _restEndPoint:string;
    private _authtoken!: string;
    private _authtime!: number;

    private _lastCredentials!:Credentials;
    private _errorCount:number;
    private static MAX_ERROR_TOLERANCE:number = 5;

    private _topicevents = new EventList<IServiceClient, any>();




    constructor (config:IClientConfig) {      
        
        super()

        this._errorCount = 0;
        
        this.host = config.host
        this.port = config.port
        this.autoconnect = (typeof config.autoconnect === 'undefined' || config.autoconnect === null)?false:config.autoconnect
        this.reconnectOnFailure = (typeof config.reconnectOnFailure === 'undefined' || config.reconnectOnFailure === null)?false:config.reconnectOnFailure


        this._restEndPoint = "http" + "://" + this.host + ":" + this.port // fix this later

        return this
    }
    


    /**
     * Subscribes to a specific DataEvent topic
     * 
     * @param topicname topic name to subscribe to 
     * @param fn subscriber handler function 
     */
    subscribeTopic(topicname: string, fn: IEventHandler<IServiceClient, any>): void {
        this._topicevents.get(topicname).subscribe(fn)
    }



    /**
     * Unsubscribes from a specific DataEvent topic. The handler is executed at most once
     * 
     * @param topicname topic name to unsubscribe from
     * @param fn subscriber handler function 
     */
    unsubscribeTopic(topicname: string, fn: IEventHandler<IServiceClient, any>): void {
        this._topicevents.get(topicname).unsubscribe(fn)
    }



    /**
     * Checks to see if a given DataEvent topic has a handler registered against it or not
     * 
     * @param topicname 
     * @param fn 
     */
    hasTopicHandler(topicname: string, fn: IEventHandler<IServiceClient, any>): boolean {
        return this._topicevents.get(topicname).has(fn)
    }



    /**
     * Fetched the content of a simple text file from server
     * 
     * @returns 
     */
    public read_file(path:string):Promise<string>
    {
        const promise:Promise<any> = new Promise((resolve,reject) => {

            const url = this.getBaseAPIendPoint() + "/file/read"

            const params = new URLSearchParams()
            params.append('path', path)
    
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
    
            const promise = axios.post(url, params, config)
    
            promise.then((result:any) => {

                if(result.status == 200)
                {
                    const content = Base64.decode(result.data.data as string)
                    console.debug(content)
                    resolve(content)
                }
                else
                {
                    throw new Error("Invalid or unexpected response")
                }
            })
            .catch((err:any) => {
                console.error(err.toString())
                reject(err)
            })    

        });

        return promise
    }


    /**
     * Saves the content of a simple text file on server
     * 
     * @returns 
     */
    public write_file(path:string, content:string):Promise<void>
    {
        const promise:Promise<any> = new Promise((resolve,reject) => {

            const url = this.getBaseAPIendPoint() + "/file/write"

            const params = new URLSearchParams()
            params.append('path', path)
            params.append('content', Base64.encode(content))
    
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
    
            const promise = axios.post(url, params, config)
    
            promise.then((result:any) => {
                if(result.status == 200)
                {
                    const content = Base64.decode(result.data.data as string)
                    console.debug(content)
                    resolve(content)
                }
                else
                {
                    throw new Error("Invalid or unexpected response")
                }              
            })
            .catch((err:any) => {
                console.error(err.toString())
                reject(err)
            })    

        });

        return promise
    }



    /**
     * Gets list of accessible logs
     * 
     * @returns Promise that resolved to List of logs
     */
    public get_logs():Promise<Array<LogInfo>>
    {
        return new Promise((resolve,reject) => {

            let promise: Promise<any> = this._socketservice.doRPC("list_logs")
            promise.then((data:Array<LogInfo>)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }



    /**
     * Subscribes to stats channel (topic path) to get realtime data
     * 
     * @returns Promise that resolved to subscribable topic path for the data channel for stats
     */
    public subscribe_stats():Promise<any>
    {
        return new Promise((resolve,reject) => {

            let payload = {
                "topic": TOPIC_STATS_MONITORING
            }
            let promise: Promise<any> = this._socketservice.doRPC("subscribe_channel", payload)
            promise.then((data:any)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }
    


    /**
     * Subscribes to log channel (topic path) to get realtime data
     * 
     * @param logkey 
     * @returns Promise that resolved to subscribable topic path for the data channel of thsi log
     */
    public subscribe_log(logkey: string):Promise<any>
    {
        return new Promise((resolve,reject) => {

            let payload = {
                "topic": TOPIC_LOG_MONITORING + "/" +logkey
            }
            let promise: Promise<any> = this._socketservice.doRPC("subscribe_channel", payload)
            promise.then((data:any)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }


    /**
     * 
     * Unsubscribes from a log channel
     * 
     * @param logkey 
     * @returns 
     */
    public unsubscribe_log(logkey: string):Promise<void>
    {
        return new Promise((resolve,reject) => {

            let payload = {
                "topic": TOPIC_LOG_MONITORING + "/" + logkey
            }
            let promise: Promise<any> = this._socketservice.doRPC("unsubscribe_channel", payload)
            promise.then((data:any)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }


    /**
     * Requests to download a log file from server
     * 
     * @param logkey 
     * @returns 
     */
    public download_log(logkey: string):Promise<string>
    {
        const promise:Promise<any> = new Promise((resolve,reject) => {

            const url = this.getBaseAPIendPoint() + "/log/download/static"
            

            const params = new URLSearchParams()
            params.append('logname', logkey)
    
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
    
            const promise = axios.post(url, params, config)
    
            promise.then((result:any) => {

                if(result.data.status == "success")
                {
                    const download_url = this.getBaseAPIendPoint() + "/" + result.data.data
                    resolve(download_url) 
                }
                else
                {
                    throw new Error('Exception response received ' + JSON.stringify(result));
                }
                               
            })
            .catch((err:any) => {
                console.error(err.toString())
                reject(err)
            })    

        });

        return promise
    }



    /**
     * Gets list of system services that can be started/stopped through the service
     * 
     * @returns 
     */
    public get_system_services():Promise<string[]>
    {
        return new Promise((resolve,reject) => {
            let promise: Promise<any> = this._socketservice.doRPC("list_targets")
            promise.then((data:any)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }



    /**
     * Starts a system service using its name
     * 
     * @param name 
     * @returns 
     */
    public start_service(name: string):Promise<void>
    {
        return new Promise((resolve,reject) => {
            let payload = {
                "module": name
            }
            let promise: Promise<any> = this._socketservice.doRPC("start_target", payload)
            promise.then((data:any)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }


    
    /**
     * Stops a system service using its name
     * 
     * @param name 
     * @returns 
     */
    public stop_service(name: string):Promise<void>
    {
        return new Promise((resolve,reject) => {
            let payload = {
                "module": name
            }
            let promise: Promise<any> = this._socketservice.doRPC("stop_target", payload)
            promise.then((data:any)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }


    /**
     * Restarts a system service using its name
     * 
     * @param name 
     * @returns 
     */
    public restart_service(name: string):Promise<void>
    {
        return new Promise((resolve,reject) => {
            let payload = {
                "module": name
            }
            let promise: Promise<any> = this._socketservice.doRPC("restart_target", payload)
            promise.then((data:any)=>{
                resolve(data)
            }).catch((err)=>{
                reject(err)
            });

        });
    }



    /**
     * Connects to backend service using a set of valid credentials
     * 
     * @param username 
     * @param password 
     * @returns 
     */
    public connect(username:string, password:string):Promise<any>{
        console.log("connecting to service")

        return new Promise((resolve,reject) => {

            var hashed_password = sha256.create().update(password).hex();
            this.authenticate(username, hashed_password).then((res) => {
                if(res.status == 200){
                    this._authtoken = res.data.data;
                    this._authtime = new Date().getUTCMilliseconds()

                    // Connect to websocket
                    new WSClient({
                        host: this.host,
                        port: this.port,
                        authtoken: this._authtoken
                    })
                    .connect()
                    .then((client)=> {
                        this._errorCount = 0;
                        this._socketservice = client
                        this._lastCredentials = new Credentials(username, password);                        
                        this._onClientStateUpdate.dispatch(new ClientState(ClientStateType.CONNECTED))
                        this._socketservice.onChannelData.subscribe((data:any) => {
                            this.processChannelData(data)
                        });
                        this._socketservice.onChannelState.subscribe((state:string) => {
                            switch(state)
                            {
                                case CHANNEL_STATES.STATE_CHANNEL_ERROR:                                
                                this._onClientStateUpdate.dispatch(new ClientState(ClientStateType.CONNECTION_ERROR)) 
                                this._errorCount++;
                                if(this.reconnectOnFailure){
                                    // try to connect again
                                    this.attemptReconnect();
                                }
                                break;

                                case CHANNEL_STATES.STATE_CHANNEL_DISCONNECTED:
                                this._onClientStateUpdate.dispatch(new ClientState(ClientStateType.CONNECTION_TERMINATED)) 
                                break;

                                case CHANNEL_STATES.STATE_CHANNEL_CONNECTION_LOST:
                                this._onClientStateUpdate.dispatch(new ClientState(ClientStateType.CONNECTION_LOST)) 
                                if(this.reconnectOnFailure){
                                    // try to connect again                                    
                                        this.attemptReconnect()
                                }
                                break;

                                case CHANNEL_STATES.STATE_CHANNEL_CONNECTIING:
                                this._onClientStateUpdate.dispatch(new ClientState(ClientStateType.CONNECTING)) 
                                break;
                            }
                        });

                        resolve(this)
                    })
                    .catch((err)=> {
                        console.error(err);
                        reject(err)
                    })

                }else{
                    console.log(res)
                }
            }).catch((err) => {
                console.log(err);  
                this._errorCount++;              
                const message:string = err.toString()
                if(message.indexOf("ECONNREFUSED")>0){
                    if(this.reconnectOnFailure){
                        this.attemptReconnect()
                    }
                }
            })
        });        
    }



    private attemptReconnect():void
    {
        console.log("Attempting to reconnect")

        if(this._lastCredentials != undefined && this._lastCredentials != null){

            if(this._errorCount<GrahilApiClient.MAX_ERROR_TOLERANCE){
                
                setTimeout(() => {
                    this.connect(this._lastCredentials.username, this._lastCredentials.password);    
                }, 5000);               
            }
            else
            {
                throw new Error("too many connection failures")                                        
            }
        }
    }



    private processChannelData(data:any):void{

        if(data["type"] == "event")
        {
            let event:GrahilEvent = data as GrahilEvent   
            let truedata = null;      
            this._onClientStateUpdate.dispatch(new ClientState(ClientStateType.EVENT_RECEIVED))
            
            console.log(JSON.stringify(event))               
            
            switch(event.name)
            {

                case "ping_generated":
                    this._onServerPingEvent.dispatch(event)
                    break;
                
                case "text_notification":
                    this._onTextNotificationEvent.dispatch(event)
                    break;
                
                case "text_data_notification":
                    this._onTextDataNotificationEvent.dispatch(event)
                    break;
                
                case "data_generated":
                    this._onDataEvent.dispatch(event)
                    this._dispatchTopicOrientedDataEvent(event)
                    break;

                default:
                    console.debug("Unrecognized event type")
                    break
            }
        }

    }



    private _dispatchTopicOrientedDataEvent(event:GrahilEvent):void
    {
        const topic:string = event.topic

        switch(topic)
        {

            case (topic.startsWith(TOPIC_LOG_MONITORING))?topic:null:
                const logdata:LogData = plainToClass(LogData, event.data);
                this._topicevents.get(topic).dispatchAsync(this, logdata)
                break;

            case (topic.startsWith(TOPIC_SCRIPT_MONITORING))?topic:null:
                const scriptdata:ScriptData = plainToClass(ScriptData, event.data);
                this._topicevents.get(topic).dispatchAsync(this, scriptdata)
                break;

            case (topic.startsWith(TOPIC_STATS_MONITORING))?topic:null:
                const stats:Stats = plainToClass(Stats, event.data);
                this._topicevents.get(topic).dispatchAsync(this, stats)
                break;

            default:
                console.debug("Event for topic:"+topic)
                break;
        }
    }



    private getBaseAPIendPoint():string{
        return this._restEndPoint;
    }



    private authenticate(username:string, password:string):Promise<any>{

        return new Promise((resolve,reject) => {

            const url = this.getBaseAPIendPoint() + "/" + "authorize"

            const params = new URLSearchParams()
            params.append('username', username)
            params.append('password', password)
    
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
    
            const promise = axios.post(url, params, config)
    
            promise.then((result:any) => {
                console.debug(result)
                resolve(result)                
            })
            .catch((err:any) => {
                console.error(err.toString())
                reject(err)
            })    
        });
    }    

}