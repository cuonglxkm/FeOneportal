import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { BehaviorSubject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Summary, UserInfoObjectStorage } from '../models/object-storage.model';
import { BaseResponse } from '../../../../../../libs/common-utils/src';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})

export class ObjectStorageService extends BaseService {
  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getUserInfo() {
    return this.http.get<UserInfoObjectStorage>(this.baseUrl +
      this.ENDPOINT.provisions + '/object-storage/userinfo')
      .pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('login');
      } else if (error.status === 404) {
        // Handle 404 Not Found error
        console.error('Resource not found');
      }
      return throwError(error);
    }))
  }

  getMonitorObjectStorage(bucketname: string, from: number) {
    return this.http.get<Summary[]>(this.baseUrl + this.ENDPOINT.provisions + `/object-storage/Monitor?from=${from}&bucketname=${bucketname}`)
      .pipe(catchError((error: HttpErrorResponse) => {
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
