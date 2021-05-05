// Core api client

const axios = require('axios');
import { IServiceClient, IServiceSocket, IClientData } from "./grahil_interfaces";
import { WSClient} from "./wsclient";



export class GrahilApiClient implements IServiceClient{

    host: string;
    port: number;

    private _socketservice!: IServiceSocket;
    private _restEndPoint:string;
    private _authtoken!: string;


    constructor (config:IClientData) {        
        this.host = config.host
        this.port = config.port
        this._restEndPoint = "http" + "://" + this.host + ":" + this.port
        console.log("ready")
    }




    public connectToService(username:string, password:string){
        console.log("connecting to service")
        this.authenticate(username, password)
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



    private authenticate(username:string, password:string):void{

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

        console.log(promise)

        promise.then((result:any) => {
            this._authtoken = result as string
            console.error(this._authtoken)
        })
        .catch((err:any) => {
            // Do somthing
            console.error(err.toString())
        })        

    }
    

}