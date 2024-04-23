import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from "@delon/auth";
import { Observable } from 'rxjs';
import { AclDeleteModel } from '../core/models/acl-delete.model';
import { AclReqModel } from '../core/models/acl-req.model';
import { AclModel } from '../core/models/acl.model';
import { BaseResponse } from '../core/models/base-response.model';
import { KafkaTopic } from '../core/models/kafka-topic.model';
import { Pagination } from '../core/models/pagination.model';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root',
})
export class AclKafkaService extends BaseService {
  private kafkaUrl = this.baseUrl + '/kafka-service';
  private aclsUrl = this.kafkaUrl + this.ENDPOINT.acls;

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

  getListAcl(
    page: number,
    limit: number,
    keySearch: string,
    serviceOrderCode: string,
    resourceType: string,
  ): Observable<BaseResponse<Pagination<AclModel[]>>> {
    return this.http.get<BaseResponse<Pagination<AclModel[]>>>(this.aclsUrl + `/search?page=${page}&limit=${limit}&key_search=${keySearch}&service_order_code=${serviceOrderCode}&resource_type=${resourceType}`);
  }

  createAcl(data: AclReqModel): Observable<BaseResponse<null>> {
    const json = {
      service_order_code: data.serviceOrderCode,
      principal: data.principal,
      resource_type: data.resourceType,
      resource_name: data.resourceName,
      resource_name_prefixed: data.resourceNamePrefixed,
      permission_group_code: data.permissionGroupCode,
      permission_group_name: data.permissionGroupName,
      allow_deny: data.allowDeny,
      host: data.host,
      is_edit: data.isEdit
    };
    return this.http.post<BaseResponse<null>>(this.aclsUrl, json);
  }

  deleteAcl(data: AclDeleteModel): Observable<BaseResponse<null>> {
    const json = {
      body: {
        service_order_code: data.serviceOrderCode,
        principal: data.principal,
        resource_type: data.resourceType,
        resource_name: data.resourceName,
        permission_group_code: data.permissionGroupCode,
        allow_deny: data.allowDeny,
        host: data.host
      }
    };
    return this.http.delete<BaseResponse<null>>(this.aclsUrl, json);
  }

  getListTopic(
    page: number,
    size: number,
    keySearch: string,
    serviceOrderCode: string
  ): Observable<BaseResponse<Pagination<KafkaTopic[]>>> {
    return this.http.get<BaseResponse<Pagination<KafkaTopic[]>>>(`${this.kafkaUrl}/topics?page=${page}&size=${size}&keySearch=${keySearch}&serviceOrderCode=${serviceOrderCode}`);
  }

}
