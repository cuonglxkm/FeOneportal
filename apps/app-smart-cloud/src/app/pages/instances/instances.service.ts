import { Inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Flavors, InstancesModel } from './instances.model';
import { BaseService } from 'src/app/shared/services/base.service';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class InstancesService extends BaseService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      user_root_id: this.tokenService.get()?.userId,
      Authorization: 'Bearer ' + this.tokenService.get()?.token,
    }),
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService
  ) {
    super();
  }

  //	Mã hành động : shutdown, resume, suspend, rescue, unrescue,attachinterface,detachinterface, start, restart
  postAction(data: any) {
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + '/instances/action',
      data,
      { responseType: 'text' }
    );
  }

  //hệ điều hành là Image, gói cấu hình là Flavors

  getAllSecurityGroupByInstance(
    instanceId: any,
    regionId: any,
    userId: any,
    projectId: any
  ): Observable<any> {
    let url_ = `/security_group/getbyinstace?instanceId=${instanceId}&userId=${userId}&regionId=${regionId}&projectId=${projectId}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getAllIPSubnet(regionId: any): Observable<any> {
    let url_ = `/Ip/subnet/${regionId}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getAllSecurityGroup(
    regionId: any,
    userId: any,
    projectId: any
  ): Observable<any> {
    let url_ = `/security_group/getall?userId=${userId}&regionId=${regionId}&projectId=${projectId}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getAllIPPublic(
    regionId: any,
    customerId: any,
    status: any,
    pageSize: any,
    currentPage: any,
    isCheckState: any,
    ipAddress: any
  ): Observable<any> {
    let url_ = `/Ip?status=${status}&customerId=${customerId}&regionId=${regionId}&pageSize=${pageSize}&currentPage=${currentPage}&isCheckState=${isCheckState}&ipAddress=${ipAddress}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getAllSSHKey(
    vpcId: any,
    regionId: any,
    userId: any,
    pageSize: any,
    currentPage: any
  ): Observable<any> {
    let url_ = `/keypair?vpcId=${vpcId}&regionId=${regionId}&userId=${userId}&pageSize=${pageSize}&currentPage=${currentPage}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getAllSnapshot(
    show: any,
    type: any,
    region: any,
    customerId: any
  ): Observable<any> {
    let url_ = `/images?show=${show}&type=${type}&region=${region}&customerId=${customerId}`;
    // let url_ = `/images?region=${region}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getImageById(id: number): Observable<{}> {
    let url_ = `/images/${id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getAllImageType(): Observable<{}> {
    let url_ = `/images/imageTypes`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getAllFlavors(
    show: any,
    region: any,
    isBasic: any,
    isVpc: any,
    showAll: any
  ): Observable<Flavors[]> {
    let url_ = `/flavors?show=${show}&region=${region}&isBasic=${isBasic}&isVpc=${isVpc}&showAll=${showAll}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<Flavors[]>(
      this.baseUrl + this.ENDPOINT.provisions + url_
    );
  }

  search(
    pageNumber: number,
    pageSize: number,
    region: number,
    projectId: number,
    searchValue: string = '',
    status: string = '',
    isCheckState: boolean,
    userId: number
  ): Observable<any> {
    if (searchValue == undefined) searchValue = '';
    let url_ = `/instances/getpaging?pageNumber=${pageNumber}&pageSize=${pageSize}&region=${region}&projectId=${projectId}&searchValue=${searchValue}&status=${status}&isCheckState=${isCheckState}&userId=${userId}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getById(id: number, checkState: boolean = true): Observable<any> {
    let url_ = `/instances/${id}?checkState=${checkState}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.httpOptions.headers,
    });
  }

  delete(id: number): Observable<any> {
    let url_ = `/instances/${id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.delete<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_
    );
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders,
      data,
      this.httpOptions
    );
  }

  resetpassword(data: any): Observable<any> {
    let url_ = `/instances/resetpassword?id=${data.id}&newPassword=${data.newPassword}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      ''
    );
  }

  rebuild(data: any) {
    let url_ = `/instances/rebuild`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      { responseType: 'text' }
    );
  }

  update(data: any): Observable<any> {
    let url_ = `/instances/${data.id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.put<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data
    );
  }

  getInstanceById(id: number) {
    return this.http.get<InstancesModel>(
      this.baseUrl + this.ENDPOINT.provisions + `/instances/${id}`
    );
  }

  getMonitorByCloudId(
    cloudId: string,
    regionId: number,
    during: number,
    type: string
  ): Observable<any> {
    let url_ = `/instances/monitor?instanceId=${cloudId}&regionId=${regionId}&during=${during}&type=${type}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getConsoleUrl(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl + this.ENDPOINT.provisions}/instances/${id}/console`
    );
  }

  getPortByInstance(instanceId: number, region: number): Observable<any> {
    let url_ = `/instances/port?instanceId=${instanceId}&region=${region}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getBlockStorage(id: number): Observable<any> {
    return this.http.get<any>(
      `${
        this.baseUrl + this.ENDPOINT.provisions
      }/instances/${id}/instance-attachments`
    );
  }

  updatePortVM(data: any) {
    let url_ = `/instances/updateport`;
    return this.http.put<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data
    );
  }

  getListOffers(regionId: number, unitOfMeasure: string): Observable<any> {
    return this.http.get<any>(
      `${
        this.baseUrl + this.ENDPOINT.catalogs
      }/offers?regionId=${regionId}&unitOfMeasure=${unitOfMeasure}`
    );
  }

  getTotalAmount(data: any): Observable<any> {
    return this.http
      .post<any>(this.baseUrl + this.ENDPOINT.orders + '/totalamount', data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.error('login');
            // Redirect to login page or show unauthorized message
            this.router.navigate(['/passport/login']);
          } else if (error.status === 404) {
            // Handle 404 Not Found error
            console.error('Resource not found');
          }
          return throwError(error);
        })
      );
  }

  getListOffersByProductId(productId: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl + this.ENDPOINT.catalogs}/offers?productId=${productId}`
    );
  }

  getDetailProductByUniqueName(name: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl + this.ENDPOINT.catalogs}/products?uniqueName=${name}`
    );
  }

  getListAllPortByNetwork(networkId: string, region: number): Observable<any> {
    let url_ = `/vlans/listallportbynetworkid?networkId=${networkId}&region=${region}`;
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getInfoVPC(productId: number): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + '/projects/' + productId
    );
  }

  checkExistName(instanceId: number, name: string): Observable<boolean> {
    let url_ = `/instances/exist-instancename?instanceId=${instanceId}&name=${name}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<boolean>(
      this.baseUrl + this.ENDPOINT.provisions + url_
    );
  }
}
