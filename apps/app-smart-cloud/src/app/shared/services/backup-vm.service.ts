import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {
  BackupPackage,
  BackupVm,
  BackupVMFormSearch,
  FormCreateBackup,
  RestoreFormCurrent,
  VolumeAttachment
} from "../models/backup-vm";
import Pagination from "../models/pagination";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {NzNotificationService} from "ng-zorro-antd/notification";
import { catchError } from "rxjs/internal/operators/catchError";

@Injectable({
  providedIn: 'root'
})

export class BackupVmService extends BaseService {

  constructor(public http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
              private notification: NzNotificationService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }
  c

  search(form: BackupVMFormSearch) {
    let params = new HttpParams();
    if(form.customerId != null){
      params = params.append('customerId', form.customerId);
    }
    if(form.projectId !=null) {
      params = params.append('projectId', form.projectId);
    }
    if(form.regionId != null) {
      params = params.append('regionId', form.regionId);
    }
    if (form.status != null) {
      params = params.append('status', form.status);
    }
    if (form.instanceBackupName != null) {
      params = params.append('instanceBackupName', form.instanceBackupName);
    }
    params = params.append('pageSize', form.pageSize);
    params = params.append('currentPage', form.currentPage);

    return this.http.get<Pagination<BackupVm>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/intances', {
      headers: this.getHeaders(),
      params: params
    })
  }

  detail(id: number, userId: number) {
    return this.http.get<BackupVm>(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/${id}?customerId=${userId}`)
  }

  delete(id: number, userId: number) {
    return this.http.delete(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/${id}?customerId=${userId}`)
        .pipe(catchError(this.errorCode))
  }

  restoreCurrentBackupVm(form: RestoreFormCurrent) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + `/backups/intances/restore`, Object.assign(form))
  }

  getVolumeInstanceAttachment(id: number){
    return this.http.get<VolumeAttachment[]>(this.baseUrl + this.ENDPOINT.provisions + `/instances/${id}/instance-attachments`)
  }

  getBackupPackages(customerId: number) {
    return this.http.get<BackupPackage[]>(this.baseUrl + this.ENDPOINT.provisions + `/backups/packages?customerId=${customerId}`)
  }

  create(form: FormCreateBackup) {
    return this.http.post<BackupVm>(this.baseUrl + this.ENDPOINT.provisions + '/backups/intances', Object.assign(form))
  }
}
