import { Inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public connection: any;

  constructor(private notification: NzNotificationService, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  public async initiateSignalrConnection(isRegisterGlobalMessage = false): Promise<void> {

    let hubUrl = 'http://127.0.0.1:1019' + '/notify';

    var tokenModel = this.tokenService.get();

    if (tokenModel == null || Object.keys(tokenModel).length === 0) {
      return;
    }

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
            accessTokenFactory: () => {
              return this.getAccessToken();
            }
        })
        .configureLogging(signalR.LogLevel.None)
        .withAutomaticReconnect()
        .build();

      await this.connection.start();
      if (isRegisterGlobalMessage == true) {
        this.registerGlobalNotification();
      }

      //this.notification.success('Thông báo', 'Kết nối tới máy chủ thành công')
    }
    catch (error) {
      console.log(`SignalR connection error: ${error}`);
      //this.notification.error('Lỗi máy chủ', 'Kết nối tới máy chủ đang bị gián đoạn')
    }
  }

  public getAccessToken() {
    return new Promise<string>((resolve) => {
          var token = this.tokenService.get()?.token;
          if (token) {
            resolve(token);
          }
      }
    )
 }

  private registerGlobalNotification(): void {
    this.connection.on('SendMessage', (data: any) => {
      if (data.notificationType != undefined){
        switch (data.notificationType) {
          case "SUCCESS":
            this.notification.success('Thông báo', data.message);
            break;
          case "ERROR":
            this.notification.error('Lỗi', data.message);
            break;
          case "INFORMATION":
            this.notification.info('Thông báo', data.message);
            break;
          case "WARNING":
            this.notification.warning('Cảnh báo', data.message);
            break;
        }
      }
    });
  }
}