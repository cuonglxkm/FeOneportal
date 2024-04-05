import { BaseResponse } from "../../../../../../libs/common-utils/src";
import { FormCreateEndpointGroup, FormDeleteEndpointGroup, FormDetailEndpointGroup, FormEditEndpointGroup, FormSearchEndpointGroup } from "../models/endpoint-group";
import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})

export class EndpointGroupService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getListEndpointGroup(formSearch: FormSearchEndpointGroup) {
    let params = new HttpParams()
    if (formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId)
    }
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.name != undefined || formSearch.name != null) {
      params = params.append('name', formSearch.name)
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }

    return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/endpoint_groups/paging', {
      headers: this.getHeaders(),
      params: params
    })
  }

  create(formCreate: FormCreateEndpointGroup) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/endpoint_groups',
      Object.assign(formCreate), { headers: this.getHeaders() })
  }

  getEndpointGroupById(id: number, vpcid: number, region: number) {
    return this.http.get<FormDetailEndpointGroup>(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/endpoint_groups/${id}?vpcId=${vpcid}&regionId=${region}`).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        }))
  }

  deleteEndpointGroup(formDelete: FormDeleteEndpointGroup) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/endpoint_groups/${formDelete.id}?regionId=${formDelete.regionId}&vpcId=${formDelete.vpcId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  editEndpoinGroup(formEdit: FormEditEndpointGroup) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/endpoint_groups/${formEdit.id}?name=${formEdit.name}&description=${formEdit.description}&vpcId=${formEdit.vpcId}&regionId=${formEdit.regionId}&`,
      Object.assign(formEdit)).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        }))
  }
  
  listSubnetEndpointGroup(vpcid: number, region: number){
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/endpoint_groups/list_subnet?vpcId=${vpcid}&regionId=${region}`).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        }))
  }
}
