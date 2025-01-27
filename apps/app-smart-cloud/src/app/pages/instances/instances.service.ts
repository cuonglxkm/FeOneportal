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
import { OfferDetail } from '../../shared/models/catalog.model';
import { SnapshotVolumeDto } from 'src/app/shared/dto/snapshot-volume.dto';

@Injectable({
  providedIn: 'root',
})
export class InstancesService extends BaseService {

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) public tokenService: ITokenService
  ) {
    super(tokenService);
  }

  //	Mã hành động : shutdown, resume, suspend, rescue, unrescue,attachinterface,detachinterface, start, restart
  postAction(data: any): Observable<any> {
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + '/instances/action',
      data,
      this.getHeaders()
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
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getAllIPSubnet(regionId: any): Observable<any> {
    let url_ = `/Ip/subnet/${regionId}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getAllSecurityGroup(
    regionId: any,
    userId: any,
    projectId: any
  ): Observable<any> {
    let url_ = `/security_group/getall?userId=${userId}&regionId=${regionId}&projectId=${projectId}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getAllIPPublic(
    projectId: number,
    ipAddress: string,
    customerId: number,
    regionId: number,
    pageSize: number,
    currentPage: number,
    isCheckState: any
  ): Observable<any> {
    let url_ = `/Ip?projectId=${projectId}&customerId=${customerId}&regionId=${regionId}&pageSize=${pageSize}&currentPage=${currentPage}&isCheckState=${isCheckState}&ipAddress=${ipAddress}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getAllSSHKey(
    regionId: any,
    userId: any,
    pageSize: any,
    currentPage: any
  ): Observable<any> {
    let url_ = `/keypair?regionId=${regionId}&userId=${userId}&pageSize=${pageSize}&currentPage=${currentPage}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
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
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getImageById(id: number): Observable<{}> {
    let url_ = `/images/${id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getAllImageType(): Observable<{}> {
    let url_ = `/images/imageTypes`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
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

    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getById(id: number, checkState: boolean = true): Observable<any> {
    let url_ = `/instances/${id}?checkState=${checkState}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_, {
      headers: this.getHeaders().headers,
    });
  }

  delete(id: number): Observable<any> {
    let url_ = `/instances/${id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.delete<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders,
      data,
      this.getHeaders()
    );
  }

  resetpassword(data: any): Observable<any> {
    let url_ = `/instances/resetpassword?id=${data.id}&newPassword=${data.newPassword}`;
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      '',
      this.getHeaders()
    );
  }

  changePassword(id: number, newPassword: string) {
    const encodedPassword = encodeURIComponent(newPassword);
    let url_ = `/instances/${id}/change_password?newPassword=${encodedPassword}`;
    return this.http.post(this.baseUrl + this.ENDPOINT.provisions + url_, '', {
      headers: this.getHeaders().headers,
      responseType: 'text',
    });
  }

  rebuild(data: any) {
    let url_ = `/instances/rebuild`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      { responseType: 'text', headers: this.getHeaders().headers }
    );
  }

  update(data: any): Observable<any> {
    let url_ = `/instances/${data.id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.put<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      data,
      this.getHeaders()
    );
  }

  getInstanceById(id: number) {
    return this.http.get<InstancesModel>(
      this.baseUrl + this.ENDPOINT.provisions + `/instances/${id}`,
      this.getHeaders()
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
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getConsoleUrl(id: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl + this.ENDPOINT.provisions}/instances/${id}/console`,
      this.getHeaders()
    );
  }

  getPortByInstance(instanceId: number, region: number): Observable<any> {
    let url_ = `/instances/port?instanceId=${instanceId}&region=${region}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getBlockStorage(id: number): Observable<any> {
    return this.http.get<any>(
      `${
        this.baseUrl + this.ENDPOINT.provisions
      }/instances/${id}/instance-attachments`,
      this.getHeaders()
    );
  }

  updatePortVM(data: any) {
    let url_ = `/instances/updateport`;
    return this.http.put(this.baseUrl + this.ENDPOINT.provisions + url_, data, {
      headers: this.getHeaders().headers,
      responseType: 'text',
    });
  }

  getListOffers(regionId: number, unitOfMeasure: string): Observable<any> {
    return this.http.get<any>(
      `${
        this.baseUrl + this.ENDPOINT.catalogs
      }/offers?regionId=${regionId}&unitOfMeasure=${unitOfMeasure}`,
      this.getHeaders()
    );
  }
  getTypeCatelogOffers(
    regionId: number,
    unitOfMeasureProduct: string
  ): Observable<any> {
    return this.http.get<any>(
      `${
        this.baseUrl + this.ENDPOINT.catalogs
      }/offers?regionId=${regionId}&unitOfMeasureProduct=${unitOfMeasureProduct}`,
      this.getHeaders()
    );
  }

  getTotalAmount(data: any): Observable<any> {
    return this.http
      .post<any>(
        this.baseUrl + this.ENDPOINT.orders + '/totalamount',
        data,
        this.getHeaders()
      )
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

  getPrices(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + this.ENDPOINT.orders + '/totalamount',
      data,
      this.getHeaders()
    );
  }

  getListOffersByProductId(
    productId: string,
    regionId: string
  ): Observable<OfferDetail[]> {
    return this.http.get<OfferDetail[]>(
      `${
        this.baseUrl + this.ENDPOINT.catalogs
      }/offers?productId=${productId}&regionId=${regionId}`,
      this.getHeaders()
    );
  }

  getListOffersByProductIdNoRegion(
    productId: string,
  ): Observable<OfferDetail[]> {
    return this.http.get<OfferDetail[]>(
      `${
        this.baseUrl + this.ENDPOINT.catalogs
      }/offers?productId=${productId}`,
      this.getHeaders()
    );
  }

  getDetailProductByUniqueName(name: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl + this.ENDPOINT.catalogs}/products?uniqueName=${name}`,
      this.getHeaders()
    );
  }

  getListAllPortByNetwork(networkId: string, region: number): Observable<any> {
    let url_ = `/vlans/listallportbynetworkid?networkId=${networkId}&region=${region}`;
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getInfoVPC(productId: number): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + this.ENDPOINT.provisions + '/projects/' + productId,
      this.getHeaders()
    );
  }

  checkExistName(
    name: string,
    regionId: number,
    projectId: number
  ): Observable<boolean> {
    let url_ = `/instances/exist-instancename?name=${name}&regionId=${regionId}&projectId=${projectId}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<boolean>(
      this.baseUrl + this.ENDPOINT.provisions + url_,
      this.getHeaders()
    );
  }

  getVlanSubnets(
    pageSize: number,
    pageNumber: number,
    region: number,
    networkCloudId: string
  ) {
    return this.http.get<any>(
      this.baseUrl +
        this.ENDPOINT.provisions +
        `/vlans/vlansubnets?pageSize=${pageSize}&pageNumber=${pageNumber}&region=${region}&networkCloudId=${networkCloudId}`,
      this.getHeaders()
    );
  }

  checkflavorforimage(
    imageId: number,
    storage: number,
    ram: number,
    cpu: number
  ): Observable<any> {
    let url_ = `/instances/checkflavorforimage?imageId=${imageId}&storage=${storage}&ram=${ram}&cpu=${cpu}`;
    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  checkIpAvailableToListSubnet(data: any): Observable<any> {
    return this.http.post<any>(
      this.baseUrl +
        this.ENDPOINT.provisions +
        '/vlans/CheckIpAvailableToListSubnet',
      data,
      this.getHeaders()
    );
  }

  getSnapshotsByInstance(id: string | number){
    return this.http.get<SnapshotVolumeDto[]>(this.baseUrl + this.ENDPOINT.provisions + '/vlsnapshots/getbyinstance/' +  id, {headers: this.getHeaders().headers})
  }
}
