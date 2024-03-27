import { StompConfig } from '@stomp/stompjs';

export class WSStompConfig extends StompConfig {
  constructor(url: string, token: string, reconnectDelay: number) {
    super();
    this.brokerURL = url;
    this.debug = (str) => {
      console.log('ListKafkaService STOMP: ' + str + ' url: ' + url);
    };
    this.reconnectDelay = reconnectDelay;

    this.connectHeaders = {'Authorization': 'Bearer ' + token}
    
  }
}
