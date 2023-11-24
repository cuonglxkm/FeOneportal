import { Inject, Injectable, Optional, inject } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Query,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { Observable, from, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Flavors, Images, InstancesModel } from './instances.model';
import { BaseService } from 'src/app/shared/services/base.service';

@Injectable({
  providedIn: 'root',
})
export class InstancesService extends BaseService{

  constructor(private http: HttpClient) {
    super();
  }
  //	Mã hành động : shutdown, resume, suspend, rescue, unrescue,attachinterface,detachinterface, start, restart
  postAction(id: number, data: any): Observable<any> {
    //let url_ = `/images?show=${show}&region=${region}&type=${type}&customerId=${customerId}`;
    let url_ = `/instances/${id}/action`;
    url_ = url_.replace(/[?&]$/, '');
    // const _body = JSON.stringify(data)
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
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
    currentPage: any,
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

  getAllImage(
    show: any,
    region: any,
    type: any,
    customerId: any
  ): Observable<Images[]> {
    let url_ = `/images?region=${region}&type=${type}&customerId=${customerId}`;
    // let url_ = `/images?region=${region}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.get<Images[]>(this.baseUrl + this.ENDPOINT.provisions + url_);
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
    return this.http.get<Flavors[]>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  search(
    pageNumber: number,
    pageSize: number,
    region: number,
    searchValue: string = '',
    status: string = '',
    userId: number
  ): Observable<any> {
    if (searchValue == undefined) searchValue = '';
    let url_ = `/instances/getpaging?pageNumber=${pageNumber}&pageSize=${pageSize}&region=${region}&searchValue=${searchValue}&status=${status}&userId=${userId}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  getById(id: number, checkState: boolean = false): Observable<any> {
    let url_ = `/instances/${id}?checkState=${checkState}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http.get<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  delete(id: number): Observable<any> {
    let url_ = `/instances/${id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.delete<any>(this.baseUrl + this.ENDPOINT.provisions + url_);
  }

  create(data: any): Observable<any> {
    let url_ = `/instances`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
  }

  resetpassword(data: any): Observable<any> {
    let url_ = `/instances/resetpassword?id=${data.id}&newPassword=${data.newPassword}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + url_, '');
  }

  rebuild(data: any): Observable<any> {
    let url_ = `/instances/rebuild`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.post<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
  }

  update(data: any): Observable<any> {
    let url_ = `/instances/${data.id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http.put<any>(this.baseUrl + this.ENDPOINT.provisions + url_, data);
  }
}
