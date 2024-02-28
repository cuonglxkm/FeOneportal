import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { decamelize } from 'humps';
import { Observable } from 'rxjs';
import { AppConstants } from '../core/constants/app-constant';
import { AccessLog, FetchAccessLogs } from '../core/models/access-log.model';
import { BaseResponse } from '../core/models/base-response.model';
import { BrokerConfig } from '../core/models/broker-config.model';
import { InfoConnection } from '../core/models/info-connection.model';
import { Pagination } from '../core/models/pagination.model';
import { ListTopicResponse } from '../core/models/topic-response.model';

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
      `${AppConstants.BASE_URL}/kafka-service/kafka/connection-info`,
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
      `${AppConstants.BASE_URL}/kafka-service/configs/broker`,
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

  getListTopic(
    page:number,
    size:number,
    search:string,
    serviceOrderCode: string
  ): Observable<BaseResponse<ListTopicResponse>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);
    return this.http.get<BaseResponse<ListTopicResponse>>(
      `${this.baseUrl}/topic/listTopicPortal?page=${page}&size=${size}&stringToSearch=${search}&serviceOrderCode=${serviceOrderCode}`
    );
  }

  getListPartitions(
    topicName: string,
    serviceOrderCode: string
  ): Observable<BaseResponse<any>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);
    return this.http.get<BaseResponse<any>>(
      `${this.baseUrl}/topic/listPartitions?topic=${
        topicName || ''
      }&serviceOrderCode=${serviceOrderCode || ''}`
    );
  }

  getMessageTopicKafka(
    nameTopic: string,
    serviceOderCode: string,
    page: number,
    size: number,
    from: number,
    to: number,
    listPar: string
  ) {
    nameTopic = nameTopic ? nameTopic : '';
    const local_url = `${this.baseUrl}/topic/listMessages?page=${page}&from=${
      from || ''
    }&to=${
      to || ''
    }&size=${size}&topic=${nameTopic}&partitions=${listPar}&serviceOrderCode=${serviceOderCode}`;
    return this.http.get(local_url);
  }

  getSyncTime(serviceOrderCode: string) {
    return this.http.get(
      `${this.baseUrl}/kafka/get-sync-time?service_order_code=${serviceOrderCode}`
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
      `${AppConstants.BASE_URL}/kafka-service/kafka/search-logs`,
      {
        params,
      }
    );
  }

  createTopic(
    topicName: string,
    partitionNum: number,
    replicationFactorNum: number,
    serviceOrderCode: string,
    openSet: number,
    jsonConfig: string
  ) {
    const json = {
      "service_order_code": serviceOrderCode,
      "is_advanced": openSet,
      "partition_num": partitionNum,
      "replica_num": replicationFactorNum,
      "topic_list": topicName,
      "config_map": jsonConfig
    }
    const local_url = `${this.baseUrl}/topic/createTopicPortal`;
    return this.http.post(local_url, json);
  }

  testProduce(obj: any) {
    return this.http.post(`${this.baseUrl}/topic/testProducer`, obj);
  }

  deleteMessages(topicName: string, serviceOrderCode: string): Observable<any> {
    const json = {
      service_order_code: serviceOrderCode,
      topic: topicName
    }

    return this.http.post(`${this.baseUrl}/topic/deleteMessages`, json);
  }

  deleteTopicKafka(
    nameTopic: string,
    serviceOderCode: string
  ) {
    const local_url = `${this.baseUrl}/topic/deleteTopicPortal?topicName=${nameTopic}&serviceOrderCode=${serviceOderCode}`;
    return this.http.get(local_url);
  }

  updateTopic(
    topicName: string,
    serviceOrderCode: string,
    jsonConfig: object
  ) {
    const json = jsonConfig;
    const local_url = `${this.baseUrl}/topic/updateTopicPortal?topicName=${topicName}&serviceOrderCode=${serviceOrderCode}`;
    return this.http.post(local_url, json);
  }
}
