import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BackupVm, BackupVMFormSearch} from "../models/backup-vm";
import Pagination from "../models/pagination";

@Injectable({
  providedIn: 'root'
})

export class BackupVmService extends BaseService {

  constructor(public http: HttpClient) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

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

}
