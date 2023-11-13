import { Inject, Injectable, Optional, inject } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Query,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { Observable, from, map } from 'rxjs';
import firebase from 'firebase/compat/app';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Flavors, Images, InstancesModel } from './instances.model';
import { SearchCommonVO, PageInfo } from 'src/app/core/models/interfaces/types';
import { BaseHttpService } from 'src/app/core/services/base-http.service';

@Injectable({
  providedIn: 'root',
})
export class InstancesService {
  private readonly http2 = inject(HttpClient);
  private readonly baseUrl = 'http://172.16.68.200:1009';

  constructor(public http: BaseHttpService) {}

  //	Mã hành động : shutdown, resume, suspend, rescue, unrescue,attachinterface,detachinterface, start, restart
  postAction(id: number, data: any): Observable<any> {
    //let url_ = `/images?show=${show}&region=${region}&type=${type}&customerId=${customerId}`;
    let url_ = `/instances/${id}/action`;
    url_ = url_.replace(/[?&]$/, '');
    // const _body = JSON.stringify(data)
    return this.http2.post<any>(this.baseUrl + url_, data);
  }

  //hệ điều hành là Image, gói cấu hình là Flavors
  getAllSecurityGroup(
    regionId: any,
    userId: any,
    projectId: any
  ): Observable<any> {
    let url_ = `/security_group/get_all?userId=${userId}&regionId=${regionId}&projectId=${projectId}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http2.get<any>(this.baseUrl + url_);
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
    return this.http2.get<any>(this.baseUrl + url_);
  }

  getAllSnapshot(
    show: any,
    region: any,
    type: any,
    customerId: any
  ): Observable<any> {
    //let url_ = `/images?show=${show}&region=${region}&type=${type}&customerId=${customerId}`;
    let url_ = `/images?region=${region}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http2.get<any>(this.baseUrl + url_);
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
    return this.http2.get<Images[]>(this.baseUrl + url_);
  }

  getAllImageType(): Observable<{}> {
    let url_ = `/images/imageTypes`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http2.get(this.baseUrl + url_);
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
    return this.http2.get<Flavors[]>(this.baseUrl + url_);
  }

  search(
    pageNumber: number,
    pageSize: number,
    region: number,
    searchValue: string = '',
    status: string = ''
  ): Observable<any> {
    if (searchValue == undefined) searchValue = '';
    let url_ = `/instances/getpaging?pageNumber=${pageNumber}&pageSize=${pageSize}&searchValue=${searchValue}&status=${status}&region=${region}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http2.get<any>(this.baseUrl + url_);
  }

  getById(id: number, checkState: boolean = false): Observable<any> {
    let url_ = `/instances/${id}?checkState=${checkState}`;
    url_ = url_.replace(/[?&]$/, '');

    return this.http2.get<any>(this.baseUrl + url_);
  }

  delete(id: number): Observable<any> {
    let url_ = `/instances/${id}`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http2.delete<any>(this.baseUrl + url_);
  }

  create(data: any): Observable<any> {
    let url_ = `/instances`;
    url_ = url_.replace(/[?&]$/, '');
    return this.http2.post<any>(this.baseUrl + url_, data);
  }

  update(todoId: string, todoData: InstancesModel): Observable<InstancesModel> {
    return this.http.put<InstancesModel>(`/api/todos/${todoId}`, todoData);
  }
}
