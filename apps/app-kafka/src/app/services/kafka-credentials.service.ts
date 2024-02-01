import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { decamelizeKeys } from 'humps';
import { Observable, ReplaySubject } from 'rxjs';
import { BaseResponse } from '../core/models/base-response.model';
import {
  ChangePasswordKafkaCredential,
  CreateKafkaCredentialData,
  KafkaCredential,
  NewPasswordKafkaCredential,
} from '../core/models/kafka-credential.model';
import { Pagination } from '../core/models/pagination.model';
@Injectable({
  providedIn: 'root',
})
export class KafkaCredentialsService {
  private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';
  selectedCredential = new ReplaySubject<KafkaCredential>();
  activatedTab = new ReplaySubject<number>();

  constructor(private http: HttpClient) {}

  setCredential(credential: KafkaCredential) {
    this.selectedCredential.next(credential);
  }

  setActivateTab(tab: number) {
    this.activatedTab.next(tab);
  }

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

  createCredential(
    data: CreateKafkaCredentialData
  ): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/users/createUser`,
      decamelizeKeys(data)
    );
  }

  deleteUser(
    serviceOrderCode: string,
    username: string
  ): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/users/deleteUser`,
      {
        service_order_code: serviceOrderCode,
        username,
      }
    );
  }

  updatePassword(
    data: ChangePasswordKafkaCredential
  ): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/users/updateUser`,
      decamelizeKeys(data)
    );
  }

  createNewPassword(data: NewPasswordKafkaCredential) {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/users/createNewPass`,
      decamelizeKeys(data)
    );
  }
}
