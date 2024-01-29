import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { BaseResponse } from '../core/models/base-response.model';
import { InfoConnection } from '../core/models/info-connection.model';
import { Observable } from 'rxjs';
import { BrokerConfig } from '../core/models/broker-config.model';

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

  getBrokerConfigOfService(serviceOrderCode: string): Observable<BaseResponse<BrokerConfig[]>> {
    const params = new HttpParams().set('service_order_code', serviceOrderCode);

    return this.http.get<BaseResponse<BrokerConfig[]>>(`${this.baseUrl}/config/broker-config`, {
      params,
    });
  }
}
