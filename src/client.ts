// Core api client

const axios = require('axios');
import { IServiceClient, IServiceSocket, IClientConfig } from "./grahil_interfaces";
import { WSClient} from "./wsclient";

require('better-logging')(console);
import { sha256, sha224 } from 'js-sha256';
import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher, ISimpleEvent } from "strongly-typed-events";
import { ClientEventProvider } from "./event/eventprovider";


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
                        this._socketservice.onChannelData.subscribe((data) => {
                            console.log("Data: " + JSON.stringify(data))
                        });
                        this._socketservice.onChannelState.subscribe((state) => {
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