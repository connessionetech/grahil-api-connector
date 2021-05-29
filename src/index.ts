/*
import {SampleClient} from './test'
const a = new SampleClient()
*/

import {GrahilApiClient} from './client'

const client = new GrahilApiClient({        
    host: "localhost",
    port: 8000
})


client.connect("administrator", "xyz123").then(()=>{
    console.log("Connected")
    setTimeout(() => {
        client.subscribe_log("red5.log").then((data)=>{
            console.log("data receoved" + data)
        }).catch((err)=>{
            console.error(err);        
        });
    }, 5000);
    
}).catch((err)=>{
    console.error("Could not connect")
})
