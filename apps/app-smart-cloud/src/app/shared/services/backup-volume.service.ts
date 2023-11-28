import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {Observable} from "rxjs";
import {BackupVolume} from "../../pages/volume/component/backup-volume/backup-volume.model";
import {BaseService} from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class BackupVolumeService extends BaseService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { super()}

  // get all
  getbackupVolumeKeys(userId: any, projectId: any, regionId: any, page: any, size: any, search: any, status: any): Observable<BaseResponse<BackupVolume[]>> {
    return this.http.get<BaseResponse<BackupVolume[]>>(this.baseUrl + this.ENDPOINT.provisions + "/backups/volumes" + '?customerId=' + userId + '&projectId=' + projectId+ '&regionId=' + regionId+
      '&pageSize=' + size+ '&currentPage=' + page+ '&status=' + status+ '&volumeBackupName=' + search);
  }
}
