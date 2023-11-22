import {Injectable, OnInit} from '@angular/core';
import {catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {VolumeDTO} from "../dto/volume.dto";
import {BaseService} from "./base.service";
import {AddVolumetoVmModel, EditSizeVolumeModel, EditTextVolumeModel, GetListVolumeModel} from "../models/volume.model";
import {GetAllVmModel} from "../models/volume.model";
import {NzMessageService} from 'ng-zorro-antd/message';
import {PriceVolumeDto} from "../dto/volume.dto";
import {CreateVolumeRequestModel} from "../models/volume.model";
import {CreateVolumeResponseModel} from "../models/volume.model";

@Injectable({
  providedIn: 'root'
})
export class VolumeService extends BaseService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  private urlVolume = 'http://172.16.68.200:1009/volumes';
  private urlOrder = 'http://172.16.68.200:1003/orders';
  private urlVM = 'http://172.16.68.200:1009/instances';

  //API GW
  private urlVolumeGW = this.baseUrl + this.ENDPOINT.provisions + '/volumes';
  private urlVMGW = this.baseUrl + this.ENDPOINT.provisions + '/instances';
  private  urlOrderGW = this.baseUrl + this.ENDPOINT.orders;
  //search List Volumes
  getVolumes(customerId: number, projectId: number, regionId: number, volumeRootOnly: boolean, pageSize: number, currentPage: number, status: string, volumeName: string): Observable<GetListVolumeModel> {
    let urlResult = this.getConditionSearchVolume(customerId, projectId, regionId, volumeRootOnly, pageSize, currentPage, status, volumeName);
    return this.http.get<GetListVolumeModel>(urlResult).pipe(
      catchError(this.handleError<GetListVolumeModel>('get volume-list error'))
    );
  }

  getVolummeById(volumeId: string) {
    return this.http.get<VolumeDTO>(this.urlVolumeGW + '/' + volumeId).pipe(
      catchError(this.handleError<VolumeDTO>('get volume-detail error'))
    )
  }

  //tinh phi Volume : FAKE
  getPremium(volumeType: string, size: number, duration: number): Observable<PriceVolumeDto> {
    let urlResult = this.getConditionGetPremiumVolume(volumeType, size, duration);
    return this.http.get<PriceVolumeDto>(urlResult).pipe(
      catchError(this.handleError<PriceVolumeDto>('get premium-volume error'))
    );
  }

  //get All VMs

  getAllVMs(region: number): Observable<GetAllVmModel> {
    let url;
    if (region != null) {
      url = this.urlVMGW + '/getpaging' + '?region=' + region + '&pageSize=' + 10000 + '&currentPage=' + 1;
    } else {
      url = this.urlVMGW + '/getpaging'  + '?pageSize=' + 10000 + '&currentPage=' + 1;
    }
    return this.http.get<GetAllVmModel>(url).pipe(
      catchError(this.handleError<GetAllVmModel>('get all-vms error'))
    );
  }

  createNewVolume(request: CreateVolumeRequestModel): Observable<CreateVolumeResponseModel> {
    return this.http.post<CreateVolumeResponseModel>(this.urlOrderGW, request).pipe(
      catchError(this.handleError<CreateVolumeResponseModel>('create volume error.'))
    );
  }

  editSizeVolume(request: EditSizeVolumeModel): Observable<any> {
    return this.http.post<any>(this.urlOrderGW, request).pipe(
      catchError(this.handleError<any>('Edit size volume error.'))
    );
  }

  deleteVolume(idVolume: number): Observable<boolean> {
    return this.http.delete<boolean>(this.urlVolumeGW + '/' + idVolume).pipe(
      catchError(this.handleError<boolean>('delete volume error.'))
    );
  }

  addVolumeToVm(request: AddVolumetoVmModel): Observable<boolean> {
    return this.http.post<boolean>(this.urlVolumeGW + '/attach', request).pipe(
      catchError(this.handleError<boolean>('Add Volume to VM error.'))
    );
  }

  detachVolumeToVm(request: AddVolumetoVmModel): Observable<boolean> {
    return this.http.post<boolean>(this.urlVolumeGW + '/detach', request).pipe(
      catchError(this.handleError<boolean>('Add Volume to VM error.'))
    );
  }

  editTextVolume(request: EditTextVolumeModel): Observable<any> {
    return this.http.put(this.urlVolumeGW + '/' + request.volumeId, request).pipe(
      catchError(this.handleError<any>('Edit Volume to VM error.'))
    );
  }

  extendsVolume(request: EditSizeVolumeModel): Observable<any>{
    return this.http.post<any>(this.urlOrderGW, request).pipe(
      catchError(this.handleError<any>('Extends size volume error.'))
    );
  }

  constructor(private http: HttpClient, private message: NzMessageService) {
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

  private getConditionSearchVolume(customerId: number, projectId: number, regionId: number, volumeRootOnly: boolean, pageSize: number, currentPage: number, status: string, volumeName: string): string {

    let urlResult = this.urlVolumeGW;
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
    if (volumeRootOnly !== undefined && volumeRootOnly != null) {
      if (count == 0) {
        urlResult += '?volumeRootOnly=' + volumeRootOnly;
        count++;
      } else {
        urlResult += '&volumeRootOnly=' + volumeRootOnly;
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
    return urlResult;

  }

  private getConditionGetPremiumVolume(volumeType: string, size: number, duration: number): string {
    let urlResult = this.urlVolumeGW + '/getcreateprice';
    let count = 0;
    if (volumeType !== undefined && volumeType != null) {
      urlResult += '?volumeType=' + volumeType;
      count++;
    }
    if (size !== undefined && size != null) {
      if (count == 0) {
        urlResult += '?size=' + size;
        count++;
      } else {
        urlResult += '&size=' + size;
      }
    }
    if (duration !== undefined && duration != null) {
      if (count == 0) {
        urlResult += '?duration=' + duration;
        count++;
      } else {
        urlResult += '&duration=' + duration;
      }
    }


    return urlResult;
  }

}
