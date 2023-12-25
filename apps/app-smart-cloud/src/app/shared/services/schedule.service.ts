import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {
  BackupSchedule,
  FormAction,
  FormCreateSchedule,
  FormEditSchedule,
  FormSearchScheduleBackup
} from "../models/schedule.model";
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
        `/backups/schedules/${id}?customerId=${customerId}`)
  }

  action(formAction: FormAction) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules/action',
        Object.assign(formAction))
  }

  delete(customerId: number, id: number) {
    return this.http.delete<BackupSchedule>(this.baseUrl + this.ENDPOINT.provisions +
        `/backups/schedules/${id}?customer=${customerId}`)
  }

  create(formCreate: FormCreateSchedule) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules',
        Object.assign(formCreate))
  }

  edit(formEdit: FormEditSchedule) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules',
         Object.assign(formEdit))
  }
}
