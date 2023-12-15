import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BackupSchedule, FormSearchScheduleBackup} from "../models/schedule.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";

@Injectable({
  providedIn: 'root'
})

export class ScheduleService extends BaseService {

  constructor(private http: HttpClient) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  search(formSearch: FormSearchScheduleBackup) {
    let params = new HttpParams()
    if(formSearch.name !== undefined) {
      params = params.append('name', formSearch.name)
    }
    if(formSearch.customerId !== undefined) {
      params = params.append('customerId', formSearch.customerId)
    }
    if(formSearch.region !== undefined) {
      params = params.append('region', formSearch.customerId)
    }
    if(formSearch.project !== undefined) {
      params = params.append('project', formSearch.customerId)
    }
    params = params.append('pageSize', formSearch.pageSize)
    params = params.append('currentPage', formSearch.pageIndex)

    return this.http.get<BaseResponse<BackupSchedule[]>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/backupschedules', {
      headers: this.getHeaders(),
      params: params
    })
  }

}
