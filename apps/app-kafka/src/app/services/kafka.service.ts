import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { decamelize } from 'humps';
import { Observable } from 'rxjs';
import { AppConstants } from '../core/constants/app-constant';
import { AccessLog, FetchAccessLogs } from '../core/models/access-log.model';
import { BaseResponse } from '../core/models/base-response.model';
import { BrokerConfig } from '../core/models/broker-config.model';
import { InfoConnection } from '../core/models/info-connection.model';
import { Pagination } from '../core/models/pagination.model';
import { BaseService } from './base.service';
import { KafkaInfor } from '../core/models/kafka-infor.model';

@Injectable({
  providedIn: 'root',
})
export class KafkaService extends BaseService {
  private kafkaUrl = this.baseUrl + '/kafka-service';

  constructor(private http: HttpClient) {
    super()
  }

  getInfoConnection(
    serviceOrderCode: string
  ): Observable<BaseResponse<InfoConnection>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);

    return this.http.get<BaseResponse<InfoConnection>>(
      `${this.kafkaUrl}/kafka/connection-info`,
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
      `${this.kafkaUrl}/configs/broker`,
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
      `${this.kafkaUrl}/otp/sendOtpForgotPass?service_order_code=${serviceOrderCode}&user_forgot=${username}`,
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
      `${this.kafkaUrl}/kafka/get-sync-time?service_order_code=${serviceOrderCode}`
    );
  }
  getAccessLogs(
    filters: FetchAccessLogs
  ): Observable<BaseResponse<Pagination<AccessLog[]>>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      params = params.set(decamelize(key), value || '');
    });
    console.log(params);

    return this.http.get<BaseResponse<Pagination<AccessLog[]>>>(
      `${this.kafkaUrl}/kafka/search-logs`,
      {
        params,
      }
    );
  }

  getListService(
    page: number,
    size: number,
    keySearch: string,
    status:number
  ): Observable<BaseResponse<Pagination<KafkaInfor[]>>> {
    const headers = new HttpHeaders()
      .set('userCode', 'bbvk0bs1th0');
    
    return this.http.get<BaseResponse<Pagination<KafkaInfor[]>>>(this.kafkaUrl + `/kafka?page=${page}&size=${size}&keySearch=${keySearch}&status=${status==null?"":status}`,{headers});
  }
}
