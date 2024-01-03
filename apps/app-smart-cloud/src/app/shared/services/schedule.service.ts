import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {
  BackupSchedule, CapacityBackupSchedule,
  FormAction,
  FormCreateSchedule,
  FormEditSchedule,
  FormSearchScheduleBackup
} from "../models/schedule.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})

export class ScheduleService extends BaseService {

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  private getHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'user_root_id': this.tokenService.get()?.userId,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token
    })
  }

  search(formSearch: FormSearchScheduleBackup) {
    let params = new HttpParams()
    if(formSearch.scheduleName !== undefined) {
      params = params.append('scheduleName', formSearch.scheduleName)
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
    if(formSearch.pageSize !== null) {
      params = params.append('pageSize', formSearch.pageSize)
    } else {
      params = params.append('pageSize', 10)
    }
    if(formSearch.pageIndex !== null) {
      params = params.append('currentPage', formSearch.pageIndex)
    } else {
      params = params.append('currentPage', 1)
    }
    if(formSearch.scheduleStatus !== undefined) {
      params = params.append('scheduleStatus', formSearch.scheduleStatus)
    }
    return this.http.get<BaseResponse<BackupSchedule[]>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules', {
      headers: this.getHeaders(),
      params: params
    })
  }

  detail(customerId: number, id: number) {
    return this.http.get<BackupSchedule>(this.baseUrl + this.ENDPOINT.provisions +
        `/backups/schedules/${id}?customerId=${customerId}`, {headers: this.getHeaders()})
  }

  action(formAction: FormAction) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules/action',
        Object.assign(formAction), {headers: this.getHeaders()})
  }

  delete(customerId: number, id: number) {
    return this.http.delete<BackupSchedule>(this.baseUrl + this.ENDPOINT.provisions +
        `/backups/schedules/${id}?customer=${customerId}`, {headers: this.getHeaders()})
  }

  create(formCreate: FormCreateSchedule) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  edit(formEdit: FormEditSchedule) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules',
         Object.assign(formEdit), {headers: this.getHeaders()})
  }

  getCapacityBackup(regionId: number, projectId: number) {
    return this.http.get<CapacityBackupSchedule[]>(this.baseUrl +
        this.ENDPOINT.provisions +
        `/backups/capacity?customerId=${this.tokenService.get()?.userId}&regionId=${regionId}&projectId=${projectId}`,
        {headers: this.getHeaders()})
  }
}
