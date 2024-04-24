import * as STOMP from '@stomp/stompjs';
import { AppConstants } from '../core/constants/app-constant';
import { ListKafkaComponent } from '../pages/list-kafka/list-kafka.component';
import { WSStompConfig } from '../ws-config/stomp-config';

export class ServiceActiveWebsocketService {
  private ws_endpoint: string;
  private stompClient: STOMP.Client;
  private listKafkaComponent: ListKafkaComponent;

  constructor(listKafkaComponent: ListKafkaComponent, ws_endpoint: string) {
    this.listKafkaComponent = listKafkaComponent;
    this.ws_endpoint = ws_endpoint;
  }

  connect() {
    // console.log("WS URL:", this.ws_endpoint)
    // const stompConfig = new WSStompConfig(this.ws_endpoint, Cache.getCache(AppConstants.CACHE_TOKEN, Cache.COOKIE), 5000);
    const stompConfig = new WSStompConfig(this.ws_endpoint, "", 5000);
    // Create an instance Stomp Client
    this.stompClient = new STOMP.Client(stompConfig);

    // all subscriptions should be placed inside onConnect
    // as those need to reinstated when the websocket reconnects
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    this.stompClient.onConnect = function (frame) {
      _this.stompClient.subscribe(
        // AppConstants.WS_BROADCAST_TOPIC,
        '/ws-topic/broadcast',
        (message) => {
          if (message.body) {
            // console.log('msg body: ' + message.body);
            const mess = JSON.parse(message.body);
            if (mess.status == AppConstants.NOTI_SUCCESS || mess.status == AppConstants.NOTI_FAILED) {
              _this.listKafkaComponent.getListService(1, 10, '', -1);
            }
          }
        }
      );
      _this.stompClient.subscribe('/errors', (message) => {
        console.log('ListKafkaService - WS Error: ' + message);
      });
    };

    this.stompClient.onStompError = function (frame) {
      // console.log('ListService - WS Error');
      // console.log('Broker reported error: ' + frame.headers['message']);
      // console.log('Additional details: ' + frame.body);
    };

    // Attempt to connect
    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }
}
