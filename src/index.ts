/*
import {SampleClient} from './test'
const a = new SampleClient()
*/

import {GrahilApiClient} from './client'

const client = new GrahilApiClient({        
    host: "localhost",
    port: 8000
})

client.connect("administrator", "xyz123")
