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
import { FileSystemSnapshotScheduleDetail, FormCreateFileSystemSsSchedule, FormEditFileSystemSsSchedule, FormSearchFileSystemSsSchedule } from "../models/filesystem-snapshot-schedule";
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
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId,
      'Project-Id': localStorage.getItem('projectId') && Number(localStorage.getItem('projectId')) > 0 ? Number(localStorage.getItem('projectId')) : 0,
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
    if(formSearch.projectId != undefined || formSearch.projectId != null) {
      params = params.append('projectId', formSearch.projectId)
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

  detail(id: number) {
    return this.http.get<FileSystemSnapshotScheduleDetail>(this.baseUrl + this.ENDPOINT.provisions +
        `/file-storage/schedulesharesnapshot/${id}`, {headers: this.getHeaders()})
  }


  delete(id:number) {
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.provisions +
        `/file-storage/schedulesharesnapshot/${id}`, 
          {
            headers: this.getHeaders(),
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

  edit(formEdit: FormEditFileSystemSsSchedule) {
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + '/file-storage/schedulesharesnapshot',
         Object.assign(formEdit), {headers: this.getHeaders()})
  }

}
