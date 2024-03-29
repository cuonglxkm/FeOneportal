import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { head } from 'lodash';
import { FormSearchIKEPolicy, IKEPolicyModel} from '../models/vpns2s.model';

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
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

 

  create(formCreate: IKEPolicyModel) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/ikepolicy/create',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  getIkePolicyById(id: number, vpcid: number, region: number){
    return this.http.get<IKEPolicyModel>(this.baseUrl + this.ENDPOINT.provisions +
      `/vpn-sitetosite/ikepolicy/${id}?vpcId=${vpcid}&regionId=${region}`).pipe(
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
    if(formSearch.searchValue == null || formSearch.searchValue == undefined)
    {
      params = params.append('searchValue', "kh") //fix tam
    }
    if (formSearch.projectId != undefined || formSearch.projectId != null) {
      params = params.append('projectId', formSearch.projectId)
    }
    console.log("pram-=---" , params);
    // if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
    //   params = params.append('pageSize', formSearch.pageSize)
    // }
    // if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
    //   params = params.append('currentPage', formSearch.currentPage)
    // }
    // let url_ = `/vpn-sitetosite/ikepolicy?regionId=${5}&projectId=${50}&searchValue=${"khai"}`;
    // url_ = url_.replace(/[?&]$/, '');

    //return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/vpn-sitetosite/ikepolicy', {
      headers: this.getHeaders(),
      params: params
    })
  }
  // deleteIkePolicy(formDelete: FormDeleteIkePolicy) {
  //   return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ikepolicy/${formDelete.id}?vpcId=${formDelete.vpcId}&regionId=${formDelete.regionId}`).pipe(
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

  // edit(id: string, formEdit: IKEPolicyModel) {
  //   return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/vpn-sitetosite/ikepolicy/${id}`,
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
