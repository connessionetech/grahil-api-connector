// Service provider core
const WebSocketClient = require('websocket').client; // https://www.npmjs.com/package/websocket



class WSlient implements IServiceSocket {

    host: string;
    port: number;
    autoconnect?: boolean | undefined;    
    authtoken: string;
    queryparams?: string | undefined;

    private _connected:boolean;
    private _wsEndPoint!: string;

    private _client:typeof WebSocketClient;
    private _connection:any

    
    constructor (config:IServiceSocket) {

        this._connected = false
        
        this.host = config.host
        this.port = config.port
        this.authtoken = config.authtoken
        this.autoconnect = config.autoconnect?(config.autoconnect != undefined):Boolean(config.autoconnect)
        this._wsEndPoint = "ws" + "://" + this.host + ":" + this.port + "?" + "token=" + this.authtoken;
        this._initClient()
    }



    private _initClient():void{

        this._connection = undefined
        this._client = new WebSocketClient();

        // connect
        if(this.autoconnect == true){
            this.connect()
        }
        
        this._client.on('connectFailed', (error:any) => {
            this._connected = false
            console.log('Connect Error: ' + error.toString());
        });
        

        this._client.on('connect', (connection:any) => {
            this._connected = true
            this._connection = connection

            console.log('WebSocket Client Connected');

            connection.on('error', (error:any) => {
                this._connected = false
                console.log("Connection Error: " + error.toString());
            });

            connection.on('close', () => {
                this._connected = false
                console.log('echo-protocol Connection Closed');
            });

            connection.on('message', (message:any) => {
                if (message.type === 'utf8') {
                    console.log("Received: '" + message.utf8Data + "'");
                }
            });
        });
    }    
    

    private getSocketEndPoint():string { 
        return this._wsEndPoint;
     } 


    private connect():void{
        if (!this._connected || this._client.Closed){
            this._client.connect(this._wsEndPoint);
        }else{
            console.error("socket is already connected");
        }
    }


    private disconnect():void{
        if (this._connected){
            this._client.close()
        }else{
            console.error("socket is not connected");
        }
    }


    private is_connected():boolean{
        if(this._connection == undefined){
            return false;
        }else{
            return this._connection.connected;
        }
    }


    private doRPC():void{
        if (this._connection != undefined && this._connection.connected) {
            this._connection.sendUTF("hello");
        }else{
            console.log("Socket is not connected")
        }
    }
}