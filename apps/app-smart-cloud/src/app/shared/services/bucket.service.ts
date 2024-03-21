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

  getBucketDetail(bucketName: string): Observable<any> {
    let url_ = `/object-storage/Bucket/Detail?bucketName=${bucketName}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  setBucketVersioning(
    bucketName: string,
    isVersioning: boolean
  ): Observable<any> {
    let url_ = `/object-storage/SetBucketVersioning?bucketName=${bucketName}&isVersioning=${isVersioning}`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  setBucketACL(bucketName: string, type: string): Observable<any> {
    let url_ = `/object-storage/SetBucketACL?bucketName=${bucketName}&type=${type}`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getListBucketPolicy(
    bucketName: string,
    pageNumber: number,
    pageSize: number,
    searchValue: string
  ): Observable<any> {
    let url_ = `/object-storage/BucketPolicy/GetPagging?bucketName=${bucketName}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchValue=${searchValue}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getBucketPolicyDetail(id: string, bucketName: string): Observable<any> {
    let url_ = `/object-storage/BucketPolicy/Detail?id=${id}&bucketName=${bucketName}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createBucketPolicy(
    bucketName: string,
    effect: string,
    childrenUser: string,
    isUserOther: boolean,
    listAction: string[]
  ): Observable<any> {
    let url_ = `/object-storage/BucketPolicy?bucketName=${bucketName}&effect=${effect}&childrenUser=${childrenUser}&isUserOther=${isUserOther}`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      listAction,
      this.httpOptions
    );
  }

  updateBucketPolicy(
    bucketName: string,
    id: string,
    effect: string,
    childrenUser: string,
    isUserOther: boolean,
    listAction: string[]
  ): Observable<any> {
    let url_ = `/object-storage/BucketPolicy?bucketName=${bucketName}&id=${id}&effect=${effect}&childrenUser=${childrenUser}&isUserOther=${isUserOther}`;
    return this.http.put<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      listAction,
      this.httpOptions
    );
  }

  deleteBucketPolicy(bucketName: string, id: string): Observable<any> {
    let url_ = `/object-storage/BucketPolicy?bucketName=${bucketName}&id=${id}`;
    return this.http.delete<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getListBucketCORS(bucketName: string): Observable<any> {
    let url_ = `/object-storage/ListBucketCORS?bucketName=${bucketName}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createBucketCORS(data: any) {
    let url_ = `/object-storage/PutBucketCORS`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  updateBucketCORS(data: any) {
    let url_ = `/object-storage/UpdateBucketCORS`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  deleteBucketCORS(data: any) {
    let url_ = `/object-storage/DeleteBucketCORS`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
      body: data,
    });
  }

  createBucketWebsite(data: any) {
    let url_ = `/object-storage/PutBucketWebsite`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  deleteBucketWebsite(data: any): Observable<any> {
    let url_ = `/object-storage/DeleteBucketWebsite`;
    return this.http.delete<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      { headers: this.httpOptions.headers, body: data }
    );
  }

  getListBucketLifecycle(bucketName: string): Observable<any> {
    let url_ = `/object-storage/ListBucketLifecycle?bucketName=${bucketName}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createBucketLifecycle(data: any) {
    let url_ = `/object-storage/PutBucketLifecycle`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  updateBucketLifecycle(data: any) {
    let url_ = `/object-storage/UpdateBucketLifecycle`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  deleteBucketLifecycle(data: any) {
    let url_ = `/object-storage/DeleteBucketLifecycle`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
      body: data,
    });
  }

  getListSubuser(pageSize: number, currentPage: number): Observable<any> {
    let url_ = `/object-storage/subuser?pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }
}
