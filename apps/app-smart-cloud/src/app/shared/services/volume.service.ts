import {Inject, Injectable, OnInit} from '@angular/core';
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
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})
export class VolumeService extends BaseService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };
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
  getListVM(userId: number, regionId: number): Observable<GetAllVmModel> {
    let url = this.urlVMGW + '/getpaging' + '?pageSize=' + 10000 + '&currentPage=' + 1;
    if (regionId != null) {
      url += '&region=' + regionId;
    }
    if (userId != null){
      url += '&userId='+userId;
    }
    return this.http.get<GetAllVmModel>(url).pipe(
      catchError(this.handleError<GetAllVmModel>('get all-vms error'))
    );
  }

  createNewVolume(request: CreateVolumeRequestModel): Observable<CreateVolumeResponseModel> {
    const token = this.tokenService.get()?.token;
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.post<CreateVolumeResponseModel>(this.urlOrderGW, request,{headers: reqHeader}).pipe(
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

  constructor(private http: HttpClient,
              private message: NzMessageService,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
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
