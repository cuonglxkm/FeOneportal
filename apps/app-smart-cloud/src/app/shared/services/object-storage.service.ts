import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Summary, UserInfoObjectStorage } from '../models/object-storage.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})
export class ObjectStorageService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>('1');

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }

  getUserInfo(regionId: number) {
    return this.http
      .get<UserInfoObjectStorage>(
        this.baseUrl +
          this.ENDPOINT.provisions +
          `/object-storage/userinfo?regionId=${regionId}`, this.getHeaders()
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        })
      );
  }

  getTotalAmount(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders + '/totalamount',
      data
    );
  }

  getMonitorObjectStorage(bucketname: string, from: number, regionId: number) {
    return this.http
      .get<Summary[]>(
        this.baseUrl +
          this.ENDPOINT.provisions +
          `/object-storage/Monitor?from=${from}&bucketname=${bucketname}&regionId=${regionId}`, this.getHeaders()
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        })
      );
  }

  getObjectStorage(regionId: number): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        this.ENDPOINT.provisions +
        `/object-storage/user?regionId=${regionId}`,
      this.getHeaders()
    );
  }

  getUsageOfUser(regionId: number): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        this.ENDPOINT.provisions +
        `/object-storage/GetUsageOfUser?regionId=${regionId}`, this.getHeaders()
    );
  }

  getUsageOfBucket(bucketName: string, regionId: number): Observable<any> {
    let url_ = `/object-storage/UsageOfBucket?bucketname=${bucketName}&regionId=${regionId}`;
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.getHeaders().headers,
      responseType: 'text',
    });
  }
}
