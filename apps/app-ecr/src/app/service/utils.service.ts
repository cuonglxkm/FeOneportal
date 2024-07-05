import { NotiStatusEnum } from 'apps/app-mongodb-replicaset/src/app/enum/noti-status.enum';
import { I18NService } from '@core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AppConstants } from 'apps/app-mongodb-replicaset/src/app/constant/app-constant';
import { Inject, Injectable } from '@angular/core';
import { BaseService } from '../shared/services/base.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ALAIN_I18N_TOKEN } from '@delon/theme';

@Injectable({ providedIn: 'root' })
export class UtilService extends BaseService {

  constructor(private notification: NzNotificationService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) {
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

  public showNotification(status: NotiStatusEnum, msg: string) {
    switch (status) {
      case NotiStatusEnum.SUCCESS:
        this.notification.success(this.i18n.fanyi('app.status.success'), msg);
        break;
      case NotiStatusEnum.ERROR:
        this.notification.error(this.i18n.fanyi('app.status.fail'), msg);
        break;
      case NotiStatusEnum.WARNING:
        this.notification.warning(this.i18n.fanyi('app.status.fail'), msg);
        break;
    }
  }

}
