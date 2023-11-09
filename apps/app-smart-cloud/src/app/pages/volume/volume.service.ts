import {Injectable, OnInit} from '@angular/core';
import {catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {VolumeDTO} from "./dto/volume.dto";
import {BaseService} from "../../shared/services/base.service";
import {GetListVolumeModel} from "./model/get-list-volume.model";
import {GetAllVmModel} from "./model/get-all-vm.model";

@Injectable({
  providedIn: 'root'
})
export class VolumeService extends BaseService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };


  private urlVolume = 'http://172.16.68.200:1009/volumes';
  private urlVM = 'http://172.16.68.200:1009/instances/getpaging';

  //search List Volumes
  getVolumes(userId: number, vpcId: number, regionId: number, volumeRootOnly: boolean, pageSize: number, currentPage: number): Observable<GetListVolumeModel> {
    return this.http.get<GetListVolumeModel>(this.urlVolume + '?userId=' + userId + '&pvpcId=' + vpcId +
      '&regionId=' + regionId + '&volumeRootOnly=' + volumeRootOnly + '&pageSize=' + pageSize + '&currentPage=' + currentPage
    ).pipe(
      catchError(this.handleError<GetListVolumeModel>('get volume-list error'))
    );
  }

  //get All VMs

  getAllVMs(  region: number): Observable<GetAllVmModel> {
    return this.http.get<GetAllVmModel>(this.urlVM + '?region=' + region + '&pageSize=' + 10000 + '&currentPage=' + 1
    ).pipe(
      catchError(this.handleError<GetAllVmModel>('get all-vms error'))
    );
  }


  constructor(private http: HttpClient) {
    super();
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
