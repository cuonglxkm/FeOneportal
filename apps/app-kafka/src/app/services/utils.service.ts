import { Injectable } from '@angular/core';
import { AppConstants } from '../core/constants/app-constant';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class UtilService extends BaseService{

  public parseWsEndpoint() {
    const baseApiUrl = this.baseUrl + '/kafka-service'
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
}
