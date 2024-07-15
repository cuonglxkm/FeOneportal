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
      'User-Root-Id': localStorage?.getItem('UserRootId') && Number(localStorage?.getItem('UserRootId')) > 0 ? Number(localStorage?.getItem('UserRootId')) : this.tokenService?.get()?.userId,
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
    searchValue: string,
    regionId: number
  ): Observable<any> {
    let url_ = `/object-storage/Bucket/GetPagging?pageNumber=${pageNumber}&pageSize=${pageSize}&searchValue=${searchValue}&regionId=${regionId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getUserById(id: number): Observable<any> {
    let url_ = `/object-storage/id?id=${id}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  deleteBucket(bucketName: string, regionId: number) {
    let url_ = `/object-storage/Bucket/Delete?bucketName=${bucketName}&regionId=${regionId}`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
    });
  }

  deleteOS(id: number) {
    let url_ = `/object-storage/user/${id}`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
    });
  }

  createBucket(bucketName: string, type: string, regionId: number) {
    let url_ = `/object-storage/Bucket/Create?bucketName=${bucketName}&type=${type}&regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      null,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  getBucketDetail(bucketName: string, region: number): Observable<any> {
    let url_ = `/object-storage/Bucket/Detail?bucketName=${bucketName}&regionId=${region}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  setBucketVersioning(bucketName: string, isVersioning: boolean, regionId: number) {
    let url_ = `/object-storage/SetBucketVersioning?bucketName=${bucketName}&isVersioning=${isVersioning}&regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      null,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  setBucketACL(bucketName: string, type: string, regionId: number) {
    let url_ = `/object-storage/SetBucketACL?bucketName=${bucketName}&type=${type}&regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      null,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  getListBucketPolicy(
    bucketName: string,
    pageNumber: number,
    pageSize: number,
    searchValue: string, regionId: number
    
  ): Observable<any> {
    let url_ = `/object-storage/BucketPolicy/GetPaging?bucketName=${bucketName}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchValue=${searchValue}&regionId=${regionId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getBucketPolicyDetail(id: string, bucketName: string, regionId: number): Observable<any> {
    let url_ = `/object-storage/BucketPolicy/Detail?id=${id}&bucketName=${bucketName}&regionId=${regionId}`;
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
    listAction: string[], regionId: number
    
  ) {
    let url_ = `/object-storage/BucketPolicy?bucketName=${bucketName}&effect=${effect}&childrenUser=${childrenUser}&isUserOther=${isUserOther}&regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      listAction,
      { headers: this.httpOptions.headers, responseType: 'text' }
    );
  }

  updateBucketPolicy(
    bucketName: string,
    id: string,
    effect: string,
    childrenUser: string,
    isUserOther: boolean,
    listAction: string[], regionId: number
  ): Observable<any> {
    let url_ = `/object-storage/BucketPolicy?bucketName=${bucketName}&id=${id}&effect=${effect}&childrenUser=${childrenUser}&isUserOther=${isUserOther}&regionId=${regionId}`;
    return this.http.put(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      listAction,
      { headers: this.httpOptions.headers, responseType: 'text' }
    );
  }

  deleteBucketPolicy(bucketName: string, id: string, regionId: number) {
    let url_ = `/object-storage/BucketPolicy?bucketName=${bucketName}&id=${id}&regionId=${regionId}`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
    });
  }

  getListBucketCORS(bucketName: string, regionId: number): Observable<any> {
    let url_ = `/object-storage/ListBucketCORS?bucketName=${bucketName}&regionId=${regionId}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  getListPagingBucketCORS(
    bucketName: string,
    pageNumber: number,
    pageSize: number,
    searchValue: string,
    region: number
  ): Observable<any> {
    let url_ = `/object-storage/BucketCORS/GetPaging?bucketName=${bucketName}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchValue=${searchValue}&regionId=${region}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createBucketCORS(data: any, regionId: number) {
    let url_ = `/object-storage/PutBucketCORS?regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  updateBucketCORS(data: any, regionId: number) {
    let url_ = `/object-storage/UpdateBucketCORS?regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  deleteBucketCORS(data: any, regionId: number) {
    let url_ = `/object-storage/DeleteBucketCORS?regionId=${regionId}`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
      body: data,
    });
  }

  createBucketWebsite(data: any, regionId: number) {
    let url_ = `/object-storage/PutBucketWebsite?regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  deleteBucketWebsite(data: any, regionId: number) {
    let url_ = `/object-storage/DeleteBucketWebsite?regionId=${regionId}`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      body: data,
      responseType: 'text',
    });
  }


  getListBucketLifecycle(
    bucketName: string,
    pageNumber: number,
    pageSize: number,
    searchValue: string, regionId: number
  ): Observable<any> {
    let url_ = `/object-storage/BucketLifeCycle/GetPaging?bucketName=${bucketName}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchValue=${searchValue}&regionId=${regionId}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }

  createBucketLifecycle(data: any, regionId: number) {
    let url_ = `/object-storage/PutBucketLifecycle?regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  updateBucketLifecycle(data: any, regionId: number) {
    let url_ = `/object-storage/UpdateBucketLifecycle?regionId=${regionId}`;
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      {
        headers: this.httpOptions.headers,
        responseType: 'text',
      }
    );
  }

  deleteBucketLifecycle(data: any, regionId: number) {
    let url_ = `/object-storage/DeleteBucketLifecycle?regionId=${regionId}`;
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
      responseType: 'text',
      body: data,
    });
  }

  getListSubuser(pageSize: number, currentPage: number, regionId: number): Observable<any> {
    let url_ = `/object-storage/subuser?regioniId=${regionId}&pageSize=${pageSize}&currentPage=${currentPage}`;

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.httpOptions
    );
  }
}
