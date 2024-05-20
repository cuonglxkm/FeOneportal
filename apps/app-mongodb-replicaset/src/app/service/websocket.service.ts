import { Client, messageCallbackType, StompConfig } from '@stomp/stompjs';

import { environment } from '@env/environment';

export class WebsocketService {

  private readonly wsUrl: string ;

  private client: Client;

  private onConnectCb?: Function;
  private onDisconnectCb?: Function;
  private onErrorCb?: Function;
  private _isConnected = false;

  private static instance: WebsocketService;

  constructor() {

    this.wsUrl = buildWebsocketUrl();
    
    let stompConfig = new WSStompConfig(this.wsUrl, "", 5000);

    this.client = new Client(stompConfig);

    this.client.onConnect = () => {
      this._isConnected = true;
      this.onConnectCb && this.onConnectCb();
    };

    this.client.onDisconnect = () => {
      this._isConnected = false;
      this.onDisconnectCb && this.onDisconnectCb();
    };

    this.client.onStompError = (frame: any) => {
      console.error('WS: Broker reported error: ' + frame.headers['message']);
      console.error('WS: Additional details: ' + frame.body);
      this.onErrorCb && this.onErrorCb();
    };

  }

  static getInstance(): WebsocketService {
    if (!WebsocketService.instance) {
      return new WebsocketService();
    }
    return WebsocketService.instance;
  }

  connect(onConnectCb: Function, onDisconnectCb: Function, onErrorCb: Function): void {

    this.onConnectCb = onConnectCb;
    this.onDisconnectCb = onDisconnectCb;
    this.onErrorCb = onErrorCb;

    this.client.activate();

  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }

  subscribe(destination: string, cb: messageCallbackType): void {
    this.client.subscribe(destination, cb);
  }

  unsubscribe(destination: string) {
    this.client.unsubscribe(destination);
  }

  sendMessage(destination: string, body: string): void {
    this.client.publish({ destination, body });
  }

}


export function buildWebsocketUrl() {

  const baseApiUrl = environment['baseUrlWs'];
  let url = baseApiUrl;

  if (baseApiUrl.toLowerCase().startsWith('https://')) {
    url = 'wss://' + baseApiUrl.toLowerCase().substring(8);
  }
  else if (baseApiUrl.toLowerCase().startsWith('http://')) {
    url = 'ws://' + baseApiUrl.toLowerCase().substring(7);
  }

  // url += '/notification-ws-service/ws-endpoint?token=' + Cache.getCache(Constants.CACHE_TOKEN, Cache.COOKIE);
  url += '/notification-service/ws-endpoint';

  return url;
}


class WSStompConfig extends StompConfig {
  constructor(url: string, token: string, reconnectDelay: number) {
    super();
    this.brokerURL = url;
    this.debug = (str) => {
      console.log('STOMP: url = ' + url + "\n" + str);
    };
    this.reconnectDelay = reconnectDelay;
    
    this.connectHeaders = {'Authorization': 'Bearer ' + token}
  }
}