import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { AccessRule, FormCreateAccessRule } from '../models/access-rule.model';
import { id } from 'date-fns/locale';

@Injectable({
  providedIn: 'root',
})

export class AccessRuleService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");
  constructor(private http: HttpClient,
              private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getListAccessRule(cloudId: string, vpcId: number, regionId: number, pageSize: number, currentPage: number, accessTo: string, accessLevel: string) {
    let params = new HttpParams()
    if(cloudId != undefined || cloudId != null) {
      params = params.append('shareCloudId', cloudId)
    }
    if(vpcId != undefined || vpcId != null) {
      params = params.append('vpcId', vpcId)
    }
    if(regionId != undefined || regionId != null) {
      params = params.append('regionId', regionId)
    }
    if(pageSize != undefined || pageSize != null) {
      params = params.append('pageSize', pageSize)
    }
    if(currentPage != undefined || currentPage != null) {
      params = params.append('currentPage', currentPage)
    }
    if(accessTo != undefined || accessTo != null) {
      params = params.append('accessTo', accessTo)
    }
    if(accessLevel != undefined || accessLevel != null) {
      params = params.append('accessLevel', accessLevel)
    }
    return this.http.get<BaseResponse<AccessRule[]>>(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/share_rule/paging', {
      params: params
    }).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
        // Redirect to login page or show unauthorized message
        this.router.navigate(['/passport/login']);
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }))
  }

  createAccessRule(formCreate: FormCreateAccessRule) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/share_rule',
      Object.assign(formCreate)).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
        // Redirect to login page or show unauthorized message
        this.router.navigate(['/passport/login']);
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }))
  }

  deleteAccessRule(idShareRule: string, regionId: number, vpcId: number, shareId: string) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions +
      `/file-storage/share_rule/${idShareRule}?regionId=${regionId}&vpcId=${vpcId}&shareId=${shareId}`)
      .pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
        // Redirect to login page or show unauthorized message
        this.router.navigate(['/passport/login']);
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }))
  }
}
