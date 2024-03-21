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
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
    super();
  }

  search(formSearch: FormSearchScheduleBackup) {
    let params = new HttpParams()
    if(formSearch.scheduleName !== undefined) {
      params = params.append('scheduleName', formSearch.scheduleName)
    }
    if(formSearch.regionId !== undefined) {
      params = params.append('regionId', formSearch.regionId)
    }
    if(formSearch.projectId !== undefined) {
      params = params.append('projectId', formSearch.projectId)
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
      params: params
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
        `/backups/schedules/${id}?customerId=${customerId}`)
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
        Object.assign(formAction)).pipe(
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
        `/backups/schedules/${id}?customer=${customerId}`)
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
        Object.assign(formCreate)).pipe(
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
         Object.assign(formEdit)).pipe(
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
        `/backups/capacity?customerId=${this.tokenService.get()?.userId}&regionId=${regionId}&projectId=${projectId}`)
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
