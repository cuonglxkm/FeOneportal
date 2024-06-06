import {Inject, Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {BehaviorSubject, Observable} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {IpPublicModel} from "../models/ip-public.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ObjectObjectStorageModel} from "../models/object-storage.model";
import { formDeleteS3Key, s3KeyGenerate } from '../models/s3key.model';

@Injectable({
  providedIn: 'root'
})
export class ObjectObjectStorageService extends BaseService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getData(bucketName: any, folderName: any, filterQuery: any, customerId: any, regionId: any, pageSize: any, currentPage: any): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/ListObject?bucketName=' + bucketName +
      '&folderName=' + folderName + '&customerId=' + customerId +
      '&regionId=' + regionId + '&filterQuery=' + filterQuery +
      '&pageSize=' + pageSize + '&currentPage=' + currentPage);
  }

  getDataS3Key(search: string, pageSize: number, currentPage: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/keys/getpaging?pageSize=' + pageSize + '&pageNumber=' + currentPage + '&searchValueUser=' + search);
  }

  createS3Key(subUser: string) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/createS3Key?subUser=' + subUser, this.httpOptions);
  }

  generateS3Key(data: s3KeyGenerate) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/generateS3Key', data, this.httpOptions);
  }

  deleteS3key(data: formDeleteS3Key) {
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/deleteS3Key', {
      body: Object.assign(data)
    })
  }

  createFolder(data: any) {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/createFolder', data, this.httpOptions);
  }

  GetBucketTreeData(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/GetBucketTreeData', data, this.httpOptions);
  }

  copyProject(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/CopyObject', data, this.httpOptions);
  }

  downloadFile(bucketName: string, key: string, versionId: string) {
    let url = this.baseUrl + this.ENDPOINT.provisions + '/object-storage/download?bucketName=' + bucketName + '&key=' + key;
    if (versionId != '') {
      url += '&versionId=' + versionId
    }
    return this.http.get(url, {
      // reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    });
  }

  blob(url: string, filename?: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    })
  }

  deleteObject(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/DeleteMultipleObject', data, this.httpOptions);
  }

  deleteObjectSimple(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/DeleteObject', data, this.httpOptions);
  }

  getLinkShare(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/ShareObject', data, this.httpOptions);
  }

  editPermission(bucketName: string, keyName: string, role: string) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/ObjectAcl?bucketName=' + bucketName + '&keyName=' + keyName + '&role=' + role, this.httpOptions);
  }

  loadDataVersion(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/GetObjectVersions', data, this.httpOptions);
  }

  restoreObject(data: { bucketName: string; versionId: string; key: string }) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/RestoreObjectVersion', data, this.httpOptions);
  }

  getSignedUrl(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/GeneratePreSignedForUpload', data, this.httpOptions);
  }

  createMultiPartUpload(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/CreateMultipartUpload', data, this.httpOptions);
  }

  completemultipart(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/CompleteMultipartUpload', data, this.httpOptions);
  }

  abortmultipart(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/AbortMultipartUpload', data, this.httpOptions);
  }
}
