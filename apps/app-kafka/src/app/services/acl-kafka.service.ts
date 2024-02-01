import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AclDeleteModel } from '../core/models/acl-delete.model';
import { AclReqModel } from '../core/models/acl-req.model';
import { BaseResponse } from '../core/models/base-response.model';

@Injectable({
  providedIn: 'root',
})
export class AclKafkaService {
  private baseUrl = 'http://api.galaxy.vnpt.vn:30383/kafka-service';

  constructor(private http: HttpClient) { }

  getListAcl(
    page: number,
    limit: number,
    keySearch: string,
    serviceOrderCode: string,
    resourceType: string,
  ): Observable<BaseResponse<any>> {
    return this.http.get<BaseResponse<any>>(`${this.baseUrl}/acl/listAcl?page=${page}&limit=${limit}&key_search=${keySearch}&service_order_code=${serviceOrderCode}&resource_type=${resourceType}`);
  }

  createAcl(data: AclReqModel): Observable<any> {
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
    return this.http.post(`${this.baseUrl}/acl/createAcl`, json);
  }

  deleteAcl(data: AclDeleteModel): Observable<any> {
    const json = {
      service_order_code: data.serviceOrderCode,
      principal: data.principal,
      resource_type: data.resourceType,
      resource_name: data.resourceName,
      permission_group_code: data.permissionGroupCode,
      allow_deny: data.allowDeny,
      host: data.host
    };
    return this.http.post('/kafka-service/acl/deleteAcl', json);
  }

}
