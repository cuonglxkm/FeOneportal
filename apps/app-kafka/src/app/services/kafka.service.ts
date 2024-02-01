import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { BaseResponse } from '../core/models/base-response.model';
import { InfoConnection } from '../core/models/info-connection.model';
import { Observable } from 'rxjs';
import { BrokerConfig } from '../core/models/broker-config.model';
import { AppConstants } from '../core/constants/app-constant';

@Injectable({
  providedIn: 'root',
})
export class KafkaService {
  private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';

  constructor(private http: HttpClient) {}

  getInfoConnection(
    serviceOrderCode: string
  ): Observable<BaseResponse<InfoConnection>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);

    return this.http.get<BaseResponse<InfoConnection>>(
      `${this.baseUrl}/topic/get-info-connection`,
      {
        params,
      }
    );
  }

  getBrokerConfigOfService(
    serviceOrderCode: string
  ): Observable<BaseResponse<BrokerConfig[]>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);

    return this.http.get<BaseResponse<BrokerConfig[]>>(
      `${this.baseUrl}/config/broker-config`,
      {
        params,
      }
    );
  }

  sendOtpForgotPassword(
    serviceOrderCode: string,
    username: string
  ): Observable<BaseResponse<string>> {
    return this.http.post<BaseResponse<string>>(
      `${this.baseUrl}/otp/sendOtpForgotPass?service_order_code=${serviceOrderCode}&user_forgot=${username}`,
      null
    );
  }

  verifyOtpForgotPassword(
    keyCheckOtp: string,
    serviceOrderCode: string,
    otpValue: string
  ): Observable<BaseResponse<string>> {
    const topic: string = AppConstants.TOPIC_FORGOT_PASS;
    // fix user_code from local storage
    const userCode = localStorage.getItem('user_code');

    return this.http.post<BaseResponse<string>>(
      `http://api.galaxy.vnpt.vn:30383/notification-ws-service/otp/committee-verify`,
      {
        keyCheckOtp,
        otpValue,
        topic,
        data: JSON.stringify({
          service_order_code: serviceOrderCode,
          user_code: userCode,
        }),
      }
    );
  }
}
