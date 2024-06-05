import { BaseService } from './base.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  CreateScheduleSnapshotDTO,
  EditSnapshotVolume,
  GetListSnapshotVlModel,
  UpdateScheduleSnapshot,
} from '../models/snapshotvl.model';
import { SnapshotVolumeDto } from '../dto/snapshot-volume.dto';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

@Injectable({
  providedIn: 'root',
})
export class SnapshotVolumeService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
      'User-Root-Id': this.tokenService.get()?.userId,
    }),
  };
  //API GW
  private urlSnapshotVl =
    this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots';

  getSnapshotVolumes(
    customerId: number,
    projectId: number,
    regionId: number,
    size: number,
    pageSize: number,
    currentPage: number,
    status: string,
    volumeName: string,
    name: string
  ): Observable<GetListSnapshotVlModel> {
    let urlResult = this.getConditionSearchSnapshotVl(
      customerId,
      projectId,
      regionId,
      size,
      pageSize,
      currentPage,
      status,
      volumeName,
      name
    );
    return this.http
      .get<GetListSnapshotVlModel>(urlResult, this.httpOptions)
      .pipe(
        catchError(
          this.handleError<GetListSnapshotVlModel>(
            'get snapshot-volume-list error'
          )
        )
      );
  }

  getSnapshotVolumeById(snapshotVlID: string) {
    return this.http
      .get<SnapshotVolumeDto>(
        this.urlSnapshotVl + `/${snapshotVlID}`,
        this.httpOptions
      )
      .pipe(
        catchError(
          this.handleError<SnapshotVolumeDto>(
            'get snapshot volume-detail error'
          )
        )
      );
  }

  editSnapshotVolume(request: EditSnapshotVolume): Observable<any> {
    return this.http.put(this.urlSnapshotVl, request, this.httpOptions);
  }

  deleteSnapshotVolume(idSnapshotVolume: number): Observable<boolean> {
    return this.http
      .delete<boolean>(
        this.urlSnapshotVl + '/' + idSnapshotVolume,
        this.httpOptions
      )
      .pipe(
        catchError(this.handleError<boolean>('delete snapshot volume error.'))
      );
  }

  createSnapshotSchedule(request: CreateScheduleSnapshotDTO): Observable<any> {
    let urlResult = this.urlSnapshotVl + '/schedule';
    return this.http
      .post(urlResult, request, this.httpOptions)
      .pipe(
        catchError(this.handleError<any>('Create Snapshot schedule error.'))
      );
  }

  getDetailSnapshotSchedule(id: number, customerId: number): Observable<any> {
    return this.http.get<any>(
      this.urlSnapshotVl + '/schedule/' + id + '?customerId=' + customerId,
      this.httpOptions
    );
  }

  getListSchedule(
    pageSize: number,
    pageNumber: number,
    regionId: number,
    projectId: number,
    name: string,
    volumeName: string
  ): Observable<any> {
    let urlResult = `/vlsnapshots/schedule?pageSize=${pageSize}&pageNumber=${pageNumber}&regionId=${regionId}&projectId=${projectId}&name=${name}&volumeName=${volumeName}`;
    return this.http
      .get<any>(
        this.baseUrl + this.ENDPOINT.provisions + urlResult,
        this.httpOptions
      )
      .pipe(
        catchError(
          this.handleError<GetListSnapshotVlModel>(
            'get shedule-snapshot-volume-list error'
          )
        )
      );
  }

  editSnapshotSchedule(editRequest: any): Observable<any> {
    return this.http.put<any>(
      this.urlSnapshotVl + '/schedule',
      editRequest,
      this.httpOptions
    );
  }

  deleteSnapshotSchedule(
    id: number,
    customerId: number,
    regionId: number,
    projectId: number
  ): Observable<any> {
    return this.http.delete<any>(
      this.urlSnapshotVl +
        '/schedule' +
        '?scheduleId=' +
        id +
        '&customerId=' +
        customerId +
        '&regionId=' +
        regionId +
        '&projectId=' +
        projectId,
      this.httpOptions
    );
  }

  actionSchedule(
    id: number,
    action: string,
    customerId: number,
    regionId: number,
    projectId: number
  ): Observable<boolean> {
    let urlResult =
      this.urlSnapshotVl +
      '/schedule/' +
      id +
      '/action' +
      '?action=' +
      action +
      '&customerId=' +
      customerId +
      '&regionId=' +
      regionId +
      '&projectId=' +
      projectId;
    return this.http.post<boolean>(urlResult, null, this.httpOptions);
  }

  private getConditionSearchSnapshotVl(
    customerId: number,
    projectId: number,
    regionId: number,
    size: number,
    pageSize: number,
    currentPage: number,
    status: string,
    volumeName: string,
    name: string
  ): string {
    let urlResult = this.urlSnapshotVl;
    let count = 0;
    if (customerId !== undefined && customerId != null) {
      urlResult += '?customerId=' + customerId;
      count++;
    }
    if (projectId !== undefined && projectId != null) {
      if (count == 0) {
        urlResult += '?projectId=' + projectId;
        count++;
      } else {
        urlResult += '&projectId=' + projectId;
      }
    }
    if (regionId !== undefined && regionId != null) {
      if (count == 0) {
        urlResult += '?regionId=' + regionId;
        count++;
      } else {
        urlResult += '&regionId=' + regionId;
      }
    }
    if (size !== undefined && size != null) {
      if (count == 0) {
        urlResult += '?size=' + size;
        count++;
      } else {
        urlResult += '&size=' + size;
      }
    }

    if (pageSize !== undefined && pageSize != null) {
      if (count == 0) {
        urlResult += '?pageSize=' + pageSize;
        count++;
      } else {
        urlResult += '&pageSize=' + pageSize;
      }
    }
    if (currentPage !== undefined && currentPage != null) {
      if (count == 0) {
        urlResult += '?currentPage=' + currentPage;
        count++;
      } else {
        urlResult += '&currentPage=' + currentPage;
      }
    }
    if (status !== undefined && status != null) {
      if (count == 0) {
        urlResult += '?status=' + status;
        count++;
      } else {
        urlResult += '&status=' + status;
      }
    }
    if (volumeName !== undefined && volumeName != null) {
      if (count == 0) {
        urlResult += '?volumeName=' + volumeName;
        count++;
      } else {
        urlResult += '&volumeName=' + volumeName;
      }
    }
    if (name !== undefined && name != null) {
      if (count == 0) {
        urlResult += '?name=' + name;
        count++;
      } else {
        urlResult += '&name=' + name;
      }
    }
    return urlResult;
  }

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      this.message.create('error', `Xảy ra lỗi: ${error}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
