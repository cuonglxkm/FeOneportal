import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { decamelize } from 'humps';
import { Observable } from 'rxjs';
import { AppConstants } from '../core/constants/app-constant';
import { AccessLog, FetchAccessLogs } from '../core/models/access-log.model';
import { BaseResponse } from '../core/models/base-response.model';
import { BrokerConfig } from '../core/models/broker-config.model';
import { InfoConnection } from '../core/models/info-connection.model';
import { KafkaCreateReq, KafkaUpdateReq } from '../core/models/kafka-create-req.model';
import { KafkaDetail, KafkaInfor } from '../core/models/kafka-infor.model';
import { Pagination } from '../core/models/pagination.model';
import { ServicePack } from '../core/models/service-pack.model';
import { BaseService } from './base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { KafkaVersion } from '../core/models/kafka-version.model';
import { KafkaStatus } from '../core/models/status.model';

@Injectable({
  providedIn: 'root',
})
export class KafkaService extends BaseService {
  private kafkaUrl = this.baseUrl + '/kafka-service';

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {

    super()
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
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

  getFlux() {
    const eventSource = new EventSource(
      `${this.kafkaUrl}/kafka/ws`
    );

    return eventSource;
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
    return this.http.get<BaseResponse<Pagination<KafkaInfor[]>>>(this.kafkaUrl + `/kafka?page=${page}&size=${size}&keySearch=${keySearch.trim()}&status=${status==null?"":status}`,{headers: this.getHeaders()});
  }

  createKafkaService(req: KafkaCreateReq): Observable<BaseResponse<null>> {
    const json = {
      'service_name': req.serviceName,
      'version': req.version,
      'description': req.description,
      'region_id': "1",
      'config_type': req.configType ,
      'service_pack_code': req.servicePackCode, 
      'ram': req.ram,
      'cpu': req.cpu,
      'storage': req.storage,
      'brokers': req.brokers, 
      'usage_time': req.usageTime,
      'num_partitions': req.numPartitions, 
      'default_replication_factor': req.defaultReplicationFactor,
      'min_insync_replicas': req.minInsyncReplicas,
      'offset_topic_replication_factor': req.offsetTopicReplicationFactor,
      'log_retention_hours': req.logRetentionHours,
      'log_segment_bytes': req.logSegmentBytes
    };

    return this.http.post<BaseResponse<null>>(this.kafkaUrl + '/kafka/create', json, {headers: this.getHeaders()});
  }

  getListPackageAvailable(): Observable<BaseResponse<ServicePack[]>> {
    return this.http.get<BaseResponse<ServicePack[]>>(this.kafkaUrl + '/kafka/get-packages');
  }

  getListVersion(): Observable<BaseResponse<KafkaVersion[]>> {
    return this.http.get<BaseResponse<KafkaVersion[]>>(this.kafkaUrl + '/kafka/get-versions');
  }

  getListStatus(): Observable<BaseResponse<KafkaStatus[]>> {
    return this.http.get<BaseResponse<KafkaStatus[]>>(this.kafkaUrl + '/kafka/get-status');
  }

  getDetail(serviceOrderCode: string): Observable<BaseResponse<KafkaDetail>> {
    return this.http.get<BaseResponse<KafkaDetail>>(this.kafkaUrl + `/kafka/${serviceOrderCode}`);
  }

  update(req: KafkaUpdateReq): Observable<BaseResponse<null>> {
    const json = {
      'service_order_code': req.serviceOrderCode,
      'service_name': req.serviceName,
      'version': req.version,
      'description': req.description
    };

    return this.http.post<BaseResponse<null>>(this.kafkaUrl + '/kafka/update', json, {headers: this.getHeaders()});
  }
}
