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

@Injectable({
  providedIn: 'root',
})

export class FileSystemSnapshotService extends BaseService {

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
    private router: Router,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getFileSystemSnapshot(formSearch: FormSearchFileSystemSnapshot) {
    let params = new HttpParams()
    if (formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if (formSearch.customerId != undefined || formSearch.customerId != null) {
      params = params.append('customerId', formSearch.customerId)
    }
    if (formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId)
    }
    if (formSearch.isCheckState != undefined || formSearch.isCheckState != null) {
      params = params.append('isCheckState', formSearch.isCheckState)
    }
    if (formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if (formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }
    if (formSearch.name != undefined || formSearch.name != null) {
      params = params.append('name', formSearch.name)
    }

    return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/sharesnapshot/paging', {
      headers: this.getHeaders().headers,
      params: params
    })
  }

  create(formCreate: FormCreateFileSystemSnapShot) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/sharesnapshot',
        Object.assign(formCreate), {headers: this.getHeaders().headers})
  }

  getFileSystemSnapshotById(id: number, projectId: number){
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions +
      `/file-storage/sharesnapshot/${id}?projectId=${projectId}`, {headers: this.getHeaders().headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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

  edit(formEdit: FormEditFileSystemSnapShot) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/file-storage/sharesnapshot`,
      Object.assign(formEdit), {headers: this.getHeaders().headers}).pipe(
      catchError((error: HttpErrorResponse) => {
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

  deleteFileSystemSnapshot(formDelete: FormDeleteFileSystemSnapshot) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/file-storage/sharesnapshot/${formDelete.id}?regionId=${formDelete.regionId}&customerId=${formDelete.customerId}`, {headers: this.getHeaders().headers}).pipe(
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
