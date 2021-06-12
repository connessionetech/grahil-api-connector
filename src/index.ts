/*
import {SampleClient} from './test'
const a = new SampleClient()
*/

import {GrahilApiClient} from './client'
import { ClientState, ClientStateType } from './models'

const client = new GrahilApiClient({        
    host: "localhost",
    port: 8000,
    reconnectOnFailure: false
});

client.onClientStateUpdate.subscribe((stateObj:ClientState) => {
    
    switch(stateObj.state)
    {
        case ClientStateType.CONNECTING:
            console.log("Connecting")   
            break;

        case ClientStateType.CONNECTED:
            console.log("Connected")   
            break;
        
        case ClientStateType.CONNECTION_LOST:
            console.log("Connection lost")   
            break;

        case ClientStateType.CONNECTION_TERMINATED:
            console.log("Connection terminated")   
            break;
        
        case ClientStateType.EVENT_RECEIVED:
            console.log("Event received")   
            break;
        
        case ClientStateType.CONNECTION_ERROR:
            console.log("Connection error")   
            break;
    }


});

client.connect("administrator", "xyz123").then(()=>{
     
    setTimeout(() => {
        client.subscribe_stats().then((data)=>{
            console.log("Call success: " + data)
        }).catch((err)=>{
            console.error(err);        
        });
    }, 5000);
    
}).catch((err)=>{
    console.error("Could not connect")
})
