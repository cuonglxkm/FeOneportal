import { BaseResponse } from "../../../../../../libs/common-utils/src";
import { FormCreateEndpointGroup, FormDetailEndpointGroup } from "../models/ipsec-policy";
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
  
    // getIpsecpolicy(formSearch: FormSearchIpsecPolicy) {
    //   let params = new HttpParams()
    //   if (formSearch.regionId != undefined || formSearch.regionId != null) {
    //     params = params.append('regionId', formSearch.regionId)
    //   }
    //   if (formSearch.name != undefined || formSearch.name != null) {
    //     params = params.append('name', formSearch.name)
    //   }
    //   if (formSearch.vpcId != undefined || formSearch.vpcId != null) {
    //     params = params.append('vpcId', formSearch.vpcId)
    //   }
    //   if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
    //     params = params.append('pageSize', formSearch.pageSize)
    //   }
    //   if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
    //     params = params.append('currentPage', formSearch.currentPage)
    //   }
  
    //   return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/ipsecpolicy/paging', {
    //     headers: this.getHeaders(),
    //     params: params
    //   })
    // }
  
    create(formCreate: FormCreateEndpointGroup) {
      return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/endpointgroup',
          Object.assign(formCreate), {headers: this.getHeaders()})
    }
  
    getEndpointGroupById(id: number, vpcid: number, region: number){
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
  
    // deleteIpsecPolicy(formDelete: FormDeleteIpsecPolicy) {
    //   return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ipsecpolicy/${formDelete.id}?vpcId=${formDelete.vpcId}&regionId=${formDelete.regionId}`).pipe(
    //     catchError((error: HttpErrorResponse) => {
    //       if (error.status === 401) {
    //         console.error('login');
    //       } else if (error.status === 404) {
    //         // Handle 404 Not Found error
    //         console.error('Resource not found');
    //       }
    //       return throwError(error);
    //     }))
    // }
  
    // edit(id: string, formEdit: FormEditIpsecPolicy) {
    //   return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ipsecpolicy/${id}`,
    //     Object.assign(formEdit)).pipe(
    //     catchError((error: HttpErrorResponse) => {
    //       if (error.status === 401) {
    //       } else if (error.status === 404) {
    //         // Handle 404 Not Found error
    //         console.error('Resource not found');
    //       }
    //       return throwError(error);
    //     }))
    // }
  
  }
  