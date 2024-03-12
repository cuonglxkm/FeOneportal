import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { EMPTY, Observable, catchError, filter, map } from 'rxjs';
import { BaseResponse } from '../core/models/base-response.model';
import { KafkaMessage } from '../core/models/kafka-message.model';
import { KafkaTopic } from '../core/models/kafka-topic.model';
import { Pagination } from '../core/models/pagination.model';
import { FetchTopicMessages } from '../core/models/topic-messages.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class TopicService extends BaseService {
  private kafkaUrl = this.baseUrl + '/kafka-service';
  private topicUrl = this.kafkaUrl + this.ENDPOINT.topics;

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  getListTopic(
    page: number,
    size: number,
    search: string,
    serviceOrderCode: string
  ): Observable<BaseResponse<Pagination<KafkaTopic>>> {
    return this.http.get<BaseResponse<Pagination<KafkaTopic>>>(
      `${this.topicUrl}?page=${page}&size=${size}&keySearch=${search}&serviceOrderCode=${serviceOrderCode}`
    );
  }

  getListPartitions(
    topicName: string,
    serviceOrderCode: string
  ): Observable<BaseResponse<any>> {
    return this.http.get<BaseResponse<any>>(
      `${this.topicUrl}/listPartitions?topicName=${
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
    const url = `${this.topicUrl}/listMessages?page=${page}&from=${
      from || ''
    }&to=${
      to || ''
    }&size=${size}&topic=${nameTopic}&partitions=${listPar}&serviceOrderCode=${serviceOderCode}`;
    return this.http.get<BaseResponse<Pagination<KafkaMessage>>>(url);
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
      service_order_code: serviceOrderCode,
      is_advanced: openSet,
      partition_num: partitionNum,
      replica_num: replicationFactorNum,
      topic_list: topicName,
      config_map: jsonConfig,
    };
    return this.http.post(this.topicUrl, json);
  }

  testProduce(obj: any) {
    return this.http.post(`${this.topicUrl}/testProducer`, obj);
  }

  deleteMessages(topicName: string, serviceOrderCode: string): Observable<any> {
    return this.http.delete(
      `${this.topicUrl}/deleteMessages?topicName=${topicName}&serviceOrderCode=${serviceOrderCode}`
    );
  }

  deleteTopicKafka(nameTopic: string, serviceOderCode: string) {
    const local_url = `${this.topicUrl}?topicName=${nameTopic}&serviceOrderCode=${serviceOderCode}`;
    return this.http.delete(local_url);
  }

  updateTopic(topicName: string, serviceOrderCode: string, jsonConfig: object) {
    const json = jsonConfig;
    const local_url = `${this.topicUrl}?topicName=${topicName}&serviceOrderCode=${serviceOrderCode}`;
    return this.http.put(local_url, json);
  }

  getListKafkaSystem() {
    const headers = new HttpHeaders().set('usercode', 'bbvk0bs1th0');
    return this.http
      .get(`${this.topicUrl}/kafka-system-by-user`, { headers })
      .pipe(
        filter((r: any) => r && r.code == 200),
        map((r) => r.data),
        catchError((response) => {
          console.error('fail to get list kafka system: ', response);
          return EMPTY;
        })
      );
  }

  createTopicInitual(obj: any) {
    const local_url = `${this.topicUrl}`;
    return this.http.post(local_url, obj);
  }

  getSyncTime(serviceOrderCode: string) {
    return this.http.get(
      `${this.kafkaUrl}/kafka/get-sync-time?service_order_code=${serviceOrderCode}`
    );
  }

  getTopicMessagesSSE(req: FetchTopicMessages) {
    const eventSource = new EventSource(
      `${this.topicUrl}/messages2?service_order_code=${
        req.serviceOrderCode
      }&topic=${req.topic}&partitions=${req.partitions || ''}&from=${
        req.from || 0
      }&to=${req.to || 0}`
    );

    return eventSource;
  }
}
