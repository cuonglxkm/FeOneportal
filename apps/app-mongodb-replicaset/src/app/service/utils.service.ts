import { Injectable } from '@angular/core';
import { AppConstants } from '../constant/app-constant';
import { BaseService } from '../shared/services/base.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NotiStatusEnum } from '../enum/noti-status.enum';

@Injectable({ providedIn: 'root' })
export class UtilService extends BaseService {

  constructor(private notification: NzNotificationService) {
    super();
  }

  public parseWsEndpoint() {
    const baseApiUrl = this.baseUrl + '/mongodb-service'
    const ws_endpoint =
      AppConstants.WS_ENDPOINT;
    let ws_prefix: string;
    if (baseApiUrl.toLowerCase().startsWith('https://')) {
      ws_prefix = 'wss://' + baseApiUrl.toLowerCase().substring(8);
    } else if (baseApiUrl.toLowerCase().startsWith('http://')) {
      ws_prefix = 'ws://' + baseApiUrl.toLowerCase().substring(7);
    } else {
      ws_prefix = baseApiUrl;
    }
    return (
      ws_prefix +
      (ws_prefix.endsWith('/') ? ws_endpoint.substr(1) : ws_endpoint)
    );
  }

  public showNotification(status: NotiStatusEnum, msg: string, title?: string) {
    title = title ? title : "Thông báo";
    switch (status) {
      case NotiStatusEnum.SUCCESS:
        this.notification.success(title, msg);
        break;
      case NotiStatusEnum.ERROR:
        this.notification.error(title, msg);
        break;
      case NotiStatusEnum.WARNING:
        this.notification.warning(title, msg);
        break;
    }
  }

}
