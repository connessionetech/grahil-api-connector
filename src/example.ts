/*
This file is part of `Grahil` 
Copyright 2018 Connessione Technologies

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
