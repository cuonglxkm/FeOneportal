import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, catchError, throwError, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import {
  CreateFileSystemRequestModel, CreateFileSystemResponseModel,
  FileSystemDetail,
  FileSystemModel, FormDeleteFileSystem,
  FormEditFileSystem,
  FormSearchFileSystem, ResizeFileSystemRequestModel, ResizeFileSystemResponseModel
} from '../models/file-system.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FileSystemService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      user_root_id: this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

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
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + `/file-storage/shares/${formEdit.id}`,
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
      `/file-storage/shares/${id}?regionId=${region}`).pipe(
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

  create(request: CreateFileSystemRequestModel) {
    return this.http.post<CreateFileSystemResponseModel>(this.baseUrl + this.ENDPOINT.orders, Object.assign(request)).pipe(
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

  deleteFileSystem(formDelete: FormDeleteFileSystem) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/file-storage/shares/${formDelete.id}?regionId=${formDelete.regionId}`).pipe(
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


  resize(request: ResizeFileSystemRequestModel) {
    return this.http.post<ResizeFileSystemResponseModel>(this.baseUrl + this.ENDPOINT.orders, Object.assign(request)).pipe(
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

  checkRouter(
    regionId: number,
    vpcId: number
  ): Observable<any> {
    let url_ = `/file-storage/shares/check_router?regionId=${regionId}&vpcId=${vpcId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }
}
