// Service provider core
const WebSocketClient = require('websocket').client; // https://www.npmjs.com/package/websocket
const Defer = require('defer-promise')
import { nanoid } from 'nanoid'
import { IServiceSocket, ISocketServiceObject } from "./grahil_interfaces";
import { ChannelEventProvider} from "./event/eventprovider"
import * as CHANNEL_STATES from './event/channelstates'






export class WSClient extends ChannelEventProvider implements IServiceSocket {

    host: string;
    port: number;
    autoconnect?: boolean | undefined;    
    authtoken: string;
    queryparams?: string | undefined;

    private _connected:boolean;
    private _wsEndPoint!: string;

    private _client:typeof WebSocketClient;
    private _connection:any
    private _disconnectFlag:boolean

    private _requests:Map<string,object>

    

    constructor (config:ISocketServiceObject) {

        super()

        this._connected = false
        this._disconnectFlag = false
        this._client = undefined
        this._requests = new Map<string,object>()
        
        this.host = config.host
        this.port = config.port
        this.authtoken = config.authtoken
        this.autoconnect = config.autoconnect?(config.autoconnect != undefined):Boolean(config.autoconnect)
        this._wsEndPoint = "ws" + "://" + this.host + ":" + this.port + "/" + "ws?" + "token=" + this.authtoken;
        
        if(this.autoconnect == true){
            this.connect()
        }
    }
    

    private getSocketEndPoint():string { 
        return this._wsEndPoint;
     } 


    public getHost():string{
        return this.host;
    }


    public getPort():number{
        return this.port;
    }


    public connect():Promise<any>{

        return new Promise((resolve,reject) => {

            if(this._client == undefined)
            {

                this._connection = undefined
                this._client = new WebSocketClient();

                
                this._client.on('connectFailed', (error:any) => {
                    this._connected = false
                    console.log('Connect Error: ' + error.toString()); 
                    this._onChannelState.dispatch(CHANNEL_STATES.STATE_CHANNEL_ERROR);                   
                    reject(error)
                });
                

                this._client.on('connect', (connection:any) => {

                    console.info('WebSocket Client Connected');
                    this._onChannelState.dispatch(CHANNEL_STATES.STATE_CHANNEL_CONNECTED);

                    this._connected = true
                    this._connection = connection

                    connection.on('error', (error:any) => {
                        this._connected = false
                        console.error("Connection Error: " + error.toString());
                        this._onChannelState.dispatch(CHANNEL_STATES.STATE_CHANNEL_ERROR);
                    });

                    connection.on('close', () => {
                        this._connected = false
                        console.debug('protocol Connection Closed');
                        if(this._disconnectFlag){
                            this._onChannelState.dispatch(CHANNEL_STATES.STATE_CHANNEL_DISCONNECTED);
                        }else{
                            this._onChannelState.dispatch(CHANNEL_STATES.STATE_CHANNEL_CONNECTION_LOST);
                        }
                    });                    

                    connection.on('message', (message:any) => {
                        if (message.type === 'utf8') {
                            console.debug("Received: '" + message.utf8Data + "'");
                        }
                        this._onChannelState.dispatch(CHANNEL_STATES.STATE_CHANNEL_DATA);
                        this._onChannelData.dispatch(message) // raw data
                    });

                    resolve(this)
                });
            }


            if (!this._connected || this._client.Closed){
                this._client.connect(this._wsEndPoint);
            }else{
                console.error("socket is already connected");
            }
        });        
    }


    public disconnect():void{
        if (this._connected){
            // use flag to see if disconnect was requested or automatic
            this._disconnectFlag = true
            setTimeout(() => {
                this._disconnectFlag = false
            }, 5000);

            this._client.close()
        }else{
            console.error("socket is not connected");
        }
    }


    public is_connected():boolean{
        if(this._connection == undefined){
            return false;
        }else{
            return this._connection.connected;
        }
    }


    private buildRequest(requestid:string, intent:string, params:object)
    {
        return {
            "requestid": requestid,
            "method": intent,
            "type": "rpc",
            "params": params
        }
    }


    /**
     * Makes RPC request to server
     * `
     * @param methodName 
     * @param params 
     */
    public doRPC(intent:string, params?:object):Promise<any>{

        if(params == undefined || params == null){
            params = {}
        }
        
        let requestid = nanoid();
        let request = this.buildRequest(requestid, intent, params)
        let deferred = new Defer()

        if (this._connection != undefined && this._connection.connected) {                                
                
            try{
                setTimeout(() => {
                    this._connection.sendUTF(request);    
                }, 10);                    
            }catch(err){
                console.error("Unable to send request")
            }
        }else{
            console.log("Socket is not connected")
        };

        this._requests.set(requestid, deferred)        
        return deferred.promise;
    }
}