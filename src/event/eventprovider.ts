import { IClientChannel, IServiceChannel} from "../grahil_interfaces";
import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher, ISimpleEvent } from "strongly-typed-events";


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
    _onTextNotificationEvent = new SimpleEventDispatcher<any>();
    _onTextDataNotificationEvent = new SimpleEventDispatcher<any>();
    _ontDataEvent = new SimpleEventDispatcher<any>();
    _onClientStateChangeEvent = new SimpleEventDispatcher<any>();
    _onStatsEvent = new SimpleEventDispatcher<any>();
    _onLogEvent = new SimpleEventDispatcher<any>();
    _onServerPing = new SimpleEventDispatcher<any>();


    constructor () {

    }


    public get onTextNotificationEvent() {
        return this._onTextNotificationEvent.asEvent();
    }
    
    public get onTextDataNotificationEvent() {
        return this._onTextDataNotificationEvent.asEvent();
    }

    public get onArbitraryData() {
        return this._ontDataEvent.asEvent();
    }

    public get onStatsData() {
        return this._onStatsEvent.asEvent();
    }

    public get onLogData() {
        return this._onLogEvent.asEvent();
    }

    public get onClientState(){
        return this._onClientStateChangeEvent.asEvent()
    }

    public get onServerPing(){
        return this._onServerPing.asEvent()
    }

}