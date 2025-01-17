import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
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
import { BaseService } from './base.service';
@Injectable({
  providedIn: 'root',
})
export class KafkaCredentialsService extends BaseService {
  private kafkaUrl = this.baseUrl + '/kafka-service';
  private userUrl = this.kafkaUrl + this.ENDPOINT.users;
  selectedCredential = new ReplaySubject<KafkaCredential>();
  activatedTab = new ReplaySubject<number>();

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {

    super()
  }

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
      .set('service_order_code', serviceOrderCode)
      .set('page', page)
      .set('size', size);

    return this.http.get<BaseResponse<Pagination<KafkaCredential[]>>>(
      `${this.userUrl}`,
      {
        params,
      }
    );
  }

  createCredential(
    data: CreateKafkaCredentialData
  ): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.userUrl}`,
      decamelizeKeys(data)
    );
  }

  deleteUser(
    serviceOrderCode: string,
    username: string
  ): Observable<BaseResponse<null>> {
    return this.http.delete<BaseResponse<null>>(`${this.userUrl}`, {
      body: {
        service_order_code: serviceOrderCode,
        username,
      },
    });
  }

  updatePassword(
    data: ChangePasswordKafkaCredential
  ): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.userUrl}/update`,
                  decamelizeKeys(data)
    );
  }

  createNewPassword(data: NewPasswordKafkaCredential) {
    return this.http.post<BaseResponse<null>>(
      `${this.userUrl}/reset-password`,
      decamelizeKeys(data)
    );
  }
}
