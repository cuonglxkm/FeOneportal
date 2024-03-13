import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  FileSystemDetail,
  FileSystemModel,
  FormEditFileSystem,
  FormSearchFileSystem
} from '../models/file-system.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FileSystemService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  search(formSearch: FormSearchFileSystem) {
    let params = new HttpParams()
    if(formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if(formSearch.vpcId != undefined || formSearch.vpcId != null) {
      params = params.append('vpcId', formSearch.vpcId)
    }
    if(formSearch.name != undefined || formSearch.name != null) {
      params = params.append('name', formSearch.name)
    }
    if(formSearch.isCheckState != undefined || formSearch.isCheckState != null) {
      params = params.append('isCheckState', formSearch.isCheckState)
    }
    if(formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if(formSearch.currentPage != undefined || formSearch.currentPage != null) {
      params = params.append('currentPage', formSearch.currentPage)
    }
    return this.http.get<BaseResponse<FileSystemModel[]>>(this.baseUrl +
      this.ENDPOINT.provisions + '/file-storage/shares/paging', {
      params: params
    }).pipe(
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

  edit(formEdit: FormEditFileSystem) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/shares',
      Object.assign(formEdit)).pipe(
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

  getFileSystemById(id: number, region: number){
    return this.http.get<FileSystemDetail>(this.baseUrl + this.ENDPOINT.provisions +
      `/file-storage/shares?id=${id}&regionId=${region}`).pipe(
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

}
