import { IClientChannel, IServiceChannel,IServiceClient} from "../grahil_interfaces";
import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher, ISimpleEvent } from "strongly-typed-events";
import { GrahilClientDataNotificationEvent, GrahilClientSimpleNotificationEvent, SimpleNotificationData } from "../models";


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
    _onTextNotificationEvent = new SimpleEventDispatcher<GrahilClientSimpleNotificationEvent>();
    _onTextDataNotificationEvent = new SimpleEventDispatcher<GrahilClientDataNotificationEvent>();
    _onDataEvent = new SimpleEventDispatcher<any>();
    _onClientStateUpdate = new SimpleEventDispatcher<any>();


    constructor () {

    }


    public get onTextNotification() {
        return this._onTextNotificationEvent.asEvent();
    }
    
    public get onTextDataNotification() {
        return this._onTextDataNotificationEvent.asEvent();
    }

    public get onServerData() {
        return this._onDataEvent.asEvent();
    }

    public get onClientStateUpdate(){
        return this._onClientStateUpdate.asEvent()
    }

}