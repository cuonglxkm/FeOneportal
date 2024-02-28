import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConstants } from '../core/constants/app-constant';
import { BaseResponse } from '../core/models/base-response.model';
import { BrokerConfig } from '../core/models/broker-config.model';
import { InfoConnection } from '../core/models/info-connection.model';
import { ListTopicResponse } from '../core/models/topic-response.model';
import { AccessLog, FetchAccessLogs } from '../core/models/access-log.model';
import { Pagination2 } from '../core/models/pagination2.model';
import { decamelize } from 'humps';

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

  getSyncTime(serviceOrderCode: string) {
    return this.http.get(
      `${this.baseUrl}/kafka/get-sync-time?service_order_code=${serviceOrderCode}`
    );
  }
  getAccessLogs(
    filters: FetchAccessLogs
  ): Observable<BaseResponse<Pagination2<AccessLog[]>>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      params = params.set(decamelize(key), value || '');
    });
    console.log(params);

    return this.http.get<BaseResponse<Pagination2<AccessLog[]>>>(
      `${this.baseUrl}/kafka/search-logs`,
      {
        params,
      }
    );
  }
}
