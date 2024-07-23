import {Inject, Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {NzMessageService} from "ng-zorro-antd/message";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";
import {AddVolumetoVmModel, EditSizeVolumeModel, EditTextVolumeModel} from "../models/volume.model";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {BaseResponse} from "../../../../../../libs/common-utils/src";
import {IpPublicModel} from "../models/ip-public.model";
import {TotalVpcResource, VpcModel} from "../models/vpc.model";

@Injectable({
  providedIn: 'root'
})
export class VpcService extends BaseService {

  constructor(private http: HttpClient,
              private message: NzMessageService,
              @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService,) {
    super(tokenService);
  }

  // detachVolumeToVm(request: AddVolumetoVmModel): Observable<boolean> {
  //   return this.http.post<boolean>(this.urlVolumeGW + '/detach', request,this.getHeaders()).pipe(
  //     catchError(this.handleError<boolean>('Add Volume to VM error.'))
  //   );
  // }
  //
  // editTextVolume(request: EditTextVolumeModel): Observable<any> {
  //   return this.http.put(this.urlVolumeGW + '/' + request.volumeId, request,this.getHeaders()).pipe(
  //     catchError(this.handleError<any>('Edit Volume to VM error.'))
  //   );
  // }
  //
  // extendsVolume(request: EditSizeVolumeModel): Observable<any>{
  //   return this.http.post<any>(this.urlOrderGW, request,this.getHeaders()).pipe(
  //     catchError(this.handleError<any>('Extends size volume error.'))
  //   );
  // }
  //
  // updateVolume(request: EditTextVolumeModel) {
  //   return this.http.put<any>(this.baseUrl + this.ENDPOINT.provisions + `/volumes/${request.volumeId}`, Object.assign(request),
  //     {headers: this.getHeaders().headers})
  // }

  getData(searchKey: string, selectedStatus: string, userId: any, regionId: any, size: number, index: number): Observable<BaseResponse<VpcModel[]>> {
    return this.http.get<BaseResponse<VpcModel[]>>(this.baseUrl + this.ENDPOINT.provisions + '/vpcs?projectName=' + searchKey + '&status=' + selectedStatus+ '&customerId=' + userId+
      '&regionId=' + regionId+'&pageSize=' + size+ '&currentPage=' + index,this.getHeaders());
  }

  getDetail(id: any): Observable<VpcModel> {
    return this.http.get<VpcModel>(this.baseUrl + this.ENDPOINT.provisions + '/vpcs/' + id);
  }
  getDetailTest(): Observable<VpcModel> {
    return this.http.get<VpcModel>(this.baseUrl + this.ENDPOINT.provisions + '/vpcs/182');
  }

  getTotalResouce(id: any): Observable<TotalVpcResource> {
    return this.http.get<TotalVpcResource>(this.baseUrl + this.ENDPOINT.provisions + '/projects/' + id);
  }

  delete(id: any):Observable<HttpResponse<any>> {
    localStorage.removeItem("projects");
    localStorage.removeItem("projectId");
    return this.http.delete<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/vpcs/"+ id);
  }

  updateVpc(request: any, id: any) {
    localStorage.removeItem("projects");
    localStorage.removeItem("projectId");
    return this.http.put<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.provisions + "/vpcs/" + id, request, this.getHeaders());
  }
  createIpPublic(IP: any): Observable<any>  {
    return this.http.post<HttpResponse<any>>(this.baseUrl + this.ENDPOINT.orders, IP, this.getHeaders());
  }
  getStepBlock(name:string): Observable<any> {
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.configurations + '?name=' +name);
  }
  getTotalAmount(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders + '/totalamount',
      data
    );
  }

  
  getProductActivebyregion(catalog:string[], regionid:number): Observable<any> {
    const catalogString = catalog.join(',');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.catalogs +'/products/activebyregion?catalogs=' +catalogString + '&regionid=' + regionid);
  }
}
