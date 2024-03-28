import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {BehaviorSubject, Observable} from "rxjs";
import {BackupVolume} from "../../pages/volume/component/backup-volume/backup-volume.model";
import {BaseService} from "./base.service";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})
export class BackupVolumeService extends BaseService {
  receivedData: BehaviorSubject<BackupVolume> = new BehaviorSubject<BackupVolume>(null);
  sharedData$ = this.receivedData.asObservable();

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  };

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) { super()}

  // get all
  getbackupVolumeKeys(projectId: any, regionId: any, page: any, size: any, search: any, status: any): Observable<BaseResponse<BackupVolume[]>> {
    let param = new HttpParams()
    if(search != undefined || search != null) param = param.append('volumeBackupName', search)
    if(status != undefined || status != null) param = param.append('status', status)
    param = param.append('projectId', projectId)
    param = param.append('regionId', regionId)
    param = param.append('pageSize', size)
    param = param.append('currentPage', page)

    return this.http.get<BaseResponse<BackupVolume[]>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/volumes' , {
      headers: this.httpOptions.headers,
      params: param
    });
  }

  //delete
  deleteVolume(id: any, userId: any) {
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions +
      "/backups/volumes" + '/' + id+ '?customerId=' +userId);
  }

  //restore
  restoreVolume(data: any) : Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/backups/volumes/restore", data, this.httpOptions);
  }

  //create
  createBackupVolume(data: any) {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.orders, data , this.httpOptions);
  }
}
