import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { RouterUpdate } from '../models/router.model';

@Injectable({
  providedIn: 'root',
})
export class BucketService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      user_root_id: this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  constructor(
    private http: HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  getListBucket(
    pageNumber: number,
    pageSize: number,
    searchValue: string
  ): Observable<any> {
    let url_ = `/object-storage/Bucket/GetPagging?pageNumber=${pageNumber}&pageSize=${pageSize}&searchValue=${searchValue}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  deleteBucket(bucketName: string) {
    let url_ = `/object-storage/CleanBucket?bucketName=${bucketName}`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
    });
  }

  createBucket(bucketName: string, type: string): Observable<any> {
    let url_ = `/object-storage/Bucket/Create?bucketName=${bucketName}&type=${type}`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }
}
