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
    return this.http.get<any>(url_, this.getHeaders());
  }

  getSnapshotVolumeById(snapshotVlID: string): Observable<any> {
    return this.http.get<any>(
      this.urlSnapshotVl + `/${snapshotVlID}`,
      this.getHeaders()
    );
  }

  editSnapshotVolume(request: EditSnapshotVolume): Observable<any> {
    return this.http.put(this.urlSnapshotVl, request, this.getHeaders());
  }

  deleteSnapshotVolume(idSnapshotVolume: number): Observable<boolean> {
    return this.http.delete<boolean>(
      this.urlSnapshotVl + '/' + idSnapshotVolume,
      this.getHeaders()
    );
  }

  createSnapshotSchedule(request: CreateScheduleSnapshotDTO): Observable<any> {
    let urlResult = this.urlSnapshotVl + '/schedule';
    return this.http
      .post(urlResult, request, this.getHeaders());
  }

  getDetailSnapshotSchedule(id): Observable<any> {
    return this.http.get<SnapshotVolumeDto>(this.baseUrl + this.ENDPOINT.provisions + `/vlsnapshots/schedule/${id}`, this.getHeaders());
  }

  getListSchedule(
    pageSize: number,
    pageNumber: number,
    regionId: number,
    projectId: number,
    name: string,
    volumeName: string,
    ssPackageId: string
  ): Observable<any> {
    let urlResult = `/vlsnapshots/schedule?pageSize=${pageSize}&pageNumber=${pageNumber}&regionId=${regionId}&projectId=${projectId}&name=${name}&volumeName=${volumeName}&ssPackageId=${ssPackageId}`;
    return this.http
      .get<any>(
        this.baseUrl + this.ENDPOINT.provisions + urlResult,
        this.getHeaders()
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
      this.getHeaders()
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
      this.getHeaders()
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
    return this.http.post<boolean>(urlResult, null, this.getHeaders());
  }

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
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
