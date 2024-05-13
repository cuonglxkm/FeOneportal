import { Injectable } from '@angular/core';
import { Client, StompConfig, messageCallbackType } from '@stomp/stompjs';
import { NotificationConstant } from '../constants/notification.constant';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationWsService {

  // private readonly wsUrl: string = `wss://api.onsmartcloud.com/k8s-service/ws-endpoint`;
  // private readonly wsUrl: string = 'wss://idg-api-gw.onsmartcloud.com/k8s-service/ws-endpoint';

  private client: Client;

  private onConnectCb?: Function;
  private onDisconnectCb?: Function;
  private onErrorCb?: Function;
  private _isConnected: boolean;

  private static instance: NotificationWsService;
  baseApiUrl = environment['baseUrl'];

  constructor() {
    const wsUrl = this.parseWsEndpoint(this.baseApiUrl);
    const stompConfig = new WSStompConfig(wsUrl, "", 5000);

    this.client = new Client(stompConfig);

    this.client.onConnect = () => {
      this._isConnected = true;
      this.onConnectCb && this.onConnectCb();
    };

    this.client.onDisconnect = () => {
      this._isConnected = false;
      this.onDisconnectCb && this.onDisconnectCb();
    };

    this.client.onStompError = (frame) => {
      console.error('WS: Broker reported error: ' + frame.headers['message']);
      console.error('WS: Additional details: ' + frame.body);
      this.onErrorCb && this.onErrorCb();
    };
  }

  static getInstance(): NotificationWsService {
    if (!NotificationWsService.instance) {
      return new NotificationWsService();
    }
    return NotificationWsService.instance;
  }

  connect(onConnectCb: Function, onDisconnectCb?: Function, onErrorCb?: Function): void {

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

  sendMessage(destination: string, body: string): void {
    this.client.publish({ destination, body });
  }

  parseWsEndpoint(baseUrl: string) {
    const baseApiUrl = baseUrl + '/k8s-service'
    const wsEndpoint = NotificationConstant.WS_ENDPOINT;

    let wsPrefix: string;
    if (baseApiUrl.toLowerCase().startsWith('https://')) {
      wsPrefix = 'wss://' + baseApiUrl.toLowerCase().substring(8);
    } else if (baseApiUrl.toLowerCase().startsWith('http://')) {
      wsPrefix = 'ws://' + baseApiUrl.toLowerCase().substring(7);
    } else {
      wsPrefix = baseApiUrl;
    }
    return (
      wsPrefix +
      (wsPrefix.endsWith('/') ? wsEndpoint.substr(1) : wsEndpoint)
    );
  }
}

class WSStompConfig extends StompConfig {
  constructor(url: string, token: string, reconnectDelay: number) {
    super();
    this.brokerURL = url;
    this.debug = (str) => {
      console.log('STOMP: url = ' + url + "\n" + str);
    };
    this.reconnectDelay = reconnectDelay;

    this.connectHeaders = {'Authorization': 'Bearer ' + token};
  }
}
