import {Injectable, OnInit} from '@angular/core';
import {catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {VolumeDTO} from "./dto/volume.dto";
import {BaseService} from "../../shared/services/base.service";
import {GetListVolumeModel} from "./model/get-list-volume.model";
import {GetAllVmModel} from "./model/get-all-vm.model";
import { NzMessageService } from 'ng-zorro-antd/message';
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
  getVolumes(customerId: number, projectId: number, regionId: number, volumeRootOnly: boolean, pageSize: number, currentPage: number, status: string , volumeName: string): Observable<GetListVolumeModel> {
    let urlResult = this.getConditionSearchVolume(customerId, projectId , regionId, volumeRootOnly, pageSize , currentPage, status , volumeName);
    return this.http.get<GetListVolumeModel>( urlResult).pipe(
      catchError(this.handleError<GetListVolumeModel>('get volume-list error'))
    );
  }

  getVolummeById(volumeId: string){
    return this.http.get<VolumeDTO>('http://172.16.68.200:1009/volumes/'+volumeId).pipe(
      catchError(this.handleError<VolumeDTO>('get volume-detail error'))
    )
  }

  //get All VMs

  getAllVMs(region: number): Observable<GetAllVmModel> {
    return this.http.get<GetAllVmModel>(this.urlVM + '?region=' + region + '&pageSize=' + 10000 + '&currentPage=' + 1
    ).pipe(
      catchError(this.handleError<GetAllVmModel>('get all-vms error'))
    );
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

  private getConditionSearchVolume(customerId: number, projectId: number, regionId: number, volumeRootOnly: boolean, pageSize: number, currentPage: number, status: string , volumeName: string): string {

    let urlResult = this.urlVolume;
    let count = 0;
    if(customerId !== undefined && customerId != null){
      urlResult += '?customerId='+customerId;
      count++;
    }
    if(projectId !== undefined && projectId !=null){
      if(count == 0){
        urlResult += '?projectId='+projectId;
        count++;
      }else{
        urlResult += '&projectId='+projectId;
      }
    }
    if(regionId !== undefined && regionId !=null){
      if(count == 0){
        urlResult += '?regionId='+regionId;
        count++;
      }else{
        urlResult += '&regionId='+regionId;
      }
    }
    if(volumeRootOnly !== undefined && volumeRootOnly !=null){
      if(count == 0){
        urlResult += '?volumeRootOnly='+volumeRootOnly;
        count++;
      }else{
        urlResult += '&volumeRootOnly='+volumeRootOnly;
      }
    }

    if(pageSize !== undefined && pageSize !=null){
      if(count == 0){
        urlResult += '?pageSize='+pageSize;
        count++;
      }else{
        urlResult += '&pageSize='+pageSize;
      }
    }
    if(currentPage !== undefined && currentPage !=null){
      if(count == 0){
        urlResult += '?currentPage='+currentPage;
        count++;
      }else{
        urlResult += '&currentPage='+currentPage;
      }
    }
    if(status !== undefined && status !=null){
      if(count == 0){
        urlResult += '?status='+status;
        count++;
      }else{
        urlResult += '&status='+status;
      }
    }
    if(volumeName !== undefined && volumeName !=null){
      if(count == 0){
        urlResult += '?volumeName='+volumeName;
        count++;
      }else{
        urlResult += '&volumeName='+volumeName;
      }
    }
    return urlResult;

  }

}
