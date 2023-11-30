import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {EditTextVolumeModel, GetListVolumeModel} from "../models/volume.model";
import {catchError} from "rxjs/operators";
import {NzMessageService} from "ng-zorro-antd/message";
import {EditSnapshotVolume, GetListSnapshotVlModel} from "../models/snapshotvl.model";
import {VolumeDTO} from "../dto/volume.dto";
import {SnapshotVolumeDto} from "../dto/snapshot-volume.dto";

@Injectable({
  providedIn: 'root'
})
export class SnapshotVolumeService extends BaseService {

  //API GW
  private urlSnapshotVl = this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots';


  getSnapshotVolumes(customerId: number, projectId: number, regionId: number, size: number, pageSize: number, currentPage: number, status: string, volumeName: string, name: string): Observable<GetListSnapshotVlModel> {
    let urlResult = this.getConditionSearchSnapshotVl(customerId, projectId, regionId, size, pageSize, currentPage, status, volumeName, name);
    return this.http.get<GetListSnapshotVlModel>(urlResult).pipe(
      catchError(this.handleError<GetListSnapshotVlModel>('get snapshot-volume-list error'))
    );
  }

  getSnapshotVolummeById(snapshotVlID: string) {
    return this.http.get<SnapshotVolumeDto>(this.urlSnapshotVl + '/' + snapshotVlID).pipe(
      catchError(this.handleError<SnapshotVolumeDto>('get snapshot volume-detail error'))
    )
  }

  editSnapshotVolume(request: EditSnapshotVolume): Observable<any> {
    return this.http.put(this.urlSnapshotVl, request).pipe(
      catchError(this.handleError<any>('Edit Snapshot Volume to VM error.'))
    );
  }

  private getConditionSearchSnapshotVl(customerId: number, projectId: number, regionId: number, size: number, pageSize: number, currentPage: number, status: string, volumeName: string, name: string): string{
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

  constructor(private http: HttpClient , private message: NzMessageService) {
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
