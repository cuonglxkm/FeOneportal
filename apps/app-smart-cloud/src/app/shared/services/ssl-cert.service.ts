import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { FormAction, FormCreateIp, FormSearchIpFloating, IpFloating } from '../models/ip-floating.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { head } from 'lodash';
import { FormCreateFileSystemSnapShot, FormDeleteFileSystemSnapshot, FormEditFileSystemSnapShot, FormSearchFileSystemSnapshot } from '../models/filesystem-snapshot';
import { Router } from '@angular/router';
import { FormCreateSslCert, FormDeleteSslCert, FormSearchSslSearch } from '../models/ssl-cert.model';

@Injectable({
  providedIn: 'root',
})

export class SSLCertService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
    private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  getSslCert(formSearch: FormSearchSslSearch) {
    let params = new HttpParams()
    if (formSearch.region != undefined || formSearch.region != null) {
      params = params.append('region', formSearch.region)
    }
    if (formSearch.customerId != undefined || formSearch.customerId != null) {
      params = params.append('customerId', formSearch.customerId)
    }
    if (formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId)
    }
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/ssl', {
      headers: this.getHeaders(),
      params: params
    })
  }

  create(formCreate: FormCreateSslCert) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/loadbalancer/ssl',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  delete(formDelete: FormDeleteSslCert) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/loadbalancer/ssl?uuid=${formDelete.uuid}&regionId=${formDelete.regionId}&projectId=${formDelete.projectId}`,{observe: 'response'}).pipe(
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
