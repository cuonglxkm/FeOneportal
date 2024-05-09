import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { decamelize } from 'humps';
import { Observable } from 'rxjs';
import { AccessLog, FetchAccessLogs } from '../core/models/access-log.model';
import { BaseResponse } from '../core/models/base-response.model';
import { BrokerConfig } from '../core/models/broker-config.model';
import { InfoConnection } from '../core/models/info-connection.model';
import { KafkaCreateReq, KafkaUpdateReq, KafkaUpgradeReq, RegionResource } from '../core/models/kafka-create-req.model';
import { KafkaDetail, KafkaInfor } from '../core/models/kafka-infor.model';
import { Pagination } from '../core/models/pagination.model';
import { ServicePack } from '../core/models/service-pack.model';
import { BaseService } from './base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { KafkaVersion } from '../core/models/kafka-version.model';
import { KafkaStatus } from '../core/models/status.model';
import { OfferItem, UnitPrice } from '../core/models/offer.model';
import { SyncInfoModel } from '../core/models/sync-info.model';

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
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
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

  forgotPassword(
    serviceOrderCode: string,
    username: string
  ): Observable<BaseResponse<string>> {

    const json = {
      'service_order_code': serviceOrderCode,
      'username': username
    };

    return this.http.post<BaseResponse<string>>(
      `${this.kafkaUrl}/users/forgot-password`, json
    );
  }

  verifyOtp(
    serviceOrderCode: string,
    username: string,
    otp: string
  ): Observable<BaseResponse<string>> {

    const json = {
      'service_order_code': serviceOrderCode,
      'username': username,
      'otp': otp
    }

    return this.http.post<BaseResponse<string>>(
      `${this.kafkaUrl}/users/verify-otp`, json
    );
  }

  getSyncTime(serviceOrderCode: string): Observable<BaseResponse<SyncInfoModel>> {
    return this.http.get<BaseResponse<SyncInfoModel>>(
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
    status:number,
    regionId: string,
    projectId: string
  ): Observable<BaseResponse<Pagination<KafkaInfor[]>>> {
    return this.http.get<BaseResponse<Pagination<KafkaInfor[]>>>(this.kafkaUrl + `/kafka?page=${page}&size=${size}&keySearch=${keySearch.trim()}&status=${status==null?"":status}&regionId=${regionId}&projectId=${projectId}`,{headers: this.getHeaders()});
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

  upgrade(req: KafkaUpgradeReq): Observable<BaseResponse<null>> {
    const json = {
      'service_order_code': req.serviceOrderCode,
      'service_name': req.serviceName,
      'version': req.version,
      'description': req.description,
      'regionId': req.regionId,
      'ram': req.ram,
      'cpu': req.cpu,
      'storage': req.storage,
      'usage_time': req.usageTime,
      'service_pack_code': req.servicePackCode
    };

    return this.http.post<BaseResponse<null>>(this.kafkaUrl + '/kafka/upgrade', json, {headers: this.getHeaders()})
  }

  delete(serviceOrderCode: string): Observable<BaseResponse<null>> {
    return this.http.delete<BaseResponse<null>>(this.kafkaUrl + `/kafka/delete/${serviceOrderCode}`);
  }

  getListOffers(regionId: number, unitOfMeasureProduct: string): Observable<OfferItem[]> {
    return this.http.get<OfferItem[]>(
      `${this.baseUrl}/catalogs/offers?regionId=${regionId}&unitOfMeasureProduct=${unitOfMeasureProduct}`
    );
  }

  getUnitPrice(): Observable<BaseResponse<UnitPrice[]>> {
    return this.http.get<BaseResponse<UnitPrice[]>>(this.kafkaUrl + '/kafka/get-unit-price');
  }

  checkRegionResource(req: RegionResource): Observable<BaseResponse<null>> {
    const json = {
      'region_id': req.regionId,
      'ram': req.ram,
      'cpu': req.cpu,
      'storage': req.storage
    };

    return this.http.post<BaseResponse<null>>(this.kafkaUrl + `/kafka/check-resource`, json);
  }

  checkExistedService(serviceName: string, regionId: number, projectId: number): Observable<BaseResponse<null>> {
    const json = {
      'service_name': serviceName,
      'region_id': regionId,
      'project_id': projectId
    };

    return this.http.post<BaseResponse<null>>(`${this.kafkaUrl}/kafka/check-existed`, json);
  }

}
