import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {
  BackupSchedule, CapacityBackupSchedule,
  FormAction,
  FormCreateSchedule,
  FormEditSchedule,
  FormSearchScheduleBackup
} from "../models/schedule.model";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import { FormCreateFileSystemSsSchedule, FormSearchFileSystemSsSchedule } from "../models/filesystem-snapshot-schedule";
import { catchError, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class FileSystemSnapshotScheduleService extends BaseService {

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

  getFileSystemSsSchedule(formSearch: FormSearchFileSystemSsSchedule) {
    let params = new HttpParams()
    if(formSearch.regionId != undefined || formSearch.regionId != null) {
      params = params.append('regionId', formSearch.regionId)
    }
    if(formSearch.searchValue != undefined || formSearch.searchValue != null){
      params = params.append('searchValue', formSearch.searchValue)
    }
    if(formSearch.pageSize != undefined || formSearch.pageSize != null) {
      params = params.append('pageSize', formSearch.pageSize)
    }
    if(formSearch.pageNumber != undefined || formSearch.pageNumber != null) {
      params = params.append('pageNumber', formSearch.pageNumber)
    }
    return this.http.get<BaseResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/schedulesharesnapshot',{
      params: params
    }).pipe(catchError((error: HttpErrorResponse) => {
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
        `/backups/schedules/${id}?customerId=${customerId}`, {headers: this.getHeaders()})
  }


  delete(customerId:number, scheduleId:number) {
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.provisions +
        `/file-storage/schedulesharesnapshot`, 
          {
            headers: this.getHeaders(),
            body: JSON.stringify({customerId, scheduleId})
          }
      ).pipe(
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


  create(formCreate: FormCreateFileSystemSsSchedule) {
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/schedulesharesnapshot',
        Object.assign(formCreate), {headers: this.getHeaders()})
  }

  edit(formEdit: FormEditSchedule) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/backups/schedules',
         Object.assign(formEdit), {headers: this.getHeaders()})
  }

}
