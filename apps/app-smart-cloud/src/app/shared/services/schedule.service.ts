import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  BackupSchedule, CapacityBackupSchedule,
  FormAction,
  FormCreateSchedule,
  FormEditSchedule,
  FormSearchScheduleBackup
} from "../models/schedule.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ScheduleService extends BaseService {

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService) {
    super(tokenService);
  }

  search(formSearch: FormSearchScheduleBackup) {
    let params = new HttpParams()
    if(formSearch.scheduleName != undefined || formSearch.scheduleName != null || formSearch.scheduleName != '') {
      params = params.append('scheduleName', formSearch.scheduleName)
    } else {
      params = params.append('scheduleName', '');
    }
    if(formSearch.regionId != undefined) {
      params = params.append('regionId', formSearch.regionId)
    }
    if(formSearch.projectId != undefined) {
      params = params.append('projectId', formSearch.projectId)
    }
    if(formSearch.pageSize != undefined) {
      params = params.append('pageSize', formSearch.pageSize)
    } else {
      params = params.append('pageSize', 10)
    }
    if(formSearch.pageIndex != undefined) {
      params = params.append('currentPage', formSearch.pageIndex)
    } else {
      params = params.append('currentPage', 1)
    }
    if(formSearch.scheduleStatus != undefined || formSearch.scheduleName != null || formSearch.scheduleName != '') {
      params = params.append('scheduleStatus', formSearch.scheduleStatus)
    } else {
      params = params.append('scheduleStatus', '');
    }

    if(formSearch.serviceId != undefined || formSearch.serviceId != null) {
      params = params.append('serviceId', formSearch.serviceId)
    }
    return this.http.get<BaseResponse<BackupSchedule[]>>(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules', {
      params: params,
      headers: this.getHeaders().headers
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  detail(customerId: number, id: number) {
    return this.http.get<BackupSchedule>(this.baseUrl + this.ENDPOINT.provisions +
        `/backups/schedules/${id}?customerId=${customerId}`, {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  action(formAction: FormAction) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules/action',
        Object.assign(formAction), {headers: this.getHeaders().headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  delete(customerId: number, id: number) {
    return this.http.delete<BackupSchedule>(this.baseUrl + this.ENDPOINT.provisions +
        `/backups/schedules/${id}?customer=${customerId}`, {headers: this.getHeaders().headers})
      .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  create(formCreate: FormCreateSchedule) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules',
        Object.assign(formCreate), {headers: this.getHeaders().headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  edit(formEdit: FormEditSchedule) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules',
         Object.assign(formEdit), {headers: this.getHeaders().headers}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }

  getCapacityBackup(regionId: number, projectId: number) {
    return this.http.get<CapacityBackupSchedule[]>(this.baseUrl +
        this.ENDPOINT.provisions +
        `/backups/capacity?customerId=${this.tokenService.get()?.userId}&regionId=${regionId}&projectId=${projectId}`, {headers: this.getHeaders().headers})
      .pipe(catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('login');
        } else if (error.status === 404) {
          // Handle 404 Not Found error
          console.error('Resource not found');
        }
        return throwError(error);
      }))
  }
}
