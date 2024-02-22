import { Injectable } from '@angular/core';
import { Client, StompConfig, messageCallbackType } from '@stomp/stompjs';


@Injectable({
  providedIn: 'root',
})
export class NotificationWsService {

  private readonly wsUrl: string = 'ws://127.0.0.1:16003/k8s-service/ws-endpoint';

  private client: Client;

  private onConnectCb?: Function;
  private onDisconnectCb?: Function;
  private onErrorCb?: Function;
  private _isConnected: boolean;

  private static instance: NotificationWsService;

  constructor() {
    const stompConfig = new WSStompConfig(this.wsUrl, "", 5000);

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
}

class WSStompConfig extends StompConfig {
  constructor(url: string, token: string, reconnectDelay: number) {
    super();
    this.brokerURL = url;
    this.debug = (str) => {
      console.log('STOMP: url = ' + url + "\n" + str);
    };
    this.reconnectDelay = reconnectDelay;

    // this.connectHeaders = {'Authorization': 'Bearer ' + token}
  }
}
