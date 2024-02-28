import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, filter, map } from 'rxjs';
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
export class topicService {
  private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';
  private localUrl = 'http://localhost:16004/kafka-service';

  constructor(private http: HttpClient) {}

  getListTopic(
    page:number,
    size:number,
    search:string,
    serviceOrderCode: string
  ): Observable<BaseResponse<ListTopicResponse>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);
    return this.http.get<BaseResponse<ListTopicResponse>>(
      `${this.localUrl}/topics?page=${page}&size=${size}&keySearch=${search}&serviceOrderCode=${serviceOrderCode}`
    );
  }

  getListPartitions(
    topicName: string,
    serviceOrderCode: string
  ): Observable<BaseResponse<any>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);
    return this.http.get<BaseResponse<any>>(
      `${this.localUrl}/topics/listPartitions?topicName=${
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
    const local_url = `${this.localUrl}/topics/listMessages?page=${page}&from=${
      from || ''
    }&to=${
      to || ''
    }&size=${size}&topic=${nameTopic}&partitions=${listPar}&serviceOrderCode=${serviceOderCode}`;
    return this.http.get(local_url);
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
    const local_url = `${this.localUrl}/topics`;
    return this.http.post(local_url, json);
  }

  testProduce(obj: any) {
    return this.http.post(`${this.localUrl}/topics/testProducer`, obj);
  }

  deleteMessages(topicName: string, serviceOrderCode: string): Observable<any> {
    return this.http.delete(`${this.localUrl}/topics/deleteMessages?topicName=${topicName}&serviceOrderCode=${serviceOrderCode}`);
  }

  deleteTopicKafka(
    nameTopic: string,
    serviceOderCode: string
  ) {
    const local_url = `${this.localUrl}/topics?topicName=${nameTopic}&serviceOrderCode=${serviceOderCode}`;
    return this.http.delete(local_url);
  }

  updateTopic(
    topicName: string,
    serviceOrderCode: string,
    jsonConfig: object
  ) {
    const json = jsonConfig;
    const local_url = `${this.localUrl}/topics?topicName=${topicName}&serviceOrderCode=${serviceOrderCode}`;
    return this.http.put(local_url, json);
  }

  getListKafkaSystem() {
    const headers = new HttpHeaders().set('usercode', 'bbvk0bs1th0');
    return this.http.get(`${this.localUrl}/topics/kafka-system-by-user`,{headers}).pipe(
      filter((r: any) => r && r.code == 200),
      map(r => r.data),
      catchError(response => {
        console.error('fail to get list kafka system: ', response);
        return EMPTY;
      })
    );
  }

  createTopicInitual(obj: any) {
    const local_url = `${this.localUrl}/topics`;
    return this.http.post(local_url, obj);
  }

  
  getSyncTime(serviceOrderCode: string) {
    return this.http.get(
      `${this.baseUrl}/kafka/get-sync-time?service_order_code=${serviceOrderCode}`
    );
  }
}
