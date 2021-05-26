import { IClientChannel, IServiceChannel} from "../grahil_interfaces";
import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher } from "strongly-typed-events";


export class ChannelEventProvider implements IServiceChannel {

        /* Events */
        _onChannelData = new SimpleEventDispatcher<number>();
        _onChannelState = new SimpleEventDispatcher();


        constructor () {

        }


        public get onChannelData() {
            return this._onChannelData.asEvent();
        }
        
        public get onChannelState() {
            return this._onChannelState.asEvent();
        }
    
}



export class ClientEventProvider implements IClientChannel {

    /* Events */
    _onClientSimpleNotification = new SimpleEventDispatcher(); // for simple text notification
    _onClientDataNotification = new SimpleEventDispatcher<any>(); // for text notification with data
    _onClientData = new SimpleEventDispatcher<any>(); // for data only
    _onClientState = new SimpleEventDispatcher<any>(); // for state only


    constructor () {

    }


    public get onClientSimpleNotification() {
        return this._onClientSimpleNotification.asEvent();
    }
    
    public get onClientDataNotification() {
        return this._onClientDataNotification.asEvent();
    }

    public get onClientData() {
        return this._onClientData.asEvent();
    }

    public get onClientState() {
        return this._onClientState.asEvent();
    }

}