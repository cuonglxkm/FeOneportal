import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AclDeleteModel } from '../core/models/acl-delete.model';
import { AclReqModel } from '../core/models/acl-req.model';
import { AclModel } from '../core/models/acl.model';
import { BaseResponse } from '../core/models/base-response.model';
import { KafkaTopic } from '../core/models/kafka-topic.model';
import { Pagination } from '../core/models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class AclKafkaService {
  private baseUrl = 'http://localhost:16005/kafka-service';

  constructor(private http: HttpClient) { }

  getListAcl(
    page: number,
    limit: number,
    keySearch: string,
    serviceOrderCode: string,
    resourceType: string,
  ): Observable<BaseResponse<Pagination<AclModel[]>>> {
    return this.http.get<BaseResponse<Pagination<AclModel[]>>>(`${this.baseUrl}/acls/search?page=${page}&limit=${limit}&key_search=${keySearch}&service_order_code=${serviceOrderCode}&resource_type=${resourceType}`);
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
    return this.http.post<BaseResponse<null>>(`${this.baseUrl}/acls`, json);
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
    return this.http.delete<BaseResponse<null>>(`${this.baseUrl}/acls`, json);
  }

  getListTopic(
    page:number,
    size:number,
    keySearch:string,
    serviceOrderCode: string
  ): Observable<BaseResponse<Pagination<KafkaTopic[]>>> {
    return this.http.get<BaseResponse<Pagination<KafkaTopic[]>>>(`${this.baseUrl}/topics?page=${page}&size=${size}&keySearch=${keySearch}&serviceOrderCode=${serviceOrderCode}`);
  }

}
