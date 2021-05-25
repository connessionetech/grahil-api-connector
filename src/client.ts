// Core api client

const axios = require('axios');
import { IServiceClient, IServiceSocket, IClientConfig } from "./grahil_interfaces";
import { WSClient} from "./wsclient";

require('better-logging')(console);
import { sha256, sha224 } from 'js-sha256';



export class GrahilApiClient implements IServiceClient{

    host: string;
    port: number;

    private _socketservice!: IServiceSocket;
    private _restEndPoint:string;
    private _authtoken!: string;
    private _authtime!: number;


    constructor (config:IClientConfig) {        
        this.host = config.host
        this.port = config.port
        this._restEndPoint = "http" + "://" + this.host + ":" + this.port
    }



    public connect(username:string, password:string){
        console.log("connecting to service")
        
        var hashed_password = sha256.create().update(password).hex();
        this.authenticate(username, hashed_password).then((res) => {
            if(res.status == 200){
                this._authtoken = res.data.data;
                this._authtime = new Date().getUTCMilliseconds()
            }else{
                console.log(res)
            }
            return JSON.parse(res);
        }).catch((err) => {
            console.log(err);
        })
        
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