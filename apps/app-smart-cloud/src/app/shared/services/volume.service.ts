import {Inject, Injectable, OnInit} from '@angular/core';
import {catchError} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {VolumeDTO} from "../dto/volume.dto";
import {BaseService} from "./base.service";
import {AddVolumetoVmModel, EditSizeVolumeModel, EditTextVolumeModel, GetListVolumeModel} from "../models/volume.model";
import {GetAllVmModel} from "../models/volume.model";
import {NzMessageService} from 'ng-zorro-antd/message';
import {PriceVolumeDto} from "../dto/volume.dto";
import {CreateVolumeRequestModel} from "../models/volume.model";
import {CreateVolumeResponseModel} from "../models/volume.model";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {BaseResponse} from "../../../../../../libs/common-utils/src";

@Injectable({
  providedIn: 'root'
})
export class VolumeService extends BaseService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json' ,
      'Authorization': 'Bearer ' + this.tokenService.get()?.token,
      'user_root_id': this.tokenService.get()?.userId,
    })
  };
  //API GW
  private urlVolumeGW = this.baseUrl + this.ENDPOINT.provisions + '/volumes';
  private urlVMGW = this.baseUrl + this.ENDPOINT.provisions + '/instances';
  private  urlOrderGW = this.baseUrl + this.ENDPOINT.orders;

  public model: BehaviorSubject<String> = new BehaviorSubject<String>("1");

  //search List Volumes
  getVolumes(customerId: number, projectId: number, regionId: number,
             pageSize: number, currentPage: number, status: string, volumeName: string) {
    let param = new HttpParams()
    if(customerId != undefined || customerId != null) param = param.append('customerId', customerId)
    if(regionId != undefined || regionId != null) param = param.append('regionId', regionId)
    if(projectId != undefined || projectId != null) param = param.append('projectId', projectId)
    if(status != undefined || status != null) param = param.append('status', status)
    if(volumeName != undefined || volumeName != null) param = param.append('volumeName', volumeName)
    param = param.append('volumeRootOnly', 'false')
    if(pageSize != undefined || pageSize != null) param = param.append('pageSize', pageSize)
    if(currentPage != undefined || currentPage != null) param = param.append('currentPage', currentPage)

    return this.http.get<BaseResponse<VolumeDTO[]>>(this.baseUrl + this.ENDPOINT.provisions + '/volumes', {
      headers: this.httpOptions.headers,
      params: param
    })
  }

  getVolumeById(volumeId: number) {
    return this.http.get<VolumeDTO>(this.baseUrl+this.ENDPOINT.provisions + `/volumes/${volumeId}`, {
      headers: this.httpOptions.headers})
  }

  //tinh phi Volume : FAKE
  getPremium(volumeType: string, size: number, duration: number): Observable<PriceVolumeDto> {
    let urlResult = this.getConditionGetPremiumVolume(volumeType, size, duration);
    return this.http.get<PriceVolumeDto>(urlResult,this.httpOptions).pipe(
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
    return this.http.get<GetAllVmModel>(url,this.httpOptions).pipe(
      catchError(this.handleError<GetAllVmModel>('get all-vms error'))
    );
  }

  createNewVolume(request: CreateVolumeRequestModel): Observable<CreateVolumeResponseModel> {
    const token = this.tokenService.get()?.token;
    var reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      'user_root_id': this.tokenService.get()?.userId
    });
    return this.http.post<CreateVolumeResponseModel>(this.urlOrderGW, request,{headers: reqHeader})

  }

  editSizeVolume(request: EditSizeVolumeModel): Observable<any> {
    return this.http.post<any>(this.urlOrderGW, request, {headers: this.httpOptions.headers})
  }

  deleteVolume(idVolume: number): Observable<boolean> {
    return this.http.delete<boolean>(this.urlVolumeGW + '/' + idVolume,this.httpOptions)
  }

  addVolumeToVm(request: AddVolumetoVmModel) {
    return this.http.post<boolean>(this.urlVolumeGW + '/attach', request, {headers: this.httpOptions.headers})
  }


  detachVolumeToVm(request: AddVolumetoVmModel): Observable<boolean> {
    return this.http.post<boolean>(this.urlVolumeGW + '/detach', request,this.httpOptions).pipe(
      catchError(this.handleError<boolean>('Add Volume to VM error.'))
    );
  }

  editTextVolume(request: EditTextVolumeModel): Observable<any> {
    return this.http.put(this.urlVolumeGW + '/' + request.volumeId, request,this.httpOptions).pipe(
      catchError(this.handleError<any>('Edit Volume to VM error.'))
    );
  }

  extendsVolume(request: EditSizeVolumeModel): Observable<any>{
    return this.http.post<any>(this.urlOrderGW, request,this.httpOptions).pipe(
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

  // private getConditionSearchVolume(regionId: number, customerId: number, projectId: number,
  //                                  volumeRootOnly: boolean, pageSize: number, currentPage: number,
  //                                  status: string, volumeName: string): string {
  //
  //   let urlResult = this.urlVolumeGW;
  //   let param
  //   return urlResult;
  //
  // }

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
