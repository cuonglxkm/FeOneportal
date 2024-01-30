import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse } from '../core/models/base-response.model';
import { KafkaCredential } from '../core/models/kafka-credential.model';
import { Pagination } from '../core/models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class KafkaCredentialsService {
  private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';

  constructor(private http: HttpClient) {}

  getCredentials(
    stringSearch: string,
    serviceOrderCode: string,
    page: number,
    size: number
  ): Observable<BaseResponse<Pagination<KafkaCredential[]>>> {
    const params = new HttpParams()
      .set('username', stringSearch)
      .set('serviceOrderCode', serviceOrderCode)
      .set('page', page)
      .set('size', size);

    return this.http.get<BaseResponse<Pagination<KafkaCredential[]>>>(
      `${this.baseUrl}/users`,
      {
        params,
      }
    );
  }
}
