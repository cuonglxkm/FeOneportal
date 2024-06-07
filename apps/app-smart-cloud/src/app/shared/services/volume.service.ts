import { Inject, Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { VolumeDTO } from '../dto/volume.dto';
import { BaseService } from './base.service';
import {
  AddVolumetoVmModel,
  CreateVolumeRequestModel,
  CreateVolumeResponseModel,
  EditSizeVolumeModel,
  EditTextVolumeModel,
  GetAllVmModel
} from '../models/volume.model';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { BaseResponse } from '../../../../../../libs/common-utils/src';

@Injectable({
  providedIn: 'root'
})
export class VolumeService extends BaseService {

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
      params: param
    }).pipe(
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

  getVolumeById(volumeId: number) {
    return this.http.get<VolumeDTO>(this.baseUrl+this.ENDPOINT.provisions + `/volumes/${volumeId}`)
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
      'Authorization': 'Bearer ' + token,
      'User-Root-Id': localStorage.getItem('UserRootId') && Number(localStorage.getItem('UserRootId')) > 0 ? Number(localStorage.getItem('UserRootId')) : this.tokenService.get()?.userId
    });
    return this.http.post<CreateVolumeResponseModel>(this.urlOrderGW, request,{headers: reqHeader})

  }

  editSizeVolume(request: EditSizeVolumeModel): Observable<any> {
    return this.http.post<any>(this.urlOrderGW, request)
  }

  deleteVolume(idVolume: number): Observable<boolean> {
    return this.http.delete<boolean>(this.urlVolumeGW + '/' + idVolume)
  }

  addVolumeToVm(request: AddVolumetoVmModel) {
    return this.http.post<boolean>(this.urlVolumeGW + '/attach', Object.assign(request))
  }


  detachVolumeToVm(request: AddVolumetoVmModel): Observable<boolean> {
    return this.http.post<boolean>(this.urlVolumeGW + '/detach', Object.assign(request)).pipe(
      catchError(this.handleError<boolean>('Add Volume to VM error.'))
    );
  }

  // editTextVolume(request: EditTextVolumeModel): Observable<any> {
  //   return this.http.put(this.urlVolumeGW + '/' + request.volumeId, request).pipe(
  //     catchError(this.handleError<any>('Edit Volume to VM error.'))
  //   );
  // }

  extendsVolume(request: EditSizeVolumeModel): Observable<any>{
    return this.http.post<any>(this.urlOrderGW, Object.assign(request)).pipe(
      catchError(this.handleError<any>('Extends size volume error.'))
    );
  }

  updateVolume(request: EditTextVolumeModel) {
    return this.http.put<any>(this.baseUrl + this.ENDPOINT.provisions + `/volumes/${request.volumeId}`, Object.assign(request))
  }

  constructor(private http: HttpClient,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {
    super();
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // this.message.create('error', `Xảy ra lỗi: ${error}`);
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


  createSnapshot(data: any) {
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots', Object.assign(data));
  }

  serchSnapshot(size: number, index: number, region: any, project: any, value: string, status: any) {
    return this.http.get<boolean>(this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots?pageSize='+size+"&pageNumber="+index+"&regionId="+region+"&projectId="+project
      +"&name="+value+"&status="+status);
  }

  deteleSn

  deleteSnapshot(id : any) {
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots/'+id);
  }

  updateSnapshot(data : any) {
    return this.http.put<any>(this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots', Object.assign(data));
  }
}
