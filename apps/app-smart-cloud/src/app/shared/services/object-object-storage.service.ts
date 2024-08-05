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

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  getData(bucketName: any, folderName: any, filterQuery: any, customerId: any, regionId: any, pageSize: any, currentPage: any, keySearch: any): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/ListObject?bucketName=' + bucketName +
      '&folderName=' + folderName + '&customerId=' + customerId +
      '&regionId=' + regionId + '&filterQuery=' + filterQuery +
      '&pageSize=' + pageSize + '&currentPage=' + currentPage + '&keySearch=' + keySearch);
  }

  getDataS3Key(search: string, pageSize: number, currentPage: number, regionId: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/keys/getpaging?pageSize=' + pageSize + '&pageNumber=' + currentPage + '&regionId=' + regionId + '&searchValueUser=' + search);
  }

  createS3Key(subUser: string, regionId: number) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/createS3Key?subUser=' + subUser + '&regionId=' + regionId, this.getHeaders());
  }

  generateS3Key(data: s3KeyGenerate, regionId: number) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + `/object-storage/generateS3Key?regionId=${regionId}`, data, this.getHeaders());
  }

  deleteS3key(data: formDeleteS3Key) {
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/deleteS3Key', {
      body: Object.assign(data)
    })
  }

  createFolder(data: any) {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/createFolder', data, this.getHeaders());
  }

  GetBucketTreeData(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/GetBucketTreeData', data, this.getHeaders());
  }

  copyProject(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/CopyObject', data, this.getHeaders());
  }

  downloadFile(bucketName: string, key: string, versionId: string, regionId: number) {
    let url = this.baseUrl + this.ENDPOINT.provisions + '/object-storage/download?bucketName=' + bucketName + '&key=' + key + '&regionId=' + regionId;
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
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/DeleteMultipleObject', data, this.getHeaders());
  }

  deleteObjectSimple(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/DeleteObject', data, this.getHeaders());
  }

  getLinkShare(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/ShareObject', data, this.getHeaders());
  }

  editPermission(bucketName: string, keyName: string, role: string, regionId: number) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/ObjectAcl?bucketName=' + bucketName + '&keyName=' + keyName + '&role=' + role + '&regionId=' + regionId, this.getHeaders());
  }

  loadDataVersion(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/GetObjectVersions', data, this.getHeaders());
  }

  restoreObject(data: { bucketName: string; versionId: string; key: string; regionId: number }) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/RestoreObjectVersion', data, this.getHeaders());
  }

  getSignedUrl(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/GeneratePreSignedForUpload', data, this.getHeaders());
  }

  createMultiPartUpload(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/CreateMultipartUpload', data, this.getHeaders());
  }

  completemultipart(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/CompleteMultipartUpload', data, this.getHeaders());
  }

  abortmultipart(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/AbortMultipartUpload', data, this.getHeaders());
  }
}
