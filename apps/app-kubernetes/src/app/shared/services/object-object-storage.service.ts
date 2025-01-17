import {Inject, Injectable} from '@angular/core';
import {BaseService} from "./base.service";
import {BehaviorSubject, Observable} from "rxjs";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {IpPublicModel} from "../models/ip-public.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {ObjectObjectStorageModel} from "../models/object-storage.model";

@Injectable({
  providedIn: 'root'
})
export class ObjectObjectStorageService extends BaseService{

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' ,
    })
  };

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  constructor(private http: HttpClient, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  getData(bucketName: any, folderName: any,filterQuery: any, customerId: any, regionId: any, pageSize: any, currentPage: any): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/ListObject?bucketName=' + bucketName +
      '&folderName=' + folderName+ '&customerId=' + customerId+
      '&regionId=' + regionId+ '&filterQuery=' + filterQuery+
      '&pageSize=' + pageSize+ '&currentPage=' + currentPage);
  }
  getDataS3Key(search: any, pageSize: any, currentPage: any): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/keys/getpaging?pageSize=' + pageSize +'&currentPage=' + currentPage);
  }

  deleteS3key(data: any) {
    let httpOptionOk = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json' ,
      }),
      body: JSON.stringify(data)
    };
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/object-storage/deleteS3Key', httpOptionOk);
  }
}
