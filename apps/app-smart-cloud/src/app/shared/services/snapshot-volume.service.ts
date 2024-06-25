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
      'User-Root-Id': localStorage?.getItem('UserRootId') && Number(localStorage?.getItem('UserRootId')) > 0 ? Number(localStorage?.getItem('UserRootId')) : this.tokenService?.get()?.userId,
    }),
  };
  //API GW
  private urlSnapshotVl =
    this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots';

  getSnapshotVolumes(
    pageSize: number,
    pageNumber: number,
    regionId: number,
    projectId: number,
    name: string,
    volumeName: string,
    status: string
  ): Observable<any> {
    let url_ =
      this.urlSnapshotVl +
      `?pageSize=${pageSize}&pageNumber=${pageNumber}&regionId=${regionId}&projectId=${projectId}&name=${name}&volumeName=${volumeName}&status=${status}`;
    return this.http.get<any>(url_, this.httpOptions);
  }

  getSnapshotVolumeById(snapshotVlID: string): Observable<any> {
    return this.http.get<any>(
      this.urlSnapshotVl + `/${snapshotVlID}`,
      this.httpOptions
    );
  }

  editSnapshotVolume(request: EditSnapshotVolume): Observable<any> {
    return this.http.put(this.urlSnapshotVl, request, this.httpOptions);
  }

  deleteSnapshotVolume(idSnapshotVolume: number): Observable<boolean> {
    return this.http.delete<boolean>(
      this.urlSnapshotVl + '/' + idSnapshotVolume,
      this.httpOptions
    );
  }

  createSnapshotSchedule(request: CreateScheduleSnapshotDTO): Observable<any> {
    let urlResult = this.urlSnapshotVl + '/schedule';
    return this.http
      .post(urlResult, request, this.httpOptions);
  }

  getDetailSnapshotSchedule(id): Observable<any> {
    return this.http.get<SnapshotVolumeDto>(this.baseUrl + this.ENDPOINT.provisions + `/vlsnapshots/${id}`, this.httpOptions);
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
