import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { head } from 'lodash';
import { FormDeleteIKEPolicy, FormSearchIKEPolicy, IKEPolicyModel} from '../models/vpns2s.model';

@Injectable({
  providedIn: 'root',
})

export class IkePolicyService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }



  create(formCreate: IKEPolicyModel) {
    console.log("tao ike service: ", formCreate);
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/ikepolicy/create',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  getIkePolicyById(id: number, vpcid: number, region: number){
    return this.http.get<IKEPolicyModel>(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/ikepolicy/${id}?projectId=${vpcid}&regionId=${region}`).pipe(
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
  getIKEpolicy(formSearch: FormSearchIKEPolicy) {
    console.log("data truyen vao" ,formSearch)
    let params = new HttpParams()
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.searchValue != undefined || formSearch.searchValue != null) {
      params = params.append('searchValue', formSearch.searchValue)
    }
    // if(formSearch.searchValue == null || formSearch.searchValue == undefined)
    // {
    //   params = params.append('searchValue', "kh") //fix tam
    // }
    if (formSearch.projectId != undefined || formSearch.projectId != null) {
      params = params.append('projectId', formSearch.projectId)
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.pageNumber != undefined || formSearch.pageNumber != null) {
      params = params.append('pageNumber', formSearch.pageNumber)
    }
    console.log("pram-=---" , params);
    return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/ikepolicy', {
      headers: this.getHeaders(),
      params: params
    })
  }
  getIKEPoliciesById(id: number, vpcid: number, region: number){
    return this.http.get<IKEPolicyModel>(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/ikepolicy/${id}?projectId=${vpcid}&regionId=${region}`).pipe(
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

  deleteIkePolicy(formDelete: FormDeleteIKEPolicy) {
    console.log("form Delete",formDelete)
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ikepolicy/${formDelete.cloudId}?vpcId=${formDelete.projectId}&regionId=${formDelete.regionId}`).pipe(
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

  edit(id: string, formEdit: IKEPolicyModel) {
    console.log("data extend ike---", formEdit);
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ikepolicy/update`,
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


}
