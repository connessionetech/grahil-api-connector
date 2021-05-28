// Core api client

const axios = require('axios');
import { IServiceClient, IServiceSocket, IClientConfig } from "./grahil_interfaces";
import { WSClient} from "./wsclient";
import { sha256, sha224 } from 'js-sha256';
import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher, ISimpleEvent } from "strongly-typed-events";
import { ClientEventProvider } from "./event/eventprovider";
import { Base64 } from 'js-base64';


require('better-logging')(console);


export class GrahilApiClient extends ClientEventProvider implements IServiceClient{

    host: string;
    port: number;

    private _socketservice!: IServiceSocket;
    private _restEndPoint:string;
    private _authtoken!: string;
    private _authtime!: number;




    constructor (config:IClientConfig) {      
        
        super()
        
        this.host = config.host
        this.port = config.port
        this._restEndPoint = "http" + "://" + this.host + ":" + this.port
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
                   throw Error("Invalid or unexpected response")
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
                   throw Error("Invalid or unexpected response")
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
    public getlogs():Promise<Array<string>>
    {
        let promise: Promise<any> = this._socketservice.doRPC("list_logs")
        return promise
    }
    


    /**
     * Subscribes to log channel (topic path) to get realtime data
     * 
     * @param logkey 
     * @returns Promise that resolved to subscribable topic path for the data channel of thsi log
     */
    public subscribe_log(logkey: string):Promise<string>
    {
        let payload = {
            "topic": "/logging/"+logkey
        }
        let promise: Promise<any> = this._socketservice.doRPC("subscribe_channel", payload)
        return promise
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
        let payload = {
            "topic": "/logging/"+logkey
        }
        let promise: Promise<any> = this._socketservice.doRPC("unsubscribe_channel", payload)
        return promise
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

            const url = this.getBaseAPIendPoint() + "/log/download"

            const params = new URLSearchParams()
            params.append('logname', logkey)
    
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

        return promise
    }



    /**
     * Gets list of system services that can be started/stopped through the service
     * 
     * @returns 
     */
    public get_system_services():Promise<string[]>
    {
        let promise: Promise<any> = this._socketservice.doRPC("list_targets")
        return promise
    }



    /**
     * Starts a system service using its name
     * 
     * @param name 
     * @returns 
     */
    public start_service(name: string):Promise<void>
    {
        let payload = {
            "module": name
        }
        let promise: Promise<any> = this._socketservice.doRPC("start_target", payload)
        return promise
    }


    
    /**
     * Stops a system service using its name
     * 
     * @param name 
     * @returns 
     */
    public stop_service(name: string):Promise<void>
    {
        let payload = {
            "module": name
        }
        let promise: Promise<any> = this._socketservice.doRPC("stop_target", payload)
        return promise
    }


    /**
     * Restarts a system service using its name
     * 
     * @param name 
     * @returns 
     */
    public restart_service(name: string):Promise<void>
    {
        
        let payload = {
            "module": name
        }
        let promise: Promise<any> = this._socketservice.doRPC("restart_target", payload)
        return promise
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
                    }).connect().then((client)=> {
                        this._socketservice = client
                        this._socketservice.onChannelData.subscribe((data:any) => {
                            console.log("Data: " + JSON.stringify(data))
                        });
                        this._socketservice.onChannelState.subscribe((state:string) => {
                            console.log("State:" + state)
                        });

                        resolve(null)
                    }).catch((err)=> {
                        console.error(err);
                        reject(err)
                    })

                }else{
                    console.log(res)
                    // handle unexpected condition
                }
            }).catch((err) => {
                console.log(err);
                // handle error
            })
        });           
        
    }



    private getBaseAPIendPoint():string{
        return this._restEndPoint;
    }



    private _initSocketClient(token:string){

        this._socketservice = new WSClient({

            host: this.host,
            port: this.port,
            authtoken:token,
            autoconnect:true
        })

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