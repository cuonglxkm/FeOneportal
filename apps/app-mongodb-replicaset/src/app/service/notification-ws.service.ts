import { Injectable, OnDestroy } from '@angular/core';
import { messageCallbackType } from '@stomp/stompjs';
import { WebsocketService } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class NotificationWsService implements OnDestroy {

  private wsService: WebsocketService;

  constructor() {
    //
  }
  
  ngOnDestroy(): void {
    console.log("close NotificationWsService");
    this.close();
  }

  public openWs(topicCBs: Array<{ topic: string, cb: messageCallbackType }>) {
    const _this = this;
    setTimeout(() => {
      _this.wsService = WebsocketService.getInstance();
      _this.wsService.connect(
        () => {
          for (const topicCB of topicCBs) {
            _this.wsService.subscribe(topicCB.topic, topicCB.cb);
          }
        },
        () => { },
        () => { });
    }, 1000);

  }

  public close() {
    if (this.wsService) {
      this.wsService.disconnect();
    }
  }

}